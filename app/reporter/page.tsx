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
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/images.jpeg')",
          }}
        ></div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400 bg-clip-text text-transparent">Reporter Console</h1>
          </div>
          <Link
            href="/reporter/new"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 w-full sm:w-auto text-center border border-white/20"
          >
            + Create New Article
          </Link>
        </div>

        {error && (
          <div className="backdrop-blur-md bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-200 hover:text-red-100 ml-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="backdrop-blur-md bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 px-4 py-3 rounded-2xl mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-cyan-200 hover:text-cyan-100 ml-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-cyan-400"></div>
            </div>
            <p className="mt-6 text-white/90 font-medium text-lg">Loading articles...</p>
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="backdrop-blur-md bg-white/10 border border-cyan-400/20 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg mb-6">
              <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white/90 text-xl font-semibold mb-3">No articles found</p>
            <p className="text-white/60 text-sm sm:text-base mb-6">Create your first article to get started!</p>
            <Link
              href="/reporter/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 border border-white/20"
            >
              Create New Article
            </Link>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/articles/${article.id}`}
                          className="text-cyan-300 hover:text-cyan-200 hover:underline font-medium"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {article.author || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60 whitespace-nowrap">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {Array.isArray(article.tags) && article.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs border border-white/20">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 2 && (
                              <span className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs border border-white/20">
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
                            className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg hover:scale-105 transition-all text-xs font-medium shadow-lg"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleGenerateEmbedding(article)}
                            disabled={generatingEmbedding === article.id}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shadow-lg"
                          >
                            {generatingEmbedding === article.id ? "Generating..." : "Embed"}
                          </button>
                          <button
                            onClick={() => article.id && handleDelete(article.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg hover:scale-105 transition-all text-xs font-medium shadow-lg"
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
            <div className="md:hidden divide-y divide-white/10">
              {articles.map((article) => (
                <div key={article.id} className="p-4 backdrop-blur-sm hover:bg-white/5 transition-colors">
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-cyan-300 hover:text-cyan-200 font-medium text-base mb-2 block"
                  >
                    {article.title}
                  </Link>
                  <div className="text-sm text-white/60 space-y-1 mb-3">
                    <div>Author: {article.author || "N/A"}</div>
                    <div>Date: {article.published_at ? new Date(article.published_at).toLocaleDateString() : "N/A"}</div>
                    {Array.isArray(article.tags) && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs border border-white/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link
                      href={`/reporter/${article.id}`}
                      className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg hover:scale-105 transition-all text-xs font-medium text-center shadow-lg"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleGenerateEmbedding(article)}
                      disabled={generatingEmbedding === article.id}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium shadow-lg"
                    >
                      {generatingEmbedding === article.id ? "Generating..." : "Embed"}
                    </button>
                    <button
                      onClick={() => article.id && handleDelete(article.id)}
                      className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg hover:scale-105 transition-all text-xs font-medium shadow-lg"
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
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
