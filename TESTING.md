# Testing Guide

## Prerequisites

1. Cloudflare D1 database created and schema applied
2. Cloudflare Vectorize index created (768 dimensions, cosine metric)
3. Cloudflare Workers deployed with proper bindings
4. Workers AI enabled in your Cloudflare account

## Step 1: Add Sample Articles

Use the Reporter Console at `/reporter` to create 3-5 sample tech news articles. Example topics:

- "OpenAI releases GPT-4"
- "Apple announces Vision Pro"
- "Google launches Bard AI"
- "Microsoft integrates Copilot"
- "Tesla Autopilot updates"

Each article should have:
- Title
- Content (at least 200-300 words)
- Author
- Tags (comma-separated)
- Published date

## Step 2: Generate Embeddings

After creating articles:

1. Go to Reporter Console
2. Click "Generate Embedding" for each article
3. Verify success message appears
4. Articles are now searchable in Vectorize

**Note:** Embeddings are automatically generated when creating/updating articles via the API, but you can manually trigger them using the button.

## Step 3: Test Vector Search

### Via Frontend
1. Go to `/history`
2. Enter a search query (e.g., "artificial intelligence")
3. Click "Generate History"
4. Verify:
   - Loading spinner appears
   - Summary is displayed (3-6 sentences)
   - Timeline shows 6-10 events
   - Sources list shows relevant articles

### Via API
```bash
curl -X POST https://your-worker.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query":"artificial intelligence","topK":5}'
```

Expected response:
```json
{
  "query": "artificial intelligence",
  "results": [
    {
      "id": 1,
      "title": "Article Title",
      "content": "Article snippet...",
      "score": 0.95,
      "link": "/articles/1"
    }
  ],
  "count": 1
}
```

## Step 4: Test History Generation

### Via Frontend
1. Go to `/history`
2. Search for a topic with multiple articles
3. Verify:
   - Summary is fact-based (no hallucinations)
   - Timeline is chronological
   - Sources match the articles used

### Via API
```bash
curl -X POST https://your-worker.workers.dev/history \
  -H "Content-Type: application/json" \
  -d '{"query":"AI developments"}'
```

Expected response:
```json
{
  "summary": "Concise 3-6 sentence summary...",
  "timeline": [
    {"date": "2024-01-15", "event": "Event description"},
    {"date": "2024-02-20", "event": "Another event"}
  ],
  "sources": [
    {
      "id": 1,
      "title": "Article Title",
      "date": "1/15/2024",
      "link": "/articles/1"
    }
  ]
}
```

## Step 5: Test Article CRUD

### Create Article
1. Go to `/reporter/new`
2. Fill in form fields
3. Submit
4. Verify:
   - Article appears in list
   - Embedding is automatically generated
   - Article is searchable immediately

### Edit Article
1. Click "Edit" on an article
2. Modify content
3. Save
4. Verify:
   - Changes are saved
   - Embedding is regenerated
   - Updated content is searchable

### Delete Article
1. Click "Delete" on an article
2. Confirm deletion
3. Verify article is removed from list

## Step 6: Test Article Detail Page

1. Click on an article title
2. Verify full content is displayed
3. Click "Generate history for this article"
4. Verify history is generated using article title as query

## Troubleshooting

### Embedding Generation Fails
- Check Workers AI is enabled
- Verify model name `@cf/baai/bge-base-en-v1.5` is available
- Check Vectorize index exists and has correct dimensions (768)

### Search Returns No Results
- Verify articles have embeddings in Vectorize
- Check Vectorize index is properly bound in wrangler.toml
- Ensure articles were created with content

### History Summary is Empty
- Verify at least one article exists for the query
- Check Llama model `@cf/meta/llama-3.3-8b-instruct` is available
- Try a different query with more matching articles

### CORS Errors
- Verify CORS headers are set in all Worker functions
- Check API base URL matches your Worker URL
- Ensure frontend and backend are on same domain or CORS is configured

## Performance Testing

1. **Search Speed**: Should return results in < 2 seconds
2. **History Generation**: Should complete in < 10 seconds
3. **Embedding Generation**: Should complete in < 5 seconds per article

## Expected Behavior

- ✅ Articles automatically get embeddings when created/updated
- ✅ Search returns relevant articles sorted by similarity
- ✅ History summaries are grounded in retrieved articles only
- ✅ Timeline is chronological and accurate
- ✅ All UI components show loading states
- ✅ Error messages are clear and helpful

