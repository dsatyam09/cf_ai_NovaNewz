# Quick Start Guide - Step 4 Data Ingestion

This guide walks you through setting up and running the data ingestion pipeline for NovaNewz.

## Prerequisites

- ✅ Python 3.8+ installed
- ✅ Node.js and npm installed
- ✅ Cloudflare account (free tier works)
- ⚠️ Cloudflare Workers, D1, and Vectorize configured (see below)

## Setup Steps

### 1. Install Python Dependencies

```bash
cd ingestion
pip install -r requirements.txt
```

Or if using the virtual environment:

```bash
source ../.venv/bin/activate  # On macOS/Linux
# Or on Windows: ..\.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Cloudflare Resources

#### A. Create D1 Database

```bash
cd ../cloudflare
npx wrangler d1 create novanewz-db
```

This will output something like:
```
✅ Successfully created DB 'novanewz-db'!
database_id = "abc123def456..."
```

Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "novanewz-db"
database_id = "abc123def456..."  # Your actual ID
```

#### B. Apply Database Schema

```bash
npx wrangler d1 execute novanewz-db --file=schema.sql
```

#### C. Create Vectorize Index

```bash
npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine
```

Update `wrangler.toml`:

```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "novanewz-vectors"
```

### 3. Deploy Workers (Option 1: Production)

Deploy to Cloudflare's edge:

```bash
npx wrangler deploy
```

This will output your Worker URL:
```
✨ Published novanewz-api
   https://novanewz-api.your-subdomain.workers.dev
```

**Save this URL** - you'll need it for ingestion!

### 4. Run Workers Locally (Option 2: Development)

For local testing with D1 and Vectorize:

```bash
npx wrangler dev
```

This starts a local server at `http://localhost:8787`

**Note**: Local dev mode has limitations:
- Workers AI requires deployed Workers (not available locally)
- Vectorize works but uses local storage
- D1 uses local SQLite database

## Running Data Ingestion

### Step 1: Test API Connection

Before ingesting data, verify your API is working:

```bash
cd ../ingestion

# Test deployed Workers
python test_api.py https://novanewz-api.your-subdomain.workers.dev

# Or test local development
python test_api.py http://localhost:8787
```

Expected output:
```
Testing NovaNewz API...
API URL: https://novanewz-api.your-subdomain.workers.dev

1. Testing GET /articles...
   ✓ Success! Found 0 articles

2. Testing POST /articles...
   ✓ Success! Created article ID: 1

3. Testing POST /embed...
   ✓ Success! Generated embedding (768 dimensions)

4. Testing POST /search...
   ✓ Success! Found 1 results

5. Testing POST /history...
   ✓ Success! Generated history with X timeline events

API Test Complete!
```

### Step 2: Run Basic Ingestion (Recommended)

Start with a small sample to test everything works:

```bash
# Ingest 1000 articles (takes ~15-20 minutes)
python ingest_data.py \
  --samples 1000 \
  --api-url https://novanewz-api.your-subdomain.workers.dev
```

### Step 3: Full Ingestion

Once you've verified the small sample works:

```bash
# Ingest 5000 articles (takes ~60-90 minutes)
python ingest_data.py \
  --samples 5000 \
  --api-url https://novanewz-api.your-subdomain.workers.dev
```

### Step 4: Verify Results

```bash
# Verify the ingestion worked
python ingest_data.py \
  --verify-only \
  --api-url https://novanewz-api.your-subdomain.workers.dev
```

## Ingestion Options

### Preview Articles Before Ingesting

```bash
python ingest_data.py \
  --samples 5000 \
  --preview 10 \
  --api-url https://your-worker.workers.dev
```

This shows 10 sample articles and asks for confirmation.

### Skip Embeddings (Faster)

For testing D1 insertion without embeddings:

```bash
python ingest_data.py \
  --samples 1000 \
  --skip-embeddings \
  --api-url https://your-worker.workers.dev
```

**Note**: Articles won't be searchable without embeddings!

### Download Only (Inspect Dataset)

```bash
python ingest_data.py \
  --samples 5000 \
  --download-only
```

### Custom Sample Size

```bash
# Ingest 10,000 articles (takes ~2-3 hours)
python ingest_data.py \
  --samples 10000 \
  --api-url https://your-worker.workers.dev
```

