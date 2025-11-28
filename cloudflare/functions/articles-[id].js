// Read, Update, Delete specific article
// Handles GET (read), PUT (update), DELETE (delete) with D1 database

export default {
  async fetch(request, env) {
    const { method } = request;
    const url = new URL(request.url);
    
    // Extract article ID from URL path
    const pathParts = url.pathname.split("/");
    const articleId = pathParts[pathParts.length - 1];

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
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

      // GET - Read article by ID
      if (method === "GET") {
        const result = await env.DB.prepare("SELECT * FROM articles WHERE id = ?")
          .bind(parseInt(articleId))
          .first();

        if (!result) {
          return new Response(JSON.stringify({ error: "Article not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Parse tags
        const article = {
          ...result,
          tags: result.tags ? (typeof result.tags === 'string' ? JSON.parse(result.tags) : result.tags) : [],
        };

        return new Response(JSON.stringify(article), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // PUT - Update article
      if (method === "PUT") {
        const body = await request.json();
        const { title, content, tags, author, published_at } = body;

        const now = new Date().toISOString();
        const tagsStr = tags ? JSON.stringify(Array.isArray(tags) ? tags : [tags]) : null;

        const result = await env.DB.prepare(
          `UPDATE articles 
           SET title = ?, content = ?, tags = ?, author = ?, published_at = ?, updated_at = ?
           WHERE id = ?
           RETURNING *`
        )
          .bind(
            title || null,
            content || null,
            tagsStr,
            author || null,
            published_at || null,
            now,
            parseInt(articleId)
          )
          .first();

        if (!result) {
          return new Response(JSON.stringify({ error: "Article not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Parse tags
        const updatedArticle = {
          ...result,
          tags: result.tags ? (typeof result.tags === 'string' ? JSON.parse(result.tags) : result.tags) : [],
        };

        // Regenerate embedding if content changed
        if (content && env.AI && env.VECTORIZE) {
          try {
            const embeddingResponse = await env.AI.run("@cf/baai/bge-base-en-v1.5", {
              text: [content],
            });

            if (embeddingResponse && embeddingResponse.data && embeddingResponse.data.length > 0) {
              const embedding = embeddingResponse.data[0];
              const vectorId = `article_${updatedArticle.id}`;
              
              await env.VECTORIZE.insert([
                {
                  id: vectorId,
                  values: embedding,
                  metadata: {
                    article_id: updatedArticle.id,
                    title: updatedArticle.title,
                    tags: updatedArticle.tags,
                    published_at: updatedArticle.published_at,
                  },
                },
              ]);
            }
          } catch (embedError) {
            console.error("Error regenerating embedding for updated article:", embedError);
            // Continue even if embedding fails
          }
        }

        return new Response(JSON.stringify(updatedArticle), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // DELETE - Delete article
      if (method === "DELETE") {
        // First check if article exists
        const article = await env.DB.prepare("SELECT * FROM articles WHERE id = ?")
          .bind(parseInt(articleId))
          .first();

        if (!article) {
          return new Response(JSON.stringify({ error: "Article not found" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Delete from D1
        const result = await env.DB.prepare("DELETE FROM articles WHERE id = ?")
          .bind(parseInt(articleId))
          .run();

        // Delete from Vectorize if available
        if (env.VECTORIZE) {
          try {
            const vectorId = `article_${articleId}`;
            // Note: Vectorize doesn't have a direct delete method in the current API
            // You may need to upsert with empty values or handle this differently
            // For now, we'll just log it
            console.log(`Vector ${vectorId} should be deleted manually or via Vectorize dashboard`);
          } catch (vectorError) {
            console.error("Error deleting vector:", vectorError);
          }
        }

        return new Response(JSON.stringify({ success: true, deleted: result.meta.changes > 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    } catch (error) {
      console.error("Article by ID API error:", error);
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
