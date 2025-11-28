// API call helper functions for making API calls to Cloudflare Workers
import type { Article } from "@/types/article";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// Articles API
export async function getArticles(): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/articles`);
  if (!response.ok) {
    throw new Error("Failed to fetch articles");
  }
  return response.json();
}

export async function getArticleById(id: number): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch article");
  }
  return response.json();
}

export async function createArticle(article: Omit<Article, "id" | "created_at" | "updated_at">): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(article),
  });
  if (!response.ok) {
    throw new Error("Failed to create article");
  }
  return response.json();
}

export async function updateArticle(id: number, article: Partial<Article>): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(article),
  });
  if (!response.ok) {
    throw new Error("Failed to update article");
  }
  return response.json();
}

export async function deleteArticle(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete article");
  }
  return response.json();
}

// Embed API
export async function generateEmbedding(
  text: string,
  article_id?: number,
  metadata?: { title?: string; tags?: string[]; published_at?: string }
): Promise<{ embedding: number[]; article_id: number | null; dimensions?: number }> {
  const response = await fetch(`${API_BASE_URL}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      article_id,
      title: metadata?.title,
      tags: metadata?.tags,
      published_at: metadata?.published_at,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to generate embedding" }));
    throw new Error(error.error || "Failed to generate embedding");
  }
  return response.json();
}

// Search API
export async function searchArticles(query: string, topK: number = 10): Promise<{ query: string; results: any[]; count: number }> {
  const response = await fetch(`${API_BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, topK }),
  });
  if (!response.ok) {
    throw new Error("Failed to search articles");
  }
  return response.json();
}

// History API
export interface HistoryResponse {
  summary: string;
  timeline: Array<{ date: string; event: string }>;
  sources: Array<{ id: number; title: string; date: string; link: string }>;
}

export async function generateHistory(query: string, article_id?: number): Promise<HistoryResponse> {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, article_id }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate history");
  }
  return response.json();
}
