# NovaNewz

A modern tech news aggregation platform with AI-powered search and history generation.

## Overview

NovaNewz is a full-stack application that combines:
- **Tech News Database**: 75,000+ curated tech articles
- **Semantic Search**: AI-powered vector search using Cloudflare Vectorize
- **AI History Generation**: Automated timeline creation using LLMs
- **Modern UI**: Next.js with Tailwind CSS
- **Serverless Architecture**: Cloudflare Workers, D1, and Workers AI

## Features

✨ **Search & Discovery**
- Semantic search across 75k+ tech articles
- Vector similarity matching for relevant results
- Filter by date, company, and topics

🤖 **AI-Powered History**
- Generate comprehensive timelines for any tech topic
- Automated research from article database
- Source attribution and citations

📰 **Content Management**
- Browse articles by category
- Reporter console for content review
- Article detail pages with metadata

🚀 **Serverless & Scalable**
- Cloudflare Workers for edge computing
- D1 for SQL database storage
- Vectorize for vector embeddings
- Workers AI for LLM inference

## Project Structure

```
NovaNewz/
├── app/                    # Next.js pages and layouts
│   ├── page.tsx           # Home page
│   ├── history/           # History explorer
│   ├── reporter/          # Article management
│   └── articles/          # Article detail pages
├── components/            # React components
├── lib/                   # Utilities and API clients
├── cloudflare/            # Cloudflare Workers
│   ├── functions/         # API endpoints
│   ├── schema.sql         # D1 database schema
│   └── wrangler.toml      # Workers configuration
└── ingestion/             # Data ingestion scripts
    ├── ingest_data.py     # Main ingestion script
    ├── test_api.py        # API verification
    └── preview_dataset.py # Dataset preview tool
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Cloudflare account (free tier works)

### 1. Install Dependencies

```bash
# Install Node packages
npm install

# Install Python packages
cd ingestion
pip install -r requirements.txt
```

### 2. Configure Cloudflare

```bash
cd cloudflare

# Create D1 database
npx wrangler d1 create novanewz-db

# Apply schema
npx wrangler d1 execute novanewz-db --file=schema.sql

# Create Vectorize index
npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine

# Update wrangler.toml with database_id and deploy
npx wrangler deploy
```

### 3. Ingest Data

```bash
cd ../ingestion

# Test API
python test_api.py https://your-worker.workers.dev

# Ingest articles
python ingest_data.py --samples 5000 --api-url https://your-worker.workers.dev
```

### 4. Run Development Server

```bash
cd ..
npm run dev
```

Visit http://localhost:3000

## Documentation

- 📘 [Step 4 Complete Guide](STEP4_COMPLETE.md) - Quick reference
- 📗 [Ingestion Quick Start](ingestion/QUICKSTART.md) - Detailed setup
- 📙 [Ingestion README](ingestion/README.md) - Usage guide
- 📕 [Step 4 Summary](ingestion/STEP4_SUMMARY.md) - Implementation details

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React, Tailwind CSS, shadcn/ui
- **Language**: TypeScript

### Backend
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Vector Store**: Cloudflare Vectorize
- **AI**: Cloudflare Workers AI
- **Language**: JavaScript

### Data Pipeline
- **Processing**: Python, pandas
- **Source**: Hugging Face (MongoDB Tech News)
- **Format**: Apache Parquet

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/articles` | GET | List all articles |
| `/articles` | POST | Create article |
| `/articles/:id` | GET | Get article by ID |
| `/embed` | POST | Generate embedding |
| `/search` | POST | Semantic search |
| `/history` | POST | Generate AI history |
| `/vectorize` | GET | Query vectors |

## Dataset

**Source**: [MongoDB Tech News Embeddings](https://huggingface.co/datasets/AIatMongoDB/tech-news-embeddings)

- 75,844 tech news articles
- Date range: 2014-2023
- Companies: 47 major tech companies
- Topics: AI, Cloud, Cybersecurity, Software, Hardware

## Performance

- **Search**: <500ms average latency
- **Ingestion**: ~100 articles/minute
- **Embedding**: 768-dimensional vectors
- **Storage**: ~10-50KB per article

## Development

```bash
# Run Next.js dev server
npm run dev

# Run Cloudflare Workers locally
cd cloudflare && npx wrangler dev

# Preview dataset
cd ingestion && python preview_dataset.py 10

# Test API
cd ingestion && python test_api.py
```

## Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy to your preferred platform
```

### Backend (Cloudflare)
```bash
cd cloudflare
npx wrangler deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- Documentation: See `/ingestion` directory
- Issues: GitHub Issues
- Questions: Discussions

## Roadmap

- [ ] Advanced filtering and sorting
- [ ] User authentication
- [ ] Bookmarking and favorites
- [ ] RSS feed generation
- [ ] Multi-language support
- [ ] Mobile app

## Acknowledgments

- Dataset: [AIatMongoDB](https://huggingface.co/datasets/AIatMongoDB/tech-news-embeddings)
- Infrastructure: [Cloudflare](https://cloudflare.com)
- UI Components: [shadcn/ui](https://ui.shadcn.com)

---

Built with ❤️ using Next.js and Cloudflare Workers