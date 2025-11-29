#!/bin/bash
# verify_deployment.sh
# Verification script to test deployed NovaNewz API

set -e  # Exit on error

echo "================================================"
echo "NovaNewz Deployment Verification Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get API URL from argument or environment
API_URL=${1:-$NEXT_PUBLIC_API_URL}

if [ -z "$API_URL" ]; then
    echo -e "${YELLOW}No API URL provided.${NC}"
    read -p "Enter your Workers API URL: " API_URL
fi

echo "Testing API at: $API_URL"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}Testing: $description${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ Success (HTTP $http_code)${NC}"
        echo "Response preview: $(echo "$body" | head -c 200)..."
        echo ""
        return 0
    else
        echo -e "${RED}✗ Failed (HTTP $http_code)${NC}"
        echo "Response: $body"
        echo ""
        return 1
    fi
}

# Track results
passed=0
failed=0

echo "================================================"
echo "Running Tests..."
echo "================================================"
echo ""

# Test 1: Root endpoint
if test_endpoint "GET" "/" "" "Root endpoint (health check)"; then
    ((passed++))
else
    ((failed++))
fi

# Test 2: List articles
if test_endpoint "GET" "/articles" "" "List articles"; then
    ((passed++))
else
    ((failed++))
fi

# Test 3: Create article
create_data='{
  "title": "Test Article - Verification",
  "content": "This is a test article created by the verification script to ensure the API is working correctly.",
  "author": "Verification Script",
  "tags": ["test", "verification"],
  "published_at": "2024-01-01T00:00:00Z"
}'

if test_endpoint "POST" "/articles" "$create_data" "Create article"; then
    ((passed++))
    ARTICLE_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    echo "Created article ID: $ARTICLE_ID"
    echo ""
else
    ((failed++))
    ARTICLE_ID=""
fi

# Test 4: Get article by ID (if we created one)
if [ -n "$ARTICLE_ID" ]; then
    if test_endpoint "GET" "/articles/$ARTICLE_ID" "" "Get article by ID"; then
        ((passed++))
    else
        ((failed++))
    fi
fi

# Test 5: Generate embedding
embed_data='{
  "text": "Artificial intelligence and machine learning are transforming the technology industry.",
  "article_id": 1,
  "title": "Test Embedding",
  "tags": ["ai", "ml"]
}'

if test_endpoint "POST" "/embed" "$embed_data" "Generate embedding"; then
    ((passed++))
else
    ((failed++))
    echo -e "${YELLOW}Note: This may fail if Workers AI or Vectorize is not configured${NC}"
    echo ""
fi

# Test 6: Search
search_data='{"query": "artificial intelligence", "topK": 5}'

if test_endpoint "POST" "/search" "$search_data" "Search articles"; then
    ((passed++))
else
    ((failed++))
    echo -e "${YELLOW}Note: This may fail if no articles have embeddings yet${NC}"
    echo ""
fi

# Test 7: Generate history
history_data='{"query": "evolution of cloud computing"}'

if test_endpoint "POST" "/history" "$history_data" "Generate AI history"; then
    ((passed++))
else
    ((failed++))
    echo -e "${YELLOW}Note: This may fail if Workers AI is not configured or no articles exist${NC}"
    echo ""
fi

# Summary
echo "================================================"
echo "Verification Summary"
echo "================================================"
echo ""
echo -e "Tests Passed: ${GREEN}$passed${NC}"
echo -e "Tests Failed: ${RED}$failed${NC}"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Your deployment is working correctly.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Ingest data: cd ingestion && python ingest_data.py --api-url $API_URL"
    echo "  2. Visit your frontend and test the UI"
    echo "  3. Try searching and generating histories"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed. Please check the errors above.${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Workers AI not enabled: Enable in Cloudflare Dashboard"
    echo "  - Vectorize not configured: Run 'npx wrangler vectorize create novanewz-vectors --dimensions=768 --metric=cosine'"
    echo "  - D1 not configured: Update wrangler.toml with database_id"
    echo "  - No articles yet: Run data ingestion"
    echo ""
    echo "For detailed setup instructions, see SETUP.md"
    exit 1
fi
