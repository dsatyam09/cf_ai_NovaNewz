// ArticleCard component
import Link from "next/link";
import type { Article } from "@/types/article";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
      <Link href={`/articles/${article.id}`}>
        <h3 className="text-xl font-semibold mb-2 text-[#3B82F6] hover:underline">
          {article.title}
        </h3>
      </Link>
      <div className="text-sm text-gray-600 mb-3">
        {article.author && <span>By {article.author}</span>}
        {article.published_at && (
          <span className="ml-2">{new Date(article.published_at).toLocaleDateString()}</span>
        )}
      </div>
      {Array.isArray(article.tags) && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {article.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="text-gray-700 line-clamp-3">
        {article.content.substring(0, 200)}...
      </p>
    </div>
  );
}
