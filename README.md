# cf_ai_NovaNewz

A modern tech news aggregation platform with AI-powered search and history generation, built with Cloudflare's AI stack.

> **Note:** This project was developed with AI assistance. See [PROMPTS.md](PROMPTS.md) for all AI prompts used during development.

## 🚀 Try It Out

### Live Demo
- **Frontend:** Coming soon (Cloudflare Pages)
- **API:** `https://novanewz-api.novanewz-satyam.workers.dev`

### Quick Test (API)
```bash
# Search for articles
curl -X POST https://novanewz-api.novanewz-satyam.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence", "limit": 5}'

# Generate AI history
curl -X POST https://novanewz-api.novanewz-satyam.workers.dev/history \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning"}'
```

## Overview

NovaNewz is a full-stack application that combines:
- **Tech News Database**: 20,000+ curated tech articles (growing)
- **Semantic Search**: AI-powered vector search using Cloudflare Vectorize
- **AI History Generation**: Automated timeline creation using Cloudflare Workers AI
- **Modern UI**: Next.js with professional design and animations
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

## 🎯 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://www.python.org/downloads/))
- Cloudflare account - free tier works! ([Sign up](https://dash.cloudflare.com/sign-up))
- Git ([Download](https://git-scm.com/downloads))

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/cf_ai_NovaNewz.git
cd cf_ai_NovaNewz
```

### Step 2: Install Dependencies

```bash
# Install Node.js packages
npm install

# Install Python packages (for data ingestion)
cd ingestion
pip install -r requirements.txt
cd ..
```

### Step 3: Configure Cloudflare Workers

```bash
cd cloudflare

# Login to Cloudflare (first time only)
npx wrangler login

# Create D1 database
npx wrangler d1 create novanewz-db

# Note the database_id from output and update it in wrangler.toml

# Apply database schema
npx wrangler d1 execute novanewz-db --remote --file=schema.sql

# Create Vectorize index for embeddings
npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine

# Deploy Workers API
npx wrangler deploy
```

**Expected Output:**
```
Published novanewz-api (X.XX sec)
  https://novanewz-api.your-subdomain.workers.dev
```

### Step 4: Ingest Sample Data

```bash
cd ../ingestion

# Verify API is working
python test_api.py https://novanewz-api.your-subdomain.workers.dev

# Ingest 100 sample articles (takes ~2 minutes)
python ingest_data.py --samples 100 --api-url https://novanewz-api.your-subdomain.workers.dev
```

**Expected Output:**
```
✓ Loaded 100 articles from dataset
✓ Progress: 100/100 articles processed
✓ Successfully ingested into D1 database
```

### Step 5: Run Frontend Locally

```bash
cd ..

# Start Next.js development server
npm run dev
```

**Access the app:**
- 🌐 **Homepage:** http://localhost:3000
- 🔍 **Search:** http://localhost:3000 (use search bar)
- 📜 **History:** http://localhost:3000/history
- 📰 **Reporter:** http://localhost:3000/reporter

### Step 6: Try the Features

**1. Search Articles**
- Go to homepage
- Enter a query like "artificial intelligence"
- See semantic search results with relevance scores

**2. Generate AI History**
- Go to History page (http://localhost:3000/history)
- Enter a topic like "cloud computing"
- Get an AI-generated timeline with sources

**3. Browse Articles**
- Go to Reporter page
- View all articles in the database
- Click any article to see details

---

## 🎨 What You'll See

The app features a modern dark theme with:
- ✨ Animated floating orbs in cyan/blue colors
- 📰 Professional newspaper-style hero banner
- 🔍 Gradient search buttons with hover effects
- 📊 Clean card layouts with glassmorphism
- 📱 Fully responsive design

---

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

## 🤖 AI-Assisted Development

This project was built with extensive AI assistance. All prompts used are documented in [PROMPTS.md](PROMPTS.md), including:

- Initial project setup and architecture
- Data ingestion pipeline creation
- UI/UX design iterations (from fancy to professional)
- API endpoint development
- Professional redesign with cyan/blue theme
- Bug fixes and optimization

**Key AI Contributions:**
- ✅ Cloudflare Workers API design
- ✅ Python data ingestion scripts
- ✅ Animated UI with modern design patterns
- ✅ Professional color scheme and branding
- ✅ Comprehensive documentation

See [PROMPTS.md](PROMPTS.md) for complete prompt history and code examples.


---

## Acknowledgments

- **Dataset:** [AIatMongoDB Tech News Embeddings](https://huggingface.co/datasets/AIatMongoDB/tech-news-embeddings)
- **Infrastructure:** [Cloudflare Workers, D1, Vectorize, Workers AI](https://cloudflare.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)
- **AI Assistant:** GitHub Copilot (Claude Sonnet 4.5)

---

Built with ❤️ using Next.js and Cloudflare's AI Stack

**Repository:** [github.com/yourusername/cf_ai_NovaNewz](https://github.com/yourusername/cf_ai_NovaNewz)  
**License:** MIT
