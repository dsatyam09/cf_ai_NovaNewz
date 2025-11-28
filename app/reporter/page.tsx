"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getArticles, deleteArticle, generateEmbedding } from "@/lib/api";
import type { Article } from "@/types/article";

export default function ReporterPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatingEmbedding, setGeneratingEmbedding] = useState<number | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getArticles();
      setArticles(data);
    } catch (err) {
      setError("Failed to load articles. Please refresh the page.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }
    setError(null);
    try {
      await deleteArticle(id);
      setSuccessMessage("Article deleted successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadArticles();
    } catch (err: any) {
      setError(err.message || "Failed to delete article. Please try again.");
    }
  };

  const handleGenerateEmbedding = async (article: Article) => {
    if (!article.id) return;
    
    setGeneratingEmbedding(article.id);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await generateEmbedding(article.content, article.id, {
        title: article.title,
        tags: Array.isArray(article.tags) ? article.tags : [],
        published_at: article.published_at,
      });
      setSuccessMessage(`Embedding generated successfully! Article "${article.title}" is now searchable.`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to generate embedding. Please try again.");
    } finally {
      setGeneratingEmbedding(null);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Reporter Console</h1>
          <Link
            href="/reporter/new"
            className="px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors shadow-sm hover:shadow-md w-full sm:w-auto text-center"
          >
            + Create New Article
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 ml-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-green-700 hover:text-green-900 ml-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#3B82F6] border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading articles...</p>
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 text-lg mb-2">No articles found</p>
            <p className="text-gray-500 text-sm mb-6">Create your first article to get started!</p>
            <Link
              href="/reporter/new"
              className="inline-block px-6 py-3 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors"
            >
              Create New Article
            </Link>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/articles/${article.id}`}
                          className="text-[#3B82F6] hover:text-[#2563EB] hover:underline font-medium"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {article.author || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {Array.isArray(article.tags) && article.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{article.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/reporter/${article.id}`}
                            className="px-3 py-1.5 bg-[#FBBF24] text-white rounded hover:bg-[#F59E0B] transition-colors text-xs font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleGenerateEmbedding(article)}
                            disabled={generatingEmbedding === article.id}
                            className="px-3 py-1.5 bg-[#3B82F6] text-white rounded hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                          >
                            {generatingEmbedding === article.id ? "Generating..." : "Embed"}
                          </button>
                          <button
                            onClick={() => article.id && handleDelete(article.id)}
                            className="px-3 py-1.5 bg-[#EF4444] text-white rounded hover:bg-[#DC2626] transition-colors text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {articles.map((article) => (
                <div key={article.id} className="p-4">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-[#3B82F6] hover:text-[#2563EB] font-medium text-base mb-2 block"
                  >
                    {article.title}
                  </Link>
                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <div>Author: {article.author || "N/A"}</div>
                    <div>Date: {article.published_at ? new Date(article.published_at).toLocaleDateString() : "N/A"}</div>
                    {Array.isArray(article.tags) && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link
                      href={`/reporter/${article.id}`}
                      className="flex-1 px-3 py-2 bg-[#FBBF24] text-white rounded hover:bg-[#F59E0B] transition-colors text-xs font-medium text-center"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleGenerateEmbedding(article)}
                      disabled={generatingEmbedding === article.id}
                      className="flex-1 px-3 py-2 bg-[#3B82F6] text-white rounded hover:bg-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      {generatingEmbedding === article.id ? "Generating..." : "Embed"}
                    </button>
                    <button
                      onClick={() => article.id && handleDelete(article.id)}
                      className="flex-1 px-3 py-2 bg-[#EF4444] text-white rounded hover:bg-[#DC2626] transition-colors text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
