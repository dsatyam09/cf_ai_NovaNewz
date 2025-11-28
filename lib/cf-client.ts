// Cloudflare D1 + Vectorize bindings
// This file contains client-side utilities for interacting with Cloudflare services

import type { Article, Embedding } from "@/types/article";

// D1 Database connection interface
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1ExecResult>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

// Vectorize connection interface
export interface VectorizeIndex {
  insert(vectors: Array<{ id: string; values: number[]; metadata?: Record<string, any> }>): Promise<void>;
  query(vector: number[], options?: { topK?: number; returnValues?: boolean; returnMetadata?: boolean }): Promise<Array<{ id: string; score: number; values?: number[]; metadata?: Record<string, any> }>>;
}

// D1 Article CRUD methods
export class D1Client {
  constructor(private db: D1Database) {}

  async getArticles(): Promise<Article[]> {
    // Placeholder - will implement actual D1 query
    const query = this.db.prepare("SELECT * FROM articles ORDER BY published_at DESC");
    const result = await query.all<Article>();
    return result.results || [];
  }

  async getArticleById(id: number): Promise<Article | null> {
    // Placeholder - will implement actual D1 query
    const query = this.db.prepare("SELECT * FROM articles WHERE id = ?").bind(id);
    const result = await query.first<Article>();
    return result || null;
  }

  async createArticle(article: Omit<Article, "id" | "created_at" | "updated_at">): Promise<Article> {
    // Placeholder - will implement actual D1 insert
    const now = new Date().toISOString();
    const tagsStr = article.tags ? JSON.stringify(article.tags) : null;
    
    const query = this.db.prepare(
      "INSERT INTO articles (title, content, tags, author, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *"
    ).bind(
      article.title,
      article.content,
      tagsStr,
      article.author || null,
      article.published_at || now,
      now,
      now
    );
    
    const result = await query.first<Article>();
    if (!result) {
      throw new Error("Failed to create article");
    }
    return result;
  }

  async updateArticle(id: number, article: Partial<Omit<Article, "id" | "created_at">>): Promise<Article> {
    // Placeholder - will implement actual D1 update
    const now = new Date().toISOString();
    const tagsStr = article.tags ? JSON.stringify(article.tags) : null;
    
    const query = this.db.prepare(
      "UPDATE articles SET title = ?, content = ?, tags = ?, author = ?, published_at = ?, updated_at = ? WHERE id = ? RETURNING *"
    ).bind(
      article.title,
      article.content,
      tagsStr,
      article.author,
      article.published_at,
      now,
      id
    );
    
    const result = await query.first<Article>();
    if (!result) {
      throw new Error("Failed to update article");
    }
    return result;
  }

  async deleteArticle(id: number): Promise<boolean> {
    // Placeholder - will implement actual D1 delete
    const query = this.db.prepare("DELETE FROM articles WHERE id = ?").bind(id);
    const result = await query.run();
    return result.success && (result.meta.changes || 0) > 0;
  }
}

// Vectorize methods
export class VectorizeClient {
  constructor(private index: VectorizeIndex) {}

  async storeEmbedding(article_id: number, embedding: number[], metadata: Record<string, any>): Promise<void> {
    // Placeholder - will implement actual Vectorize insert
    await this.index.insert([
      {
        id: `article_${article_id}`,
        values: embedding,
        metadata: {
          article_id,
          ...metadata,
        },
      },
    ]);
  }

  async queryVector(queryEmbedding: number[], topK: number = 10): Promise<Array<{ id: string; score: number; metadata?: Record<string, any> }>> {
    // Placeholder - will implement actual Vectorize query
    const results = await this.index.query(queryEmbedding, {
      topK,
      returnValues: false,
      returnMetadata: true,
    });
    return results;
  }
}
