#!/usr/bin/env python3
"""
Add embeddings to existing articles in batches with heavy rate limiting
"""

import requests
import time
import argparse

def add_embeddings(api_url: str, limit: int = 10, delay: int = 3):
    """Add embeddings to articles that don't have them yet"""
    
    print(f"Adding embeddings to {limit} articles with {delay}s delay between each...")
    
    # Get articles
    response = requests.get(f"{api_url}/articles")
    articles = response.json()
    
    print(f"Total articles in database: {len(articles)}")
    
    # Process first N articles
    success = 0
    failed = 0
    
    for i, article in enumerate(articles[:limit]):
        article_id = article['id']
        title = article['title'][:50]
        content = article['content']
        tags = article.get('tags', [])
        published_at = article.get('published_at')
        
        print(f"\n[{i+1}/{limit}] Adding embedding for article {article_id}: {title}...")
        
        try:
            response = requests.post(
                f"{api_url}/embed",
                json={
                    "text": content,
                    "article_id": article_id,
                    "title": article['title'],
                    "tags": tags,
                    "published_at": published_at,
                },
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                print(f"  ✓ Success")
                success += 1
            else:
                print(f"  ✗ Failed: {response.status_code} - {response.text}")
                failed += 1
                
        except Exception as e:
            print(f"  ✗ Error: {e}")
            failed += 1
        
        # Wait between requests
        if i < limit - 1:  # Don't wait after last one
            print(f"  Waiting {delay}s...")
            time.sleep(delay)
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Success: {success}")
    print(f"  Failed: {failed}")
    print(f"{'='*60}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", required=True, help="API URL")
    parser.add_argument("--limit", type=int, default=10, help="Number of articles to process")
    parser.add_argument("--delay", type=int, default=3, help="Delay in seconds between requests")
    
    args = parser.parse_args()
    add_embeddings(args.api_url, args.limit, args.delay)
