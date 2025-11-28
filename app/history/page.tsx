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
    <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center">History Explorer</h1>
        
        <div className="mb-6 sm:mb-8">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#3B82F6] border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-medium">Generating historical summary...</p>
            <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
          </div>
        )}

        {summary && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Historical Summary</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">{summary}</p>
            </div>
          </div>
        )}

        {timeline.length > 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Timeline of Key Events</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <ul className="space-y-6">
                {timeline.map((item, index) => (
                  <li key={index} className="relative pl-12">
                    {/* Timeline dot */}
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

        {sources.length > 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Source Articles</h2>
              <button
                onClick={() => setShowSources(!showSources)}
                className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1"
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
                    Show ({sources.length})
                  </>
                )}
              </button>
            </div>
            
            {showSources && (
              <ul className="space-y-4 divide-y divide-gray-200">
                {sources.map((source) => (
                  <li key={source.id} className="pt-4 first:pt-0">
                    <a
                      href={source.link || `/articles/${source.id}`}
                      className="text-[#3B82F6] hover:text-[#2563EB] hover:underline font-medium text-base sm:text-lg block mb-1"
                    >
                      {source.title}
                    </a>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {source.date}
                      </span>
                      {source.tags && Array.isArray(source.tags) && source.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {source.tags.join(", ")}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!isLoading && !summary && !error && (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center" style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}>
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-gray-600 text-lg">Enter a tech topic above to explore its history</p>
            <p className="text-gray-500 text-sm mt-2">Try searching for topics like "artificial intelligence", "cloud computing", or "blockchain"</p>
          </div>
        )}
      </div>
    </main>
  );
}
