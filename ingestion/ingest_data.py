#!/usr/bin/env python3
"""
Data Ingestion Script for NovaNewz
Downloads MongoDB Tech News Embeddings dataset from Hugging Face,
transforms it, and ingests into Cloudflare D1 + Vectorize.
"""

import pandas as pd
import requests
from io import BytesIO
import json
import time
import os
from typing import Dict, List, Optional
from datetime import datetime
import argparse

# Configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8787")  # Update with your Worker URL
BATCH_SIZE = 50  # Process articles in batches
DELAY_BETWEEN_REQUESTS = 0.1  # Seconds to wait between API calls

# Hugging Face dataset URLs
# Using the API endpoint for better reliability
PARQUET_FILES = [
    "https://huggingface.co/api/datasets/AIatMongoDB/tech-news-embeddings/parquet/default/train/0000.parquet",
    "https://huggingface.co/api/datasets/AIatMongoDB/tech-news-embeddings/parquet/default/train/0001.parquet",
]


def download_dataset(num_samples: int = 5000) -> pd.DataFrame:
    """
    Download parquet files from Hugging Face and combine them.
    
    Args:
        num_samples: Number of rows to sample from the combined dataset
        
    Returns:
        DataFrame with sampled articles
    """
    print(f"Downloading dataset from Hugging Face...")
    dfs = []
    
    for i, url in enumerate(PARQUET_FILES):
        try:
            print(f"  Downloading file {i+1}/{len(PARQUET_FILES)}: {url}")
            r = requests.get(url, timeout=60)
            r.raise_for_status()
            
            df = pd.read_parquet(BytesIO(r.content))
            dfs.append(df)
            print(f"    Loaded {len(df)} rows")
        except Exception as e:
            print(f"    Error downloading {url}: {e}")
            continue
    
    if not dfs:
        raise Exception("No data files downloaded successfully")
    
    print(f"\nCombining {len(dfs)} dataframes...")
    combined_df = pd.concat(dfs, ignore_index=True)
    print(f"Total rows: {len(combined_df)}")
    
    # Sample the requested number of rows
    if len(combined_df) > num_samples:
        print(f"Sampling {num_samples} rows...")
        sample_df = combined_df.sample(n=num_samples, random_state=42).reset_index(drop=True)
    else:
        print(f"Using all {len(combined_df)} rows (less than requested {num_samples})")
        sample_df = combined_df
    
    return sample_df


def transform_article(row: pd.Series) -> Dict:
    """
    Transform a dataset row into our article format.
    
    Args:
        row: Pandas Series from the dataset
        
    Returns:
        Dictionary with article data
    """
    # Map dataset columns to our schema
    # MongoDB Tech News dataset has: title, description, companyName, published_at, url
    article = {
        "title": str(row.get("title", "Untitled")),
        "content": str(row.get("description", row.get("content", row.get("text", "")))),
        "author": str(row.get("companyName", row.get("author", "Unknown"))),
        "published_at": None,
        "tags": [],
    }
    
    # Handle published date
    if "published_at" in row and pd.notna(row["published_at"]):
        article["published_at"] = str(row["published_at"])
    elif "date" in row and pd.notna(row["date"]):
        article["published_at"] = str(row["date"])
    elif "timestamp" in row and pd.notna(row["timestamp"]):
        article["published_at"] = str(row["timestamp"])
    else:
        # Use current date as fallback
        article["published_at"] = datetime.now().isoformat()
    
    # Handle tags - use companyName as a tag, plus any other tags
    tags = []
    
    if "companyName" in row and pd.notna(row["companyName"]):
        tags.append(str(row["companyName"]))
    
    if "tags" in row and pd.notna(row["tags"]):
        if isinstance(row["tags"], list):
            tags.extend([str(tag) for tag in row["tags"]])
        elif isinstance(row["tags"], str):
            # Try to parse as JSON or comma-separated
            try:
                tags.extend(json.loads(row["tags"]))
            except:
                tags.extend([tag.strip() for tag in row["tags"].split(",") if tag.strip()])
    elif "category" in row and pd.notna(row["category"]):
        tags.append(str(row["category"]))
    elif "categories" in row and pd.notna(row["categories"]):
        if isinstance(row["categories"], list):
            tags.extend([str(cat) for cat in row["categories"]])
        else:
            tags.append(str(row["categories"]))
    
    # Add "tech news" as default tag if no tags
    if not tags:
        tags = ["tech", "news"]
    
    article["tags"] = tags
    
    # Clean up content - remove empty or very short articles
    if not article["content"] or article["content"] == "nan" or len(article["content"]) < 50:
        return None
    
    # Ensure title is not empty or just "nan"
    if not article["title"] or article["title"] == "Untitled" or article["title"] == "nan":
        return None
    
    # Clean title - ensure it's reasonable length
    if len(article["title"]) < 5:
        return None
    
    # Truncate very long titles
    if len(article["title"]) > 200:
        article["title"] = article["title"][:197] + "..."
    
    return article


