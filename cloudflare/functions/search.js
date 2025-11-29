// Vector search API
// Generates embedding for query, searches Vectorize, returns top articles from D1

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
        const { query, topK = 10 } = body;

        if (!query) {
          return new Response(JSON.stringify({ error: "Query is required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (!env.AI || !env.VECTORIZE || !env.DB) {
          return new Response(
            JSON.stringify({ error: "AI, Vectorize, or Database not configured" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // 1. Generate embedding for query using Workers AI
        const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
          text: [query],
        });

        if (!embeddingResponse || !embeddingResponse.data || embeddingResponse.data.length === 0) {
          return new Response(
            JSON.stringify({ error: "Failed to generate query embedding" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const queryEmbedding = embeddingResponse.data[0];

        // 2. Query Vectorize for similar articles
        const vectorResults = await env.VECTORIZE.query(queryEmbedding, {
          topK: Math.min(topK, 20), // Limit to 20 max
          returnValues: false,
          returnMetadata: true,
        });

        // Vectorize returns an object with matches array
        const matches = vectorResults.matches || [];

        if (matches.length === 0) {
          return new Response(
            JSON.stringify({
              query,
              results: [],
              count: 0,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // 3. Retrieve full article details from D1
        const articleIds = matches
          .map((result) => result.metadata?.article_id)
          .filter((id) => id !== undefined && id !== null);

        if (articleIds.length === 0) {
          return new Response(
            JSON.stringify({
              query,
              results: [],
              count: 0,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Fetch articles from D1
        const placeholders = articleIds.map(() => "?").join(",");
        const articlesResult = await env.DB.prepare(
          `SELECT * FROM articles WHERE id IN (${placeholders})`
        )
          .bind(...articleIds)
          .all();

        const articles = articlesResult.results || [];

        // 4. Combine vector results with article data, maintaining relevance order
        const results = matches
          .map((vectorResult) => {
            const articleId = vectorResult.metadata?.article_id;
            const article = articles.find((a) => a.id === articleId);

            if (!article) return null;

            // Parse tags
            const tags = article.tags
              ? typeof article.tags === "string"
                ? JSON.parse(article.tags)
                : article.tags
              : [];

            return {
              id: article.id,
              title: article.title,
              content: article.content.substring(0, 200) + "...", // Snippet
              author: article.author,
              published_at: article.published_at,
              tags: tags,
              score: vectorResult.score,
              link: `/articles/${article.id}`,
            };
          })
          .filter((result) => result !== null)
          .sort((a, b) => (b?.score || 0) - (a?.score || 0)); // Sort by relevance score

        return new Response(
          JSON.stringify({
            query,
            results: results,
            count: results.length,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    } catch (error) {
      console.error("Search API error:", error);
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
