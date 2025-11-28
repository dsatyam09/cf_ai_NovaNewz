// CRUD API for articles
// Handles GET (list), POST (create) with D1 database

export default {
  async fetch(request, env) {
    const { method } = request;
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (!env.DB) {
        return new Response(
          JSON.stringify({ error: "Database not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // GET - List all articles
      if (method === "GET") {
        const result = await env.DB.prepare(
          "SELECT * FROM articles ORDER BY published_at DESC, created_at DESC"
        ).all();

        const articles = result.results || [];
        
        // Parse tags from JSON string if needed
        const parsedArticles = articles.map((article) => ({
          ...article,
          tags: article.tags ? (typeof article.tags === 'string' ? JSON.parse(article.tags) : article.tags) : [],
        }));

        return new Response(JSON.stringify(parsedArticles), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // POST - Create new article
      if (method === "POST") {
        const body = await request.json();
        const { title, content, tags, author, published_at } = body;

        if (!title || !content) {
          return new Response(
            JSON.stringify({ error: "Title and content are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const now = new Date().toISOString();
        const tagsStr = tags ? JSON.stringify(Array.isArray(tags) ? tags : [tags]) : null;
        const publishedDate = published_at || now;

        // Insert article into D1
        const result = await env.DB.prepare(
          `INSERT INTO articles (title, content, tags, author, published_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           RETURNING *`
        )
          .bind(title, content, tagsStr, author || null, publishedDate, now, now)
          .first();

        if (!result) {
          return new Response(
            JSON.stringify({ error: "Failed to create article" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Parse tags
        const newArticle = {
          ...result,
          tags: result.tags ? (typeof result.tags === 'string' ? JSON.parse(result.tags) : result.tags) : [],
        };

        // Generate embedding for the new article
        if (env.AI && env.VECTORIZE) {
          try {
            const embedUrl = new URL(request.url);
            embedUrl.pathname = "/embed";
            
            // Call embed API internally or generate embedding directly
            const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
              text: [content],
            });

            if (embeddingResponse && embeddingResponse.data && embeddingResponse.data.length > 0) {
              const embedding = embeddingResponse.data[0];
              const vectorId = `article_${newArticle.id}`;
              
              await env.VECTORIZE.insert([
                {
                  id: vectorId,
                  values: embedding,
                  metadata: {
                    article_id: newArticle.id,
                    title: newArticle.title,
                    tags: newArticle.tags,
                    published_at: newArticle.published_at,
                  },
                },
              ]);
            }
          } catch (embedError) {
            console.error("Error generating embedding for new article:", embedError);
            // Continue even if embedding fails - article is still created
          }
        }

        return new Response(JSON.stringify(newArticle), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    } catch (error) {
      console.error("Articles API error:", error);
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
