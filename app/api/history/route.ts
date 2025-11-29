import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, article_id } = body;
    
    // Mock history response
    const mockHistory = {
      summary: `This is a comprehensive overview of ${query}. The evolution of this technology has been remarkable over the past few years, with significant breakthroughs and developments shaping the industry. Key milestones include major product launches, technological innovations, and industry-wide adoption.`,
      timeline: [
        {
          date: "2022-01-15",
          event: `Initial breakthrough in ${query} technology announced`,
          title: "Major Innovation"
        },
        {
          date: "2022-06-20",
          event: "Industry leaders collaborate on standardization",
          title: "Industry Collaboration"
        },
        {
          date: "2023-03-10",
          event: `Commercial launch of ${query} solutions`,
          title: "Market Entry"
        },
        {
          date: "2023-09-05",
          event: "Widespread adoption across enterprises",
          title: "Mass Adoption"
        },
        {
          date: "2024-01-20",
          event: "Next generation technology unveiled",
          title: "Future Developments"
        }
      ],
      sources: [
        {
          id: 1,
          title: "AI Revolution: How Machine Learning is Transforming Industries",
          date: "1/15/2024",
          link: "/articles/1"
        },
        {
          id: 2,
          title: "Cloud Computing Trends 2024: What's Next for Enterprise IT",
          date: "1/20/2024",
          link: "/articles/2"
        },
        {
          id: 3,
          title: "Cybersecurity in the Age of Remote Work: Best Practices",
          date: "1/25/2024",
          link: "/articles/3"
        }
      ]
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json(mockHistory);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate history' },
      { status: 500 }
    );
  }
}
