import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-2xl opacity-20 animate-pulse"></div>
              <h1 className="relative text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NovaNewz
              </h1>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-gray-700 mb-4 font-medium">
            🚀 AI-powered Tech News Intelligence Platform
          </p>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Harness the power of RAG, Vector Search, and LLMs to explore tech history
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/history"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 text-center group hover:scale-105 border border-blue-100 hover:border-blue-200 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">🔍 History Explorer</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Search any tech topic and get <span className="font-semibold text-blue-600">AI-generated</span> historical summaries with timelines
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-blue-600 font-medium">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                Powered by Llama 3 + Vector Search
              </div>
            </div>
          </Link>
          
          <Link
            href="/reporter"
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 text-center group hover:scale-105 border border-emerald-100 hover:border-emerald-200 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-emerald-600 transition-colors">📝 Reporter Console</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create, edit, and manage tech news articles in the <span className="font-semibold text-emerald-600">cloud database</span>
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-600 font-medium">
                <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
                Cloudflare D1 + Vectorize
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
