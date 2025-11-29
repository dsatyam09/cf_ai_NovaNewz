# NovaNewz Quick Reference Guide

## 🚀 Quick Start Commands

### Local Development (Mock Data - No Cloudflare Needed)
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Local Development (With Cloudflare Workers)
```bash
./start_dev.sh
# Or manually:
# Terminal 1: cd cloudflare && npx wrangler dev
# Terminal 2: npm run dev
```

### Deploy to Production
```bash
./deploy_workers.sh      # Deploy API
./deploy_frontend.sh     # Deploy frontend
./verify_deployment.sh <api-url>  # Verify
```

## 📁 Project Structure

```
NovaNewz/
├── app/                    # Next.js app (pages & API routes)
│   ├── api/               # Mock API for local dev
│   ├── reporter/          # Article management UI
│   └── history/           # History explorer UI
├── cloudflare/            # Cloudflare Workers
│   ├── functions/         # Worker endpoints
│   └── wrangler.toml      # Workers configuration
├── ingestion/             # Data ingestion scripts
│   ├── ingest_data.py     # Main ingestion script
│   └── test_api.py        # API testing
├── deploy_*.sh            # Deployment scripts
├── verify_deployment.sh   # Verification script
├── start_dev.sh           # Dev environment starter
├── SETUP.md               # Complete setup guide
└── .env.template          # Environment variables template
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Local environment variables |
| `.env.template` | Template for environment setup |
| `cloudflare/wrangler.toml` | Workers configuration |
| `next.config.js` | Next.js configuration |
| `package.json` | Node.js dependencies |

## 🌐 API Endpoints

### Articles
- `GET /articles` - List all articles
- `POST /articles` - Create article
- `GET /articles/:id` - Get article by ID
- `PUT /articles/:id` - Update article
- `DELETE /articles/:id` - Delete article

### AI Features
- `POST /embed` - Generate embedding
- `POST /search` - Semantic search
- `POST /history` - Generate AI history

## 📝 Environment Variables

### Required for Local Dev (Mock API)
```env
NEXT_PUBLIC_API_URL=/api
```

### Required for Production
```env
NEXT_PUBLIC_API_URL=https://novanewz-api.your-subdomain.workers.dev
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
D1_DATABASE_ID=your_database_id
```

## 🎯 Common Tasks

### Create New Article
1. Go to `/reporter/new`
2. Fill in form (min 50 chars content)
3. Submit

### Search Articles
1. Go to `/history`
2. Enter query
3. View results and timeline

### Deploy Updates
```bash
# Update Workers
cd cloudflare && npx wrangler deploy

# Update Frontend
npm run build
npx wrangler pages deploy out --project-name=novanewz
```

### Ingest Data
```bash
cd ingestion
python ingest_data.py --samples 5000 --api-url <your-api-url>
```

### Test API
```bash
cd ingestion
python test_api.py <your-api-url>
```

## 🐛 Troubleshooting

### Issue: API 404 Errors
**Solution**: Check `NEXT_PUBLIC_API_URL` in `.env.local`

### Issue: No Articles Showing
**Solution**: 
- Local: Create articles via UI or wait for mock data
- Production: Run data ingestion

### Issue: Workers Not Deploying
**Solution**: 
1. Check wrangler.toml has database_id
2. Run `npx wrangler login`
3. Verify Cloudflare account is active

### Issue: Build Errors
**Solution**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## 📚 Documentation

- **Setup**: [SETUP.md](SETUP.md)
- **Testing**: [TESTING.md](TESTING.md)
- **Data Ingestion**: [STEP4_COMPLETE.md](STEP4_COMPLETE.md)
- **Deployment**: [STEP7_COMPLETE.md](STEP7_COMPLETE.md)
- **Quick Start**: [ingestion/QUICKSTART.md](ingestion/QUICKSTART.md)

## 🔑 Cloudflare Resources

### Create D1 Database
```bash
npx wrangler d1 create novanewz-db
npx wrangler d1 execute novanewz-db --file=cloudflare/schema.sql
```

### Create Vectorize Index
```bash
npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine
```

### View Resources
```bash
npx wrangler d1 list                 # List databases
npx wrangler vectorize list          # List indexes
npx wrangler deployments list        # List deployments
```

## 🚦 Development Workflow

1. **Make Changes**: Edit files locally
2. **Test Locally**: `npm run dev`
3. **Verify**: Check in browser
4. **Commit**: `git add . && git commit -m "message"`
5. **Deploy**: `./deploy_workers.sh && ./deploy_frontend.sh`
6. **Verify**: `./verify_deployment.sh <url>`

## 💡 Tips

- Use mock API for UI development (no Cloudflare needed)
- Deploy Workers early to test with real data
- Start with small data samples (1,000 articles)
- Check Cloudflare dashboard for errors and logs
- Use `npx wrangler tail` to see live Worker logs
- Keep API tokens secure (never commit to git)

## 📞 Getting Help

1. Check documentation files
2. Run verification script
3. Check browser console for frontend errors
4. Check Cloudflare dashboard for Worker errors
5. Review Worker logs: `npx wrangler tail`
6. Consult Cloudflare docs: https://developers.cloudflare.com

## ⚡ Performance

- **Local Dev**: Instant (mock data)
- **Workers API**: <500ms typical
- **Search**: <1s with 10k articles
- **History Generation**: 5-15s depending on complexity
- **Data Ingestion**: ~100 articles/minute with embeddings

## 🎨 UI Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/reporter` | Article list |
| `/reporter/new` | Create article |
| `/articles/:id` | Article details |
| `/history` | History explorer |

## 🔐 Security Notes

- Never commit `.env.local`
- Rotate API tokens regularly
- Use environment-specific tokens
- Enable Cloudflare Access for sensitive endpoints
- Review CORS settings for production

---

**Quick Reference Version 1.0** - NovaNewz Complete Platform
