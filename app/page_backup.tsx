import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">NovaNewz</h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            AI-powered Tech News Historical Intelligence Platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/history"
            className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow text-center group"
            style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}
          >
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-[#3B82F6] group-hover:text-[#2563EB] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">History Explorer</h2>
            <p className="text-gray-600 text-sm">
              Search any tech topic and get AI-generated historical summaries with timelines
            </p>
          </Link>
          
          <Link
            href="/reporter"
            className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow text-center group"
            style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.1)" }}
          >
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-[#10B981] group-hover:text-[#059669] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Reporter Console</h2>
            <p className="text-gray-600 text-sm">
              Create, edit, and manage tech news articles in the database
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
