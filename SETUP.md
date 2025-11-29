# NovaNewz Setup Guide

Complete guide to deploying NovaNewz from scratch on a new machine.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloudflare Account Setup](#cloudflare-account-setup)
3. [Local Development Setup](#local-development-setup)
4. [Cloudflare Resources Setup](#cloudflare-resources-setup)
5. [Environment Configuration](#environment-configuration)
6. [Data Ingestion](#data-ingestion)
7. [Deployment](#deployment)
8. [Verification](#verification)

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ installed ([Download](https://nodejs.org/))
- **Python** 3.8+ installed ([Download](https://www.python.org/))
- **Git** installed
- **npm** or **yarn** package manager
- A **Cloudflare account** (free tier works) - [Sign up](https://dash.cloudflare.com/sign-up)

## Cloudflare Account Setup

### Step 1: Create Cloudflare Account

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Sign up with email
3. Verify your email address
4. Log in to the dashboard

### Step 2: Get Your Account ID

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. On the right side of the Overview page, find **Account ID**
3. Click to copy it
4. Save it - you'll need this as `CLOUDFLARE_ACCOUNT_ID`

**Location**: Dashboard → (Your Account) → Overview → Right sidebar → Account ID

### Step 3: Create API Token

1. Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Choose **"Edit Cloudflare Workers"** template
4. Or create custom token with these permissions:
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Account** → **Vectorize** → **Edit**
   - **Account** → **Workers AI** → **Read**
5. Set Account Resources:
   - Select your account
6. Set Zone Resources (if needed):
   - All zones or specific zone
7. Click **"Continue to summary"**
8. Click **"Create Token"**
9. **COPY THE TOKEN** - you won't see it again!
10. Save it as `CLOUDFLARE_API_TOKEN`

**Important**: Keep this token secret! Don't commit it to git.

### Step 4: Enable Workers AI

Workers AI is automatically available with your Cloudflare account. No additional setup required, but verify:

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. Check that Workers AI is available (should see it in left sidebar)
3. Free tier includes: 10,000 neurons/day

**Models we use**:
- `@cf/baai/bge-base-en-v1.5` - Text embeddings (768 dimensions)
- `@cf/meta/llama-3.1-8b-instruct` - Text generation for history

---

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/NovaNewz.git
cd NovaNewz
```

### Step 2: Install Node Dependencies

```bash
npm install
```

### Step 3: Install Python Dependencies

```bash
cd ingestion
pip install -r requirements.txt
# Or use virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### Step 4: Install Wrangler CLI

```bash
npm install -g wrangler
# Or use npx wrangler for project-local version
```

### Step 5: Authenticate Wrangler

```bash
wrangler login
```

This opens a browser window to authorize Wrangler with your Cloudflare account.

---

## Cloudflare Resources Setup

### Step 1: Create D1 Database

```bash
cd cloudflare
npx wrangler d1 create novanewz-db
```

**Output** will look like:
```
✅ Successfully created DB 'novanewz-db'

[[d1_databases]]
binding = "DB"
database_name = "novanewz-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**IMPORTANT**: Copy the `database_id` - you'll need this as `D1_DATABASE_ID`

### Step 2: Update wrangler.toml

Open `cloudflare/wrangler.toml` and uncomment/update the D1 section:

```toml
[[d1_databases]]
binding = "DB"
database_name = "novanewz-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Paste your database_id
```

### Step 3: Apply Database Schema

```bash
npx wrangler d1 execute novanewz-db --file=schema.sql
```

**Expected output**:
```
🌀 Executing on novanewz-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
✅ Executed 2 commands in 0.123ms
```

Verify the table was created:

```bash
npx wrangler d1 execute novanewz-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Should show `articles` table.

### Step 4: Create Vectorize Index

```bash
npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine
```

**Output**:
```
✅ Successfully created index 'novanewz-vectors'

[[vectorize]]
binding = "VECTORIZE"
index_name = "novanewz-vectors"
```

**Note**: The index is created in your account. No ID needed in wrangler.toml.

### Step 5: Update wrangler.toml for Vectorize

Open `cloudflare/wrangler.toml` and uncomment/update the Vectorize section:

```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "novanewz-vectors"
```

### Step 6: Verify wrangler.toml Configuration

Your `cloudflare/wrangler.toml` should now look like:

```toml
name = "novanewz-api"
main = "functions/index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "novanewz-db"
database_id = "YOUR_DATABASE_ID_HERE"

[[vectorize]]
binding = "VECTORIZE"
index_name = "novanewz-vectors"

# AI binding is automatic - no configuration needed
```

---

## Environment Configuration

### Step 1: Create .env.local File

Copy the template:

```bash
cp .env.template .env.local
```

### Step 2: Fill in Environment Variables

Edit `.env.local` and add your values:

```env
# Cloudflare Account Details
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here

# Database IDs
D1_DATABASE_ID=your_d1_database_id_here

# API URLs (update after deployment)
NEXT_PUBLIC_API_URL=https://novanewz-api.your-subdomain.workers.dev
```

**Where to find each value**:

| Variable | Where to Find |
|----------|---------------|
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → Account → Overview → Account ID |
| `CLOUDFLARE_API_TOKEN` | Profile → API Tokens → (token you created) |
| `D1_DATABASE_ID` | Output from `wrangler d1 create` command |
| `NEXT_PUBLIC_API_URL` | Output from `wrangler deploy` command (see deployment section) |

### Step 3: Verify Environment Variables

```bash
# Check that variables are set
grep -v "^#" .env.local | grep "="
```

---

## Data Ingestion

Now that Cloudflare resources are set up, ingest tech news data.

### Step 1: Deploy Workers First

```bash
cd cloudflare
npx wrangler deploy
```

**Output**:
```
✨ Successfully deployed!
   https://novanewz-api.your-subdomain.workers.dev
```

**IMPORTANT**: Copy this URL and update `NEXT_PUBLIC_API_URL` in `.env.local`

### Step 2: Test API

```bash
cd ../ingestion
python test_api.py https://novanewz-api.your-subdomain.workers.dev
```

Expected: All tests pass ✅

### Step 3: Ingest Sample Data (Recommended Start)

Start with 1,000 articles to test:

```bash
python ingest_data.py \
  --samples 1000 \
  --api-url https://novanewz-api.your-subdomain.workers.dev
```

**Time**: ~15-20 minutes
**Storage**: ~10-50 MB in D1

### Step 4: Full Data Ingestion (Optional)

For production with 5,000+ articles:

```bash
python ingest_data.py \
  --samples 5000 \
  --api-url https://novanewz-api.your-subdomain.workers.dev
```

**Time**: ~60-90 minutes
**Storage**: ~50-250 MB in D1

### Step 5: Verify Ingestion

```bash
python ingest_data.py \
  --verify-only \
  --api-url https://novanewz-api.your-subdomain.workers.dev
```

Should show:
- ✅ Articles in database
- ✅ Search returns results
- ✅ Embeddings working

---

## Deployment

### Option 1: Automated Deployment (Recommended)

Use the provided scripts:

```bash
# Deploy Workers API
./deploy_workers.sh

# Deploy Frontend
./deploy_frontend.sh

# Verify deployment
./verify_deployment.sh
```

### Option 2: Manual Deployment

#### Deploy Workers

```bash
cd cloudflare
npx wrangler deploy
```

#### Deploy Frontend to Cloudflare Pages

```bash
# Build
npm run build

# Deploy via Wrangler
npx wrangler pages deploy out --project-name=novanewz
```

Or use Cloudflare Dashboard:

1. Go to **Workers & Pages**
2. Click **Create application**
3. Choose **Pages**
4. Connect your GitHub repository
5. Configure build:
   - Build command: `npm run build`
   - Build output: `out`
6. Add environment variables from `.env.local`
7. Click **Save and Deploy**

#### Get Frontend URL

After deployment, you'll get a URL like:
```
https://novanewz.pages.dev
```

---

## Verification

### Step 1: Check Workers API

```bash
curl https://novanewz-api.your-subdomain.workers.dev/
```

Expected:
```json
{
  "status": "ok",
  "message": "NovaNewz API",
  "version": "1.0.0"
}
```

### Step 2: Check Articles

```bash
curl https://novanewz-api.your-subdomain.workers.dev/articles
```

Expected: JSON array of articles

### Step 3: Test Search

```bash
curl -X POST https://novanewz-api.your-subdomain.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query":"artificial intelligence","topK":5}'
```

Expected: Search results with scores

### Step 4: Visit Frontend

Open: `https://novanewz.pages.dev` (or your deployed URL)

Test:
- ✅ Home page loads
- ✅ Reporter console shows articles
- ✅ Article details work
- ✅ History search works
- ✅ AI generates timelines

---

## Troubleshooting

### "Unauthorized" Errors

**Problem**: API token invalid or expired

**Solution**:
1. Create new API token in Cloudflare Dashboard
2. Update `.env.local` with new token
3. Redeploy

### "Database not configured"

**Problem**: D1 binding missing or incorrect

**Solution**:
1. Verify `wrangler.toml` has correct `database_id`
2. Check database exists: `wrangler d1 list`
3. Redeploy: `npx wrangler deploy`

### "Vectorize index not found"

**Problem**: Vectorize index not created or bound

**Solution**:
1. Check index exists: `npx wrangler vectorize list`
2. If missing: `npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine`
3. Update `wrangler.toml`
4. Redeploy

### Workers AI Not Available

**Problem**: Workers AI disabled or quota exceeded

**Solution**:
1. Check Cloudflare dashboard for Workers AI status
2. Verify you haven't exceeded free tier limits (10k neurons/day)
3. Wait for quota reset (daily)
4. Consider upgrading plan if needed

### Frontend Can't Connect to API

**Problem**: CORS or incorrect API URL

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
2. Check CORS headers in Workers (should allow all origins)
3. Test API directly with curl
4. Rebuild frontend: `npm run build`

### Ingestion Fails

**Problem**: Network issues, API errors, or rate limiting

**Solution**:
1. Test API first: `python test_api.py [URL]`
2. Reduce sample size: `--samples 100`
3. Skip embeddings: `--skip-embeddings`
4. Check Cloudflare dashboard for errors
5. Increase delays in `ingest_data.py`

---

## Resource Limits (Free Tier)

Be aware of Cloudflare free tier limits:

| Resource | Free Tier Limit |
|----------|-----------------|
| **Workers** | 100k requests/day |
| **D1** | 5 GB storage, 5M rows |
| **Vectorize** | 100k vectors, 10M queries/month |
| **Workers AI** | 10k neurons/day |
| **Pages** | 500 builds/month, unlimited bandwidth |

**Recommendation**: Start with 1,000-5,000 articles to stay within limits.

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] D1 database created and schema applied
- [ ] Vectorize index created with correct dimensions
- [ ] Workers deployed successfully
- [ ] Frontend deployed successfully
- [ ] Data ingested (at least 1,000 articles)
- [ ] API tests pass
- [ ] Frontend loads without errors
- [ ] Search functionality works
- [ ] History generation works
- [ ] Error handling tested
- [ ] Monitoring set up (optional but recommended)

---

## Next Steps

After successful deployment:

1. **Add Monitoring**: Set up Cloudflare Analytics
2. **Custom Domain**: Add your own domain to Pages
3. **CI/CD**: Set up GitHub Actions for automated deployment
4. **Backups**: Export D1 database periodically
5. **Updates**: Schedule regular data ingestion for new articles
6. **Optimization**: Add caching, rate limiting, etc.

---

## Support

- **Documentation**: See `README.md`, `STEP4_COMPLETE.md`, `TESTING.md`
- **Data Ingestion**: See `ingestion/QUICKSTART.md`
- **Issues**: Open GitHub issue
- **Cloudflare Docs**: [https://developers.cloudflare.com](https://developers.cloudflare.com)

---

## Quick Reference

```bash
# Initial Setup
npm install
cd ingestion && pip install -r requirements.txt

# Cloudflare Resources
wrangler d1 create novanewz-db
wrangler d1 execute novanewz-db --file=schema.sql
wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine

# Deploy
cd cloudflare && npx wrangler deploy

# Ingest Data
cd ingestion
python ingest_data.py --samples 1000 --api-url [YOUR_WORKER_URL]

# Deploy Frontend
npm run build
npx wrangler pages deploy out --project-name=novanewz
```

---

**You're all set! 🚀** Your NovaNewz platform should now be fully deployed and operational.
