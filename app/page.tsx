"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Dark Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 pt-12 animate-fade-in">
            <div className="inline-block mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-sky-500 blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative flex items-center justify-center gap-4">
                  {/* Newspaper Icon */}
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM2 19V5h8v14H2zm18 0h-8V5h8v14zM4 7h4v2H4V7zm0 4h4v2H4v-2zm0 4h4v2H4v-2zm12-8h4v6h-4V7zm0 8h4v2h-4v-2z"/>
                  </svg>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-sky-400 bg-clip-text text-transparent drop-shadow-2xl">
                    NovaNewz
                  </h1>
                </div>
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto mb-8 backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              <p className="text-xl sm:text-2xl text-white/90 mb-3 font-bold">
                Your Intelligent Tech News Aggregator
              </p>
              <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                Stay ahead of the curve with instant access to 20,000+ curated technology articles. Search by topic, explore historical trends, and get AI-powered summaries tailored to your needs.
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {['Smart Search', 'Historical Analysis', 'AI Summaries', 'Real-time Updates', 'Topic Tracking'].map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white/80 text-xs rounded-full border border-white/20 font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* History Explorer Card */}
            <Link href="/history">
              <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-cyan-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 inline-block">
                    <div className="p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    🔍 History Explorer
                  </h2>

                  <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
                    Track technology evolution over time. Get comprehensive historical analysis of any tech topic with AI-generated summaries and visual timelines.
                  </p>

                  <ul className="space-y-2 mb-6">
                    {['Semantic search across articles', 'AI-powered summaries', 'Visual timeline generation'].map((feature, i) => (
                      <li key={i} className="flex items-center text-white/60 text-sm">
                        <svg className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center text-cyan-300 font-semibold group-hover:text-cyan-200">
                    <span>Explore History</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Reporter Console Card */}
            <Link href="/reporter">
              <div className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 inline-block">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-emerald-500/50 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                    📝 Reporter Console
                  </h2>

                  <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4">
                    Manage and organize your tech news collection. Add articles, generate searchable embeddings, and keep your knowledge base up-to-date.
                  </p>

                  <ul className="space-y-2 mb-6">
                    {['Article management', 'Embedding generation', 'Cloud-powered storage'].map((feature, i) => (
                      <li key={i} className="flex items-center text-white/60 text-sm">
                        <svg className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center text-emerald-300 font-semibold group-hover:text-emerald-200">
                    <span>Manage Articles</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '200ms'}}>
            {[
              { value: '20K+', label: 'Articles', icon: '📰' },
              { value: 'Instant', label: 'Search', icon: '⚡' },
              { value: 'AI-Powered', label: 'Summaries', icon: '🤖' },
              { value: 'Real-time', label: 'Updates', icon: '🔄' },
            ].map((stat, i) => (
              <div key={i} className="backdrop-blur-md bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-cyan-400/20 transition-all hover:scale-105">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
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
