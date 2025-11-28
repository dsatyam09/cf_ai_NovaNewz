# Cloudflare Workers Setup Guide

## Prerequisites

1. Cloudflare account with Workers AI enabled
2. Cloudflare D1 database created
3. Cloudflare Vectorize index created

## Setup Steps

### 1. Create D1 Database

```bash
npx wrangler d1 create novanewz-db
```

This will output a database ID. Copy it.

### 2. Run Database Schema

```bash
npx wrangler d1 execute novanewz-db --file=./schema.sql
```

### 3. Create Vectorize Index

```bash
npx wrangler vectorize create novanewz-vectors \
  --dimensions=768 \
  --metric=cosine
```

### 4. Update wrangler.toml

Uncomment and fill in the database_id and index_name in `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "novanewz-db"
database_id = "YOUR_DATABASE_ID_HERE"

[[vectorize]]
binding = "VECTORIZE"
index_name = "novanewz-vectors"
```

### 5. Deploy Workers

```bash
npx wrangler deploy
```

## API Endpoints

- `GET /articles` - List all articles
- `POST /articles` - Create new article (auto-generates embedding)
- `GET /articles/:id` - Get article by ID
- `PUT /articles/:id` - Update article (regenerates embedding)
- `DELETE /articles/:id` - Delete article
- `POST /embed` - Generate embedding for text
- `POST /search` - Vector search for articles
- `POST /history` - Generate AI summary and timeline

## Workers AI Models Used

- `@cf/baai/bge-base-en-v1.5` - For embeddings (768 dimensions)
- `@cf/meta/llama-3.3-8b-instruct` - For text summarization

## Testing

After deployment, test the API endpoints:

```bash
# Create an article
curl -X POST https://your-worker.workers.dev/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article","content":"This is a test article about AI.","author":"Test Author","tags":["ai","tech"]}'

# Search articles
curl -X POST https://your-worker.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query":"artificial intelligence","topK":5}'

# Generate history
curl -X POST https://your-worker.workers.dev/history \
  -H "Content-Type: application/json" \
  -d '{"query":"artificial intelligence"}'
```

