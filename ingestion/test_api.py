#!/usr/bin/env python3
"""
Quick API test script to verify Workers are accessible before ingestion.
"""

import requests
import os
import sys

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8787")

def test_api():
    """Test that the API is accessible and working."""
    print("Testing NovaNewz API...")
    print(f"API URL: {API_BASE_URL}\n")
    
    # Test 1: Health check - Get articles
    print("1. Testing GET /articles...")
    try:
        response = requests.get(f"{API_BASE_URL}/articles", timeout=10)
        response.raise_for_status()
        articles = response.json()
        print(f"   ✓ Success! Found {len(articles)} articles")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
        return False
    
    # Test 2: Create test article
    print("\n2. Testing POST /articles...")
    try:
        test_article = {
            "title": "Test Article - API Verification",
            "content": "This is a test article to verify the API is working correctly.",
            "author": "Test Script",
            "tags": ["test", "verification"],
            "published_at": "2024-01-01T00:00:00Z"
        }
        response = requests.post(
            f"{API_BASE_URL}/articles",
            json=test_article,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        created = response.json()
        print(f"   ✓ Success! Created article ID: {created.get('id')}")
        article_id = created.get('id')
    except Exception as e:
        print(f"   ✗ Failed: {e}")
        return False
    
    # Test 3: Generate embedding
    print("\n3. Testing POST /embed...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/embed",
            json={
                "text": test_article["content"],
                "article_id": article_id,
                "title": test_article["title"],
                "tags": test_article["tags"],
                "published_at": test_article["published_at"]
            },
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()
        embed_result = response.json()
        print(f"   ✓ Success! Generated embedding ({embed_result.get('dimensions', 'unknown')} dimensions)")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
        print("   Note: This might fail if Workers AI or Vectorize is not configured")
        # Don't return False here - embedding might not be critical for basic testing
    
    # Test 4: Search
    print("\n4. Testing POST /search...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/search",
            json={"query": "test", "topK": 5},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        search_result = response.json()
        print(f"   ✓ Success! Found {search_result.get('count', 0)} results")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
        print("   Note: This might fail if Vectorize is not configured or has no data")
    
    # Test 5: History generation
    print("\n5. Testing POST /history...")
    try:
        response = requests.post(
            f"{API_BASE_URL}/history",
            json={"query": "test"},
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()
        history_result = response.json()
        print(f"   ✓ Success! Generated history with {len(history_result.get('timeline', []))} timeline events")
    except Exception as e:
        print(f"   ✗ Failed: {e}")
        print("   Note: This might fail if Workers AI or Vectorize is not configured")
    
    print("\n" + "="*60)
    print("API Test Complete!")
    print("="*60)
    print("\nIf all tests passed, you're ready to run the ingestion script:")
    print(f"  python ingest_data.py --api-url {API_BASE_URL}")
    
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        API_BASE_URL = sys.argv[1]
    
    success = test_api()
    sys.exit(0 if success else 1)

