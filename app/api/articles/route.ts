import { NextResponse } from 'next/server';

// Mock articles data for local development
let mockArticles: any[] = [
  {
    id: 1,
    title: "AI Revolution: How Machine Learning is Transforming Industries",
    content: "Artificial Intelligence and Machine Learning are revolutionizing industries across the globe. From healthcare to finance, autonomous vehicles to customer service, AI is creating new possibilities and efficiencies. Companies are investing billions in AI research and development, leading to breakthrough innovations in natural language processing, computer vision, and predictive analytics. The integration of AI into everyday applications is making technology more intuitive and powerful, changing how we work, communicate, and solve complex problems.",
    author: "Tech News Daily",
    tags: ["AI", "Machine Learning", "Technology"],
    published_at: "2024-01-15T10:00:00Z",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Cloud Computing Trends 2024: What's Next for Enterprise IT",
    content: "Cloud computing continues to evolve rapidly, with new trends emerging in multi-cloud strategies, edge computing, and serverless architectures. Organizations are increasingly adopting hybrid cloud solutions to balance performance, cost, and security requirements. The rise of containers and Kubernetes has standardized application deployment, while serverless computing is enabling developers to focus on code rather than infrastructure. As businesses digitally transform, cloud platforms are becoming the foundation for innovation and agility.",
    author: "Cloud Insights",
    tags: ["Cloud", "Enterprise", "Infrastructure"],
    published_at: "2024-01-20T14:30:00Z",
    created_at: "2024-01-20T14:30:00Z",
    updated_at: "2024-01-20T14:30:00Z"
  },
  {
    id: 3,
    title: "Cybersecurity in the Age of Remote Work: Best Practices",
    content: "The shift to remote work has created new cybersecurity challenges for organizations worldwide. With employees accessing corporate resources from various locations and devices, traditional security perimeters have dissolved. Companies are implementing zero-trust architectures, multi-factor authentication, and endpoint protection to secure their distributed workforce. VPNs, encrypted communications, and security awareness training have become essential components of modern cybersecurity strategies. As cyber threats evolve, organizations must continuously adapt their security posture.",
    author: "Security Weekly",
    tags: ["Cybersecurity", "Remote Work", "Security"],
    published_at: "2024-01-25T09:15:00Z",
    created_at: "2024-01-25T09:15:00Z",
    updated_at: "2024-01-25T09:15:00Z"
  }
];

let nextId = 4;

export async function GET() {
  return NextResponse.json(mockArticles);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newArticle = {
      id: nextId++,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockArticles.push(newArticle);
    
    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
