#!/bin/bash
# deploy_workers.sh
# Automated deployment script for Cloudflare Workers

set -e  # Exit on error

echo "================================================"
echo "NovaNewz Workers Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}✗ npx not found. Please install Node.js${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking Cloudflare configuration...${NC}"

# Check if wrangler.toml exists
if [ ! -f "cloudflare/wrangler.toml" ]; then
    echo -e "${RED}✗ cloudflare/wrangler.toml not found${NC}"
    exit 1
fi

# Check if D1 database is configured
if ! grep -q "database_id" cloudflare/wrangler.toml; then
    echo -e "${YELLOW}⚠ D1 database not configured in wrangler.toml${NC}"
    echo "Please run: npx wrangler d1 create novanewz-db"
    echo "Then update wrangler.toml with the database_id"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}✓ Configuration files found${NC}"
echo ""

echo -e "${YELLOW}Step 2: Checking/Creating D1 Database...${NC}"

# Check if database exists
cd cloudflare
DB_EXISTS=$(npx wrangler d1 list 2>/dev/null | grep "novanewz-db" || echo "")

if [ -z "$DB_EXISTS" ]; then
    echo "Database not found. Creating..."
    npx wrangler d1 create novanewz-db
    echo ""
    echo -e "${YELLOW}⚠ Please update wrangler.toml with the database_id above${NC}"
    read -p "Press enter after updating wrangler.toml..."
else
    echo -e "${GREEN}✓ Database 'novanewz-db' exists${NC}"
fi

echo ""

echo -e "${YELLOW}Step 3: Applying Database Schema...${NC}"

# Apply schema
if npx wrangler d1 execute novanewz-db --file=schema.sql 2>/dev/null; then
    echo -e "${GREEN}✓ Schema applied successfully${NC}"
else
    echo -e "${YELLOW}⚠ Schema may already be applied${NC}"
fi

echo ""

echo -e "${YELLOW}Step 4: Checking/Creating Vectorize Index...${NC}"

# Check if vectorize index exists
VEC_EXISTS=$(npx wrangler vectorize list 2>/dev/null | grep "novanewz-vectors" || echo "")

if [ -z "$VEC_EXISTS" ]; then
    echo "Vectorize index not found. Creating..."
    npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine
    echo -e "${GREEN}✓ Vectorize index created${NC}"
else
    echo -e "${GREEN}✓ Vectorize index 'novanewz-vectors' exists${NC}"
fi

echo ""

echo -e "${YELLOW}Step 5: Deploying Workers...${NC}"

# Deploy
if npx wrangler deploy; then
    echo ""
    echo -e "${GREEN}✓ Workers deployed successfully!${NC}"
    echo ""
    echo "================================================"
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo "================================================"
    echo ""
    echo "Your API is now available at the URL shown above."
    echo "Copy this URL and:"
    echo "  1. Update NEXT_PUBLIC_API_URL in .env.local"
    echo "  2. Use it for data ingestion: python ingest_data.py --api-url [URL]"
    echo ""
else
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
fi

cd ..
