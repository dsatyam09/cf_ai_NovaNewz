#!/usr/bin/env python3
"""
Embed ALL articles in batches with smart rate limiting.
Runs in background, tracks progress, resumes from failures.
"""

import requests
import time
import json
import argparse
from datetime import datetime
import os

def get_articles_without_embeddings(api_url):
    """Get list of article IDs that don't have embeddings yet."""
    print("Fetching all articles...")
    response = requests.get(f"{api_url}/articles", timeout=30)
    response.raise_for_status()
    all_articles = response.json()
    
    print(f"Total articles in database: {len(all_articles)}")
    
    # Check Vectorize to see which ones already have embeddings
    print("Checking which articles already have embeddings...")
    articles_needing_embeddings = []
    
    for article in all_articles:
        article_id = article.get('id')
        # For now, we'll try to embed all - the API will skip if it already exists
        articles_needing_embeddings.append(article)
    
    return articles_needing_embeddings


def add_embedding_with_retry(article, api_url, max_retries=3, base_delay=5):
    """Add embedding with exponential backoff retry."""
    article_id = article.get('id')
    title = article.get('title', 'Unknown')[:50]
    content = article.get('content', '')
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{api_url}/embed",
                json={
                    "text": content,
                    "article_id": article_id,
                    "title": article.get('title'),
                    "tags": article.get('tags', []),
                    "published_at": article.get('published_at'),
                },
                headers={"Content-Type": "application/json"},
                timeout=60
            )
            
            if response.status_code == 200:
                return True, None
            elif response.status_code in [429, 500]:  # Rate limit or AI error
                if attempt < max_retries - 1:
                    wait_time = base_delay * (2 ** attempt)
                    print(f"    Rate limit/error, waiting {wait_time}s (attempt {attempt + 1}/{max_retries})...")
                    time.sleep(wait_time)
                    continue
                else:
                    return False, f"Rate limit after {max_retries} attempts"
            else:
                return False, f"HTTP {response.status_code}: {response.text}"
                
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                wait_time = base_delay * (2 ** attempt)
                print(f"    Timeout, waiting {wait_time}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(wait_time)
                continue
            return False, "Timeout after retries"
        except Exception as e:
            return False, str(e)
    
    return False, "Max retries exceeded"


def embed_all_articles(api_url, batch_size=100, delay=3, start_from=0):
    """Embed all articles in batches with progress tracking."""
    articles = get_articles_without_embeddings(api_url)
    
    if start_from > 0:
        print(f"\nResuming from article {start_from}...")
        articles = articles[start_from:]
    
    total = len(articles)
    print(f"\nNeed to process {total} articles")
    print(f"Batch size: {batch_size}")
    print(f"Delay between embeddings: {delay}s")
    print(f"Estimated time: {(total * delay) / 60:.1f} minutes\n")
    print("="*60)
    
    success_count = 0
    fail_count = 0
    failed_articles = []
    
    # Create progress file
    progress_file = "embedding_progress.json"
    
    for idx, article in enumerate(articles, start=start_from):
        article_id = article.get('id')
        title = article.get('title', 'Unknown')[:60]
        
        print(f"[{idx + 1}/{start_from + total}] Article {article_id}: {title}...")
        
        success, error = add_embedding_with_retry(article, api_url, max_retries=3, base_delay=delay)
        
        if success:
            print(f"  ✓ Success")
            success_count += 1
        else:
            print(f"  ✗ Failed: {error}")
            fail_count += 1
            failed_articles.append({
                'id': article_id,
                'title': title,
                'error': error
            })
        
        # Save progress every 10 articles
        if (idx + 1) % 10 == 0:
            with open(progress_file, 'w') as f:
                json.dump({
                    'last_processed': idx + 1,
                    'success': success_count,
                    'failed': fail_count,
                    'failed_articles': failed_articles,
                    'timestamp': datetime.now().isoformat()
                }, f, indent=2)
            print(f"\n  Progress: {success_count} success, {fail_count} failed (saved to {progress_file})\n")
        
        # Wait between embeddings to avoid rate limits
        if idx < start_from + total - 1:  # Don't wait after last one
            time.sleep(delay)
    
    print("\n" + "="*60)
    print("Embedding Complete!")
    print(f"  Success: {success_count}")
    print(f"  Failed: {fail_count}")
    print(f"  Total: {success_count + fail_count}")
    print("="*60)
    
    if failed_articles:
        print(f"\nFailed articles saved to {progress_file}")
        print("To retry failed articles, check the progress file")
    
    # Save final report
    with open('embedding_report.json', 'w') as f:
        json.dump({
            'completed_at': datetime.now().isoformat(),
            'total_processed': success_count + fail_count,
            'success': success_count,
            'failed': fail_count,
            'failed_articles': failed_articles
        }, f, indent=2)
    
    return success_count, fail_count


def main():
    parser = argparse.ArgumentParser(description="Embed all articles with smart batching")
    parser.add_argument(
        "--api-url",
        type=str,
        required=True,
        help="API URL (e.g., https://your-worker.workers.dev)"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="Process this many before pausing (default: 100)"
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=3.0,
        help="Seconds to wait between embeddings (default: 3)"
    )
    parser.add_argument(
        "--start-from",
        type=int,
        default=0,
        help="Resume from this article index (default: 0)"
    )
    
    args = parser.parse_args()
    
    print("="*60)
    print("NovaNewz - Embed ALL Articles")
    print("="*60)
    print(f"API URL: {args.api_url}")
    print(f"Batch size: {args.batch_size}")
    print(f"Delay: {args.delay}s")
    print("="*60)
    print("\nThis will take a while. You can stop with Ctrl+C and resume later.")
    print("Press Enter to continue...")
    input()
    
    try:
        success, failed = embed_all_articles(
            args.api_url,
            batch_size=args.batch_size,
            delay=args.delay,
            start_from=args.start_from
        )
        
        if success + failed > 0:
            success_rate = (success / (success + failed)) * 100
            print(f"\nSuccess rate: {success_rate:.1f}%")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        print("Check embedding_progress.json for current progress")
        print("Resume with: --start-from <last_processed>")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        print("Check embedding_progress.json for current progress")


if __name__ == "__main__":
    main()
