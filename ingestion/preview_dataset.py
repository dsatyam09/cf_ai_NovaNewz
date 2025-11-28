#!/usr/bin/env python3
"""
Simple dataset preview script - no API required.
Use this to explore the dataset before ingesting.
"""

import pandas as pd
import requests
from io import BytesIO
import json

def preview_dataset(num_samples=10):
    """Download and preview the dataset."""
    print("Downloading sample from Hugging Face...")
    print("=" * 60)
    
    url = "https://huggingface.co/api/datasets/AIatMongoDB/tech-news-embeddings/parquet/default/train/0000.parquet"
    
    try:
        r = requests.get(url, timeout=60)
        r.raise_for_status()
        df = pd.read_parquet(BytesIO(r.content))
        
        print(f"✓ Downloaded {len(df)} articles")
        print(f"\nColumns: {df.columns.tolist()}")
        print(f"\nShowing {num_samples} random samples:")
        print("=" * 60)
        
        sample_df = df.sample(n=min(num_samples, len(df)))
        
        for idx, (_, row) in enumerate(sample_df.iterrows(), 1):
            print(f"\n{idx}. {row['title']}")
            print(f"   Company: {row['companyName']}")
            print(f"   Published: {row['published_at']}")
            print(f"   Description: {row['description'][:150]}...")
            if 'url' in row:
                print(f"   URL: {row['url']}")
        
        print("\n" + "=" * 60)
        print(f"\nDataset Statistics:")
        print(f"  Total articles: {len(df)}")
        print(f"  Date range: {df['published_at'].min()} to {df['published_at'].max()}")
        print(f"  Unique companies: {df['companyName'].nunique()}")
        print(f"\nTop 10 companies by article count:")
        print(df['companyName'].value_counts().head(10))
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    import sys
    num = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    preview_dataset(num)
