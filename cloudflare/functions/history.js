// Generate history API
// Retrieves relevant articles via vector search, then uses Llama to generate summary and timeline

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
        const { query, article_id } = body;

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

        // 1. Generate embedding for query
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

        // 2. Query Vectorize to find relevant articles (get top 8-10 for timeline)
        const vectorResults = await env.VECTORIZE.query(queryEmbedding, {
          topK: 10,
          returnValues: false,
          returnMetadata: true,
        });

        const matches = vectorResults.matches || [];

        if (matches.length === 0) {
          return new Response(
            JSON.stringify({
              summary: "No relevant articles found for this topic.",
              timeline: [],
              sources: [],
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // 3. Retrieve full article content from D1
        const articleIds = matches
          .map((result) => result.metadata?.article_id)
          .filter((id) => id !== undefined && id !== null);

        if (articleIds.length === 0) {
          return new Response(
            JSON.stringify({
              summary: "No relevant articles found for this topic.",
              timeline: [],
              sources: [],
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const placeholders = articleIds.map(() => "?").join(",");
        const articlesResult = await env.DB.prepare(
          `SELECT * FROM articles WHERE id IN (${placeholders}) ORDER BY published_at ASC`
        )
          .bind(...articleIds)
          .all();

        const articles = articlesResult.results || [];

        if (articles.length === 0) {
          return new Response(
            JSON.stringify({
              summary: "No relevant articles found for this topic.",
              timeline: [],
              sources: [],
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // 4. Prepare articles for summarization
        // Format articles with dates and content for Llama
        const articlesText = articles
          .map((article, index) => {
            const date = article.published_at
              ? new Date(article.published_at).toLocaleDateString()
              : "Unknown date";
            return `[${index + 1}] Date: ${date}\nTitle: ${article.title}\nContent: ${article.content.substring(0, 500)}...`;
          })
          .join("\n\n");

        // 5. Generate summary using Llama
        // Note: Model name may vary. Common options:
        // - @cf/meta/llama-3-8b-instruct
        // - @cf/meta/llama-3.1-8b-instruct
        // - @cf/meta/llama-3.3-8b-instruct
        const summaryPrompt = `You are a tech news historian. Based on the following articles about "${query}", write a concise historical summary (3-6 sentences) that explains the key developments and context. Only use information from the provided articles - do not make up facts.

Articles:
${articlesText}

Write a concise historical summary:`;

        let summary = "";
        try {
          // Try llama-3-8b-instruct first (most commonly available)
          const modelName = "@cf/meta/llama-3-8b-instruct";
          const summaryResponse = await env.AI.run(modelName, {
            messages: [
              {
                role: "system",
                content: "You are a tech news historian. Write concise, factual summaries based only on the provided articles.",
              },
              {
                role: "user",
                content: summaryPrompt,
              },
            ],
            max_tokens: 300,
          });

          if (summaryResponse && summaryResponse.response) {
            summary = summaryResponse.response.trim();
          } else {
            // Fallback: create a simple summary from article titles
            summary = `This topic has been covered in ${articles.length} article(s). Key developments include: ${articles
              .slice(0, 3)
              .map((a) => a.title)
              .join(", ")}.`;
          }
        } catch (summaryError) {
          console.error("Error generating summary:", summaryError);
          // Fallback summary
          summary = `This topic has been covered in ${articles.length} article(s) spanning from ${articles[0]?.published_at ? new Date(articles[0].published_at).toLocaleDateString() : "unknown"} to ${articles[articles.length - 1]?.published_at ? new Date(articles[articles.length - 1].published_at).toLocaleDateString() : "unknown"}.`;
        }

        // 6. Generate timeline (6-10 key events)
        // Sort articles by date and create timeline entries
        const sortedArticles = [...articles].sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateA - dateB;
        });

        const timeline = sortedArticles.slice(0, 10).map((article) => {
          const date = article.published_at
            ? new Date(article.published_at).toLocaleDateString()
            : "Unknown date";
          
          // Create a one-line event description from title
          const event = article.title.length > 80 
            ? article.title.substring(0, 77) + "..."
            : article.title;

          return {
            date: date,
            event: event,
          };
        });

        // 7. Prepare sources list
        const sources = articles.map((article) => {
          const tags = article.tags
            ? typeof article.tags === "string"
              ? JSON.parse(article.tags)
              : article.tags
            : [];

          return {
            id: article.id,
            title: article.title,
            date: article.published_at
              ? new Date(article.published_at).toLocaleDateString()
              : "Unknown date",
            link: `/articles/${article.id}`,
            tags: tags,
          };
        });

        return new Response(
          JSON.stringify({
            summary: summary,
            timeline: timeline,
            sources: sources,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    } catch (error) {
      console.error("History API error:", error);
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
