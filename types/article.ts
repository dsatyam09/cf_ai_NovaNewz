// Article type definitions
export interface Article {
  id?: number;
  title: string;
  content: string;
  tags?: string[];
  author?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Embedding {
  article_id: number;
  vector: number[];
  metadata: Record<string, any>;
}