def insert_article(article: Dict, api_url: str) -> Optional[Dict]:
    """
    Insert an article into D1 via the Workers API.
    
    Args:
        article: Article data dictionary
        api_url: Base URL of the Workers API
        
    Returns:
        Created article with ID, or None if failed
    """
    try:
        response = requests.post(
            f"{api_url}/articles",
            json=article,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"    Error inserting article '{article.get('title', 'Unknown')}': {e}")
        return None


def generate_embedding(article_id: int, article: Dict, api_url: str) -> bool:
    """
    Generate and store embedding for an article.
    
    Args:
        article_id: ID of the article
        article: Article data dictionary
        api_url: Base URL of the Workers API
        
    Returns:
        True if successful, False otherwise
    """
    try:
        response = requests.post(
            f"{api_url}/embed",
            json={
                "text": article["content"],
                "article_id": article_id,
                "title": article["title"],
                "tags": article["tags"],
                "published_at": article["published_at"],
            },
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        response.raise_for_status()
        return True
    except Exception as e:
        print(f"    Error generating embedding for article {article_id}: {e}")
        return False


def ingest_articles(df: pd.DataFrame, api_url: str, skip_embeddings: bool = False):
    """
    Ingest articles into D1 and generate embeddings.
    
    Args:
        df: DataFrame with articles
        api_url: Base URL of the Workers API
        skip_embeddings: If True, skip embedding generation
    """
    print(f"\nIngesting {len(df)} articles...")
    
    successful_inserts = 0
    successful_embeddings = 0
    failed_inserts = 0
    failed_embeddings = 0
    
    for idx, row in df.iterrows():
        if (idx + 1) % 100 == 0:
            print(f"  Progress: {idx + 1}/{len(df)} articles processed")
        
        # Transform article
        article = transform_article(row)
        if not article:
            print(f"  Skipping row {idx + 1}: Invalid article data")
            continue
        
        # Insert into D1
        created_article = insert_article(article, api_url)
        if not created_article:
            failed_inserts += 1
            time.sleep(DELAY_BETWEEN_REQUESTS)
            continue
        
        successful_inserts += 1
        article_id = created_article.get("id")
        
        if not article_id:
            print(f"    Warning: Article created but no ID returned")
            time.sleep(DELAY_BETWEEN_REQUESTS)
            continue
        
        # Generate embedding (unless skipped)
        if not skip_embeddings:
            if generate_embedding(article_id, article, api_url):
                successful_embeddings += 1
            else:
                failed_embeddings += 1
            time.sleep(DELAY_BETWEEN_REQUESTS)
        else:
            print(f"    Skipping embedding generation (article ID: {article_id})")
        
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    print(f"\n{'='*60}")
    print(f"Ingestion Summary:")
    print(f"  Successful inserts: {successful_inserts}")
    print(f"  Failed inserts: {failed_inserts}")
    if not skip_embeddings:
        print(f"  Successful embeddings: {successful_embeddings}")
        print(f"  Failed embeddings: {failed_embeddings}")
    print(f"{'='*60}")


def verify_articles(api_url: str, num_articles: int = 5):
    """
    Verify that articles were inserted correctly.
    
    Args:
        api_url: Base URL of the Workers API
        num_articles: Number of random articles to verify
    """
    print(f"\nVerifying {num_articles} random articles...")
    
    try:
        # Get all articles
        response = requests.get(f"{api_url}/articles", timeout=30)
        response.raise_for_status()
        articles = response.json()
        
        if not articles:
            print("  No articles found in database")
            return
        
        print(f"  Total articles in database: {len(articles)}")
        
        # Verify random articles
        import random
        sample_articles = random.sample(articles, min(num_articles, len(articles)))
        
        for article in sample_articles:
            article_id = article.get("id")
            title = article.get("title", "Unknown")
            print(f"\n  Article ID: {article_id}")
            print(f"    Title: {title[:80]}...")
            print(f"    Author: {article.get('author', 'N/A')}")
            print(f"    Published: {article.get('published_at', 'N/A')}")
            print(f"    Content length: {len(article.get('content', ''))} chars")
            print(f"    Tags: {article.get('tags', [])}")
        
        # Test search
        print(f"\n  Testing search functionality...")
        search_response = requests.post(
            f"{api_url}/search",
            json={"query": "artificial intelligence", "topK": 3},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        search_response.raise_for_status()
        search_results = search_response.json()
        
        print(f"    Search query: 'artificial intelligence'")
        print(f"    Results found: {search_results.get('count', 0)}")
        for result in search_results.get('results', [])[:3]:
            print(f"      - {result.get('title', 'Unknown')} (score: {result.get('score', 0):.3f})")
        
    except Exception as e:
        print(f"  Error during verification: {e}")


def main():
    parser = argparse.ArgumentParser(description="Ingest MongoDB Tech News dataset into NovaNewz")
    parser.add_argument(
        "--samples",
        type=int,
        default=5000,
        help="Number of articles to sample (default: 5000)"
    )
    parser.add_argument(
        "--api-url",
        type=str,
        default=os.getenv("API_BASE_URL", "http://localhost:8787"),
        help="Base URL of the Workers API"
    )
    parser.add_argument(
        "--skip-embeddings",
        action="store_true",
        help="Skip embedding generation (faster, but articles won't be searchable)"
    )
    parser.add_argument(
        "--verify-only",
        action="store_true",
        help="Only run verification, skip ingestion"
    )
    parser.add_argument(
        "--download-only",
        action="store_true",
        help="Only download dataset, don't ingest"
    )
    parser.add_argument(
        "--preview",
        type=int,
        default=0,
        help="Preview N transformed articles before ingesting (0 = no preview)"
    )
    
    args = parser.parse_args()
    
    print("="*60)
    print("NovaNewz Data Ingestion Script")
    print("="*60)
    print(f"API URL: {args.api_url}")
    print(f"Samples: {args.samples}")
    print(f"Skip embeddings: {args.skip_embeddings}")
    print("="*60)
    
    if args.verify_only:
        verify_articles(args.api_url)
        return
    
    # Download dataset
    try:
        df = download_dataset(args.samples)
        print(f"\nDataset shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        print(f"\nFirst few rows:")
        print(df.head())
    except Exception as e:
        print(f"Error downloading dataset: {e}")
        return
    
    if args.download_only:
        print("\nDownload complete. Use without --download-only to ingest data.")
        return
    
    # Preview transformed articles if requested
    if args.preview > 0:
        print(f"\nPreviewing {args.preview} transformed articles...")
        print("="*60)
        preview_count = 0
        for idx, row in df.iterrows():
            if preview_count >= args.preview:
                break
            article = transform_article(row)
            if article:
                print(f"\nArticle {preview_count + 1}:")
                print(f"  Title: {article['title'][:80]}...")
                print(f"  Content: {article['content'][:150]}...")
                print(f"  Author: {article['author']}")
                print(f"  Tags: {article['tags']}")
                print(f"  Published: {article['published_at']}")
                preview_count += 1
        print("\n" + "="*60)
        response = input("\nProceed with ingestion? (y/n): ")
        if response.lower() != 'y':
            print("Ingestion cancelled.")
            return
    
    # Ingest articles
    try:
        ingest_articles(df, args.api_url, skip_embeddings=args.skip_embeddings)
    except Exception as e:
        print(f"Error during ingestion: {e}")
        return
    
    # Verify
    if not args.skip_embeddings:
        time.sleep(2)  # Wait a bit for embeddings to be processed
        verify_articles(args.api_url)
    
    print("\nIngestion complete!")


if __name__ == "__main__":
    main()

