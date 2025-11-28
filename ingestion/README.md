# Data Ingestion Guide

This script downloads the MongoDB Tech News Embeddings dataset from Hugging Face and ingests it into your Cloudflare D1 database and Vectorize index.

## Prerequisites

1. Python 3.8 or higher
2. Cloudflare Workers API deployed and accessible
3. D1 database created and schema applied
4. Vectorize index created (768 dimensions, cosine metric)

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set your API URL (optional, defaults to localhost):

```bash
export API_BASE_URL="https://your-worker.workers.dev"
```

Or pass it as an argument: `--api-url https://your-worker.workers.dev`

## Usage

### Basic Ingestion (5000 articles)

```bash
python ingest_data.py --api-url https://your-worker.workers.dev
```

### Custom Sample Size

```bash
python ingest_data.py --samples 10000 --api-url https://your-worker.workers.dev
```

### Skip Embedding Generation (Faster)

Useful for testing D1 insertion without generating embeddings:

```bash
python ingest_data.py --skip-embeddings --api-url https://your-worker.workers.dev
```

### Download Only (Inspect Dataset)

Download and inspect the dataset without ingesting:

```bash
python ingest_data.py --download-only
```

### Verification Only

Verify existing articles in the database:

```bash
python ingest_data.py --verify-only --api-url https://your-worker.workers.dev
```

### Preview Before Ingesting

Preview transformed articles before ingesting:

```bash
python ingest_data.py --preview 5 --api-url https://your-worker.workers.dev
```

### Test API First

Before ingesting, test that your API is accessible:

```bash
python test_api.py https://your-worker.workers.dev
```

## Dataset Information

- **Source**: Hugging Face - AIatMongoDB/tech-news-embeddings
- **Format**: Parquet files
- **Default Sample**: 5000 articles
- **Columns**: title, content, author, tags, published_at

## Process Flow

1. **Download**: Downloads parquet files from Hugging Face
2. **Transform**: Maps dataset columns to our article schema
3. **Insert**: Posts articles to `/api/articles` endpoint
4. **Embed**: Generates embeddings via `/api/embed` endpoint
5. **Verify**: Tests search functionality and displays sample articles

## Expected Output

```
============================================================
NovaNewz Data Ingestion Script
============================================================
API URL: https://your-worker.workers.dev
Samples: 5000
Skip embeddings: False
============================================================
Downloading dataset from Hugging Face...
  Downloading file 1/5: ...
    Loaded 2000 rows
  ...

Combining 5 dataframes...
Total rows: 10000
Sampling 5000 rows...

Ingesting 5000 articles...
  Progress: 100/5000 articles processed
  ...

============================================================
Ingestion Summary:
  Successful inserts: 4987
  Failed inserts: 13
  Successful embeddings: 4985
  Failed embeddings: 2
============================================================
```

## Troubleshooting

### Connection Errors

- Verify your API URL is correct
- Check that Workers are deployed and accessible
- Ensure CORS is configured correctly

### Embedding Generation Fails

- Check Workers AI is enabled
- Verify Vectorize index exists
- Check model availability (`@cf/baai/bge-base-en-v1.5`)

### Rate Limiting

If you encounter rate limits:
- Increase `DELAY_BETWEEN_REQUESTS` in the script
- Process in smaller batches
- Use `--skip-embeddings` to insert articles first, then generate embeddings separately

### Dataset Column Mismatches

The script attempts to map common column names. If your dataset has different columns, modify the `transform_article()` function in `ingest_data.py`.

## Performance

- **Insertion Rate**: ~10-20 articles/second (with delays)
- **Embedding Generation**: ~5-10 articles/second
- **Total Time**: ~10-15 minutes for 5000 articles

## Next Steps

After ingestion:

1. Verify articles in Reporter Console (`/reporter`)
2. Test search functionality (`/history`)
3. Generate history summaries for various topics
4. Monitor Vectorize index size and D1 database usage

