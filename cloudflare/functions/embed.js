// Generate embedding API
// Uses Cloudflare Workers AI to generate embeddings and stores them in Vectorize

export default {
  async fetch(request, env) {
    const { method } = request;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (method === "POST") {
        const body = await request.json();
        const { text, article_id, title, tags, published_at } = body;

        if (!text) {
          return new Response(JSON.stringify({ error: "Text is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate embedding using Workers AI
        // Using @cf/baai/bge-base-en-v1.5 for embeddings (768 dimensions)
        if (!env.AI) {
          return new Response(
            JSON.stringify({ error: "AI binding not configured" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
          text: [text],
        });

        if (!embeddingResponse || !embeddingResponse.data || embeddingResponse.data.length === 0) {
          return new Response(
            JSON.stringify({ error: "Failed to generate embedding" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const embedding = embeddingResponse.data[0];

        // Store embedding in Vectorize if article_id is provided
        if (article_id && env.VECTORIZE) {
          try {
            const vectorId = `article_${article_id}`;
            const metadata = {
              article_id: parseInt(article_id),
              title: title || "",
              tags: tags || [],
              published_at: published_at || new Date().toISOString(),
            };

            // Insert or upsert the vector
            await env.VECTORIZE.insert([
              {
                id: vectorId,
                values: embedding,
                metadata: metadata,
              },
            ]);
          } catch (vectorError) {
            console.error("Error storing embedding in Vectorize:", vectorError);
            // Continue even if Vectorize storage fails - return the embedding anyway
          }
        }

        return new Response(
          JSON.stringify({
            embedding: embedding,
            article_id: article_id || null,
            dimensions: embedding.length,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    } catch (error) {
      console.error("Embed API error:", error);
      return new Response(
        JSON.stringify({ error: error.message || "Internal server error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};
