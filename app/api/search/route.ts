import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, topK = 10 } = body;
    
    // Mock search results
    const mockResults = [
      {
        id: 1,
        title: "AI Revolution: How Machine Learning is Transforming Industries",
        content: "Artificial Intelligence and Machine Learning are revolutionizing industries...",
        score: 0.95,
        author: "Tech News Daily",
        tags: ["AI", "Machine Learning", "Technology"],
        published_at: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        title: "Cloud Computing Trends 2024: What's Next for Enterprise IT",
        content: "Cloud computing continues to evolve rapidly...",
        score: 0.87,
        author: "Cloud Insights",
        tags: ["Cloud", "Enterprise", "Infrastructure"],
        published_at: "2024-01-20T14:30:00Z"
      },
      {
        id: 3,
        title: "Cybersecurity in the Age of Remote Work: Best Practices",
        content: "The shift to remote work has created new cybersecurity challenges...",
        score: 0.82,
        author: "Security Weekly",
        tags: ["Cybersecurity", "Remote Work", "Security"],
        published_at: "2024-01-25T09:15:00Z"
      }
    ];
    
    return NextResponse.json({
      query,
      results: mockResults.slice(0, topK),
      count: mockResults.length
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    );
  }
}
