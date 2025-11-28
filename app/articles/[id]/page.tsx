"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getArticleById, generateHistory } from "@/lib/api";
import type { Article } from "@/types/article";

export default function ArticleDetailPage() {
  const params = useParams();
  const articleId = params.id as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingHistory, setIsGeneratingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyResult, setHistoryResult] = useState<any>(null);

  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getArticleById(parseInt(articleId));
      setArticle(data);
    } catch (error: any) {
      console.error("Error loading article:", error);
      setError(error.message || "Failed to load article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateHistory = async () => {
    if (!article) return;
    
    setIsGeneratingHistory(true);
    setHistoryError(null);
    setHistoryResult(null);
    
    try {
      const query = article.title;
      const result = await generateHistory(query, article.id);
      setHistoryResult(result);
    } catch (error: any) {
      console.error("Error generating history:", error);
      setHistoryError(error.message || "Failed to generate history. Please try again.");
    } finally {
      setIsGeneratingHistory(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#3B82F6] border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading article...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">{error || "Article not found"}</p>
          </div>
          <Link href="/reporter" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline flex items-center gap-1 inline-block">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reporter Console
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Link href="/reporter" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reporter Console
          </Link>
        </div>

        <article className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">{article.title}</h1>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            {article.author && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {article.author}
              </span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(article.published_at).toLocaleDateString()}
              </span>
            )}
            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {article.tags.join(", ")}
              </span>
            )}
          </div>

          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-base sm:text-lg">
              {article.content}
            </pre>
          </div>
        </article>

        <div className="mb-6">
          <button
            onClick={handleGenerateHistory}
            disabled={isGeneratingHistory}
            className="w-full sm:w-auto px-6 py-3 bg-[#3B82F6] text-white rounded-lg font-medium hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isGeneratingHistory ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating History...
              </span>
            ) : (
              "Generate history for this article"
            )}
          </button>
        </div>

        {historyError && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="font-medium">{historyError}</p>
          </div>
        )}

        {historyResult && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Historical Summary</h2>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{historyResult.summary}</p>
            </div>

            {historyResult.timeline && historyResult.timeline.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
                <h2 className="text-2xl font-semibold mb-6 text-gray-900">Timeline</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <ul className="space-y-6">
                    {historyResult.timeline.map((item: any, index: number) => (
                      <li key={index} className="relative pl-12">
                        <div className="absolute left-3 top-1.5 w-3 h-3 bg-[#3B82F6] rounded-full border-2 border-white shadow-sm"></div>
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                          <span className="font-semibold text-gray-700 text-sm sm:text-base min-w-[100px] sm:min-w-[120px]">
                            {item.date}
                          </span>
                          <span className="text-gray-700 text-sm sm:text-base flex-1">{item.event}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {historyResult.sources && historyResult.sources.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">Source Articles</h2>
                <ul className="space-y-4 divide-y divide-gray-200">
                  {historyResult.sources.map((source: any) => (
                    <li key={source.id} className="pt-4 first:pt-0">
                      <a
                        href={source.link || `/articles/${source.id}`}
                        className="text-[#3B82F6] hover:text-[#2563EB] hover:underline font-medium text-base sm:text-lg block mb-1"
                      >
                        {source.title}
                      </a>
                      <p className="text-sm text-gray-500 mt-1">{source.date}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
