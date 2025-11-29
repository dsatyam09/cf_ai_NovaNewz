#!/bin/bash
# start_dev.sh
# Starts both Next.js and Cloudflare Workers for local development

echo "================================================"
echo "NovaNewz Local Development Setup"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local from template...${NC}"
    cp .env.template .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

echo -e "${GREEN}Starting development servers...${NC}"
echo ""
echo "This will start:"
echo "  1. Cloudflare Workers (http://localhost:8787)"
echo "  2. Next.js Dev Server (http://localhost:3000)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $WORKERS_PID 2>/dev/null
    kill $NEXTJS_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Cloudflare Workers in background
cd cloudflare
npx wrangler dev &
WORKERS_PID=$!
cd ..

# Wait a bit for Workers to start
sleep 3

# Start Next.js dev server
npm run dev &
NEXTJS_PID=$!

# Wait for both processes
wait
