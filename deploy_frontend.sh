#!/bin/bash
# deploy_frontend.sh
# Automated deployment script for Next.js frontend to Cloudflare Pages

set -e  # Exit on error

echo "================================================"
echo "NovaNewz Frontend Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    echo "Creating from template..."
    if [ -f ".env.template" ]; then
        cp .env.template .env.local
        echo -e "${YELLOW}Please edit .env.local with your configuration${NC}"
        read -p "Press enter after editing .env.local..."
    else
        echo -e "${RED}✗ .env.template not found${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""

echo -e "${YELLOW}Step 2: Building Next.js application...${NC}"

# Build the application
if npm run build; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""

echo -e "${YELLOW}Step 3: Deploying to Cloudflare Pages...${NC}"

# Check if project name is provided
PROJECT_NAME=${1:-novanewz}

echo "Project name: $PROJECT_NAME"
echo ""

# Deploy to Cloudflare Pages
if npx wrangler pages deploy out --project-name="$PROJECT_NAME"; then
    echo ""
    echo -e "${GREEN}✓ Frontend deployed successfully!${NC}"
    echo ""
    echo "================================================"
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo "================================================"
    echo ""
    echo "Your application is now live at the URL shown above."
    echo ""
    echo "Next steps:"
    echo "  1. Visit your Pages dashboard to configure custom domain"
    echo "  2. Set up environment variables in Pages settings"
    echo "  3. Enable automatic deployments from GitHub"
    echo ""
else
    echo -e "${RED}✗ Deployment failed${NC}"
    echo ""
    echo "Alternative deployment method:"
    echo "  1. Push your code to GitHub"
    echo "  2. Go to Cloudflare Dashboard → Pages"
    echo "  3. Click 'Create a project'"
    echo "  4. Connect your GitHub repository"
    echo "  5. Configure build settings:"
    echo "     - Build command: npm run build"
    echo "     - Build output: out"
    echo "  6. Add environment variables from .env.local"
    echo "  7. Deploy!"
    exit 1
fi