## Troubleshooting

### Error: "Database not configured"

**Problem**: D1 database not bound in wrangler.toml

**Solution**:
1. Uncomment D1 section in `wrangler.toml`
2. Add your `database_id`
3. Redeploy: `npx wrangler deploy`

### Error: "AI binding not configured"

**Problem**: Workers AI not available (usually in local dev)

**Solution**: Deploy to Cloudflare instead of running locally:
```bash
npx wrangler deploy
```

### Error: "Failed to generate embedding"

**Problem**: Vectorize not configured or Workers AI unavailable

**Solution**:
1. Create Vectorize index: `npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine`
2. Update `wrangler.toml`
3. Redeploy: `npx wrangler deploy`

Or skip embeddings initially:
```bash
python ingest_data.py --skip-embeddings --samples 1000
```

### Slow Ingestion Speed

**Problem**: Taking too long to ingest articles

**Solutions**:
1. Reduce sample size: `--samples 1000`
2. Skip embeddings: `--skip-embeddings`
3. Increase delay in script: Edit `DELAY_BETWEEN_REQUESTS` in `ingest_data.py`
4. Check your internet connection

### Connection Timeouts

**Problem**: Requests timing out

**Solutions**:
1. Verify Workers are deployed: `npx wrangler deploy`
2. Check Worker URL is correct
3. Test API: `python test_api.py https://your-worker.workers.dev`
4. Check Cloudflare dashboard for errors

### Rate Limiting

**Problem**: Getting rate limited by Cloudflare

**Solutions**:
1. Increase `DELAY_BETWEEN_REQUESTS` in `ingest_data.py`
2. Use smaller batches
3. Consider Cloudflare paid plan for higher limits

## Expected Timeline

| Articles | With Embeddings | Without Embeddings |
|----------|----------------|-------------------|
| 1,000    | 15-20 min      | 8-10 min          |
| 5,000    | 60-90 min      | 30-45 min         |
| 10,000   | 2-3 hours      | 60-90 min         |

*Times are approximate and depend on network speed and API response times*

## Verification Checklist

After ingestion, verify:

- [ ] Articles visible in D1 database
- [ ] Embeddings stored in Vectorize
- [ ] Search functionality works
- [ ] Web interface displays articles
- [ ] Article details page works
- [ ] History generation works

## Next Steps

Once ingestion is complete:

1. **Visit Web Interface**: Open `http://localhost:3000` (or your deployed URL)
2. **Test Reporter Console**: `/reporter` - View all ingested articles
3. **Test Search**: `/history` - Try semantic search queries
4. **Test AI History**: Generate timeline summaries
5. **Monitor Usage**: Check Cloudflare dashboard for resource usage

## Common Commands Reference

```bash
# Create D1 database
npx wrangler d1 create novanewz-db

# Apply schema
npx wrangler d1 execute novanewz-db --file=schema.sql

# Create Vectorize index
npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine

# Deploy Workers
npx wrangler deploy

# Run locally
npx wrangler dev

# Test API
python test_api.py https://your-worker.workers.dev

# Ingest data
python ingest_data.py --samples 5000 --api-url https://your-worker.workers.dev

# Verify ingestion
python ingest_data.py --verify-only --api-url https://your-worker.workers.dev
```

## Resource Limits (Free Tier)

Cloudflare Free Tier limits:
- **D1**: 5 GB storage, 5 million rows
- **Vectorize**: 100k vectors, 10 million queries/month
- **Workers AI**: 10k neurons/day
- **Workers**: 100k requests/day

**Recommendation**: Start with 5,000 articles to stay well within limits.

## Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review `ingestion/README.md`
3. Check Cloudflare dashboard for errors
4. Review Worker logs: `npx wrangler tail`
5. Test individual endpoints with `curl` or Postman

## Summary

Step 4 is complete when:
1. ✅ D1 database is created and schema applied
2. ✅ Vectorize index is created
3. ✅ Workers are deployed
4. ✅ Test API passes all checks
5. ✅ Articles are successfully ingested
6. ✅ Embeddings are generated and stored
7. ✅ Verification confirms everything works
8. ✅ Web interface displays articles correctly

You're now ready to test the full NovaNewz platform with real data! 🚀
