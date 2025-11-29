# Student Deployment Guide - NovaNewz on Cloudflare

## 🎓 Perfect for Students!

Cloudflare's free tier is generous and perfect for student projects:
- ✅ **Free** D1 Database (5GB)
- ✅ **Free** Vectorize (100k vectors)
- ✅ **Free** Workers AI (10k neurons/day)
- ✅ **Free** Workers (100k requests/day)
- ✅ **Free** Pages hosting

---

## Quick Deployment (5 Minutes)

### Step 1: Authenticate (One-time)

```bash
cd cloudflare
npx wrangler login
```

This opens a browser - just click "Allow" ✅

### Step 2: Create Database

```bash
# Create D1 database
npx wrangler d1 create novanewz-db
```

**Copy the `database_id` from the output!**

### Step 3: Update Configuration

Open `cloudflare/wrangler.toml` and add your database_id:

```toml
[[d1_databases]]
binding = "DB"
database_name = "novanewz-db"
database_id = "YOUR_DATABASE_ID_HERE"  # ← Paste it here
```

Uncomment the Vectorize section:

```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "novanewz-vectors"
```

### Step 4: Apply Database Schema

```bash
npx wrangler d1 execute novanewz-db --file=schema.sql
```

### Step 5: Create Vectorize Index

```bash
npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine
```

### Step 6: Deploy! 🚀

```bash
npx wrangler deploy
```

**Copy the URL you get!** Something like:
`https://novanewz-api.your-name.workers.dev`

### Step 7: Update Frontend

Go back to project root and edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://novanewz-api.your-name.workers.dev
```

### Step 8: Restart Next.js

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 9: Load Real Data

```bash
cd ingestion
python ingest_data.py --samples 1000 --api-url https://novanewz-api.your-name.workers.dev
```

Start with 1,000 articles (takes ~15 minutes). You can add more later!

---

## What You Get (All Free!)

✨ **Real AI Features**:
- Llama 3.1 for history generation
- BGE embeddings for semantic search
- 75,000+ tech news articles (if you want them all)
- Vector similarity search

📊 **Free Tier Limits**:
- 100k Worker requests/day (plenty!)
- 10k AI neurons/day (~100 history generations)
- 100k vectors (covers ~10k articles with metadata)
- 5GB database (handles 50k+ articles easily)

---

## Troubleshooting

### "Not authenticated"
Run: `npx wrangler login` and allow in browser

### "Database not found"
Make sure you updated `wrangler.toml` with your `database_id`

### "Vectorize not found"
Run: `npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine`

### Still stuck?
Run the automated script: `./deploy_workers.sh`

---

## Useful Commands

```bash
# Check what's deployed
npx wrangler deployments list

# View live logs
npx wrangler tail

# List your databases
npx wrangler d1 list

# List your Vectorize indexes
npx wrangler vectorize list

# Check account info
npx wrangler whoami
```

---

## Cost Tracking (Stay Free!)

Monitor your usage at: https://dash.cloudflare.com/

**To stay within free tier**:
- Keep articles under 10,000 (uses ~10k vectors)
- Limit history generations to 100/day
- Monitor Worker requests

**Pro tip**: 1,000-5,000 articles is perfect for a demo/portfolio project and stays well within limits!

---

## Next Steps After Deployment

1. ✅ Test your API: `./verify_deployment.sh https://your-url.workers.dev`
2. ✅ Ingest some data (start with 1,000 articles)
3. ✅ Test the UI - create articles, search, generate histories
4. ✅ Deploy frontend to Cloudflare Pages (optional)
5. ✅ Add to your portfolio! 

---

## Portfolio-Ready Features to Showcase

✨ **What makes this impressive**:
- Real AI/ML (Llama, embeddings)
- Vector search implementation
- Serverless architecture (modern!)
- Edge computing (Cloudflare Workers)
- Full-stack TypeScript/Python
- Production-ready deployment
- 75k+ article database

Perfect for showing employers you understand:
- Modern web development
- AI/ML integration
- Cloud infrastructure
- Database design
- API development

---

## Support

Stuck? Check:
- Main setup guide: `SETUP.md`
- Quick reference: `QUICK_REFERENCE.md`
- Testing guide: `TESTING.md`
- Cloudflare docs: https://developers.cloudflare.com

---

**Time to deploy**: ~5 minutes
**Time to load 1,000 articles**: ~15 minutes
**Total setup**: ~20 minutes to a working AI news platform! 🚀

Good luck with your project! 🎓
