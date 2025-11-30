"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import { generateHistory } from "@/lib/api";

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<Array<{ date: string; event: string }>>([]);
  const [sources, setSources] = useState<Array<{ id: number; title: string; date: string; link: string; tags?: string[] }>>([]);
  const [showSources, setShowSources] = useState(true);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    setTimeline([]);
    setSources([]);
    
    try {
      const result = await generateHistory(query);
      setSummary(result.summary);
      setTimeline(result.timeline);
      setSources(result.sources);
    } catch (error: any) {
      console.error("Error generating history:", error);
      setError(error.message || "Failed to generate history. Please try again.");
      setSummary(null);
      setTimeline([]);
      setSources([]);
    } finally {
      setIsLoading(false);
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
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400 bg-clip-text text-transparent">
                History Explorer
              </h1>
            </div>
            <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto">
              Explore tech history with AI-powered semantic search across 20,000+ articles
            </p>
          </div>
          
          <div className="mb-6 sm:mb-8 animate-fade-in" style={{animationDelay: '100ms'}}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {error && (
            <div className="backdrop-blur-md bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-2xl mb-6 shadow-lg animate-fade-in">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-16 animate-fade-in">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-blue-400"></div>
              </div>
              <p className="mt-6 text-white/90 font-medium text-lg">Generating historical summary...</p>
              <p className="mt-2 text-sm text-white/60">Analyzing articles with Llama 3</p>
            </div>
          )}

          {summary && !isLoading && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl hover:border-white/30 transition-all animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Historical Summary</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-white/80 leading-relaxed text-base sm:text-lg whitespace-pre-wrap">{summary}</p>
              </div>
            </div>
          )}

          {timeline.length > 0 && !isLoading && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 mb-6 shadow-2xl hover:border-white/30 transition-all animate-fade-in" style={{animationDelay: '100ms'}}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Timeline of Key Events</h2>
              </div>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-400 to-sky-400"></div>
                
                <ul className="space-y-6">
                  {timeline.map((item, index) => (
                    <li key={index} className="relative pl-12 group">
                      {/* Timeline dot */}
                      <div className="absolute left-2.5 top-1.5 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full border-2 border-white/20 shadow-lg group-hover:scale-125 transition-transform"></div>
                      
                      <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-400/20 hover:bg-white/10 transition-all">
                        <span className="font-bold text-cyan-300 text-sm sm:text-base block mb-2">
                          📅 {item.date}
                        </span>
                        <span className="text-white/80 text-sm sm:text-base">{item.event}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {sources.length > 0 && !isLoading && (
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl hover:border-white/30 transition-all animate-fade-in" style={{animationDelay: '200ms'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Source Articles ({sources.length})</h2>
                </div>
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 font-medium flex items-center gap-2 transition-all"
                >
                  {showSources ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show
                    </>
                  )}
                </button>
              </div>
              
              {showSources && (
                <ul className="space-y-4">
                  {sources.map((source, index) => (
                    <li key={source.id} className="backdrop-blur-sm bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-cyan-400/20 hover:bg-white/10 transition-all group animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                      <a
                        href={source.link || `/articles/${source.id}`}
                        className="text-cyan-300 hover:text-cyan-200 font-semibold text-base sm:text-lg block mb-2 group-hover:underline"
                      >
                        {source.title}
                      </a>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {source.date}
                        </span>
                        {source.tags && Array.isArray(source.tags) && source.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {source.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-full border border-white/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {!isLoading && !summary && !error && (
            <div className="backdrop-blur-md bg-white/10 border border-cyan-400/20 rounded-3xl p-8 sm:p-12 text-center shadow-2xl animate-fade-in">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                  <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-white/90 text-xl font-semibold mb-3">Enter a tech topic to explore its history</p>
              <p className="text-white/60 text-sm sm:text-base">
                Try searching for topics like "artificial intelligence", "cloud computing", or "blockchain"
              </p>
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
