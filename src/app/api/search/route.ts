import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchQuery } = await request.json();

    if (!searchQuery) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    const tavilyKey = process.env.TAVILY_API_KEY;
    if (!tavilyKey) {
      return NextResponse.json(
        { error: 'Search service not configured' },
        { status: 503 }
      );
    }

    const searchResults = await fetch(
      `https://api.tavily.com/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${searchQuery} India Supreme Court High Court judgment 2024 2023`,
          search_depth: 'basic',
          max_results: 5,
          include_answer: true,
          include_raw_content: false,
        }),
      }
    );

    const data = await searchResults.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No relevant case law found. Please try different search terms.',
      });
    }

    const formattedResults = data.results.map((result: any) => ({
      title: result.title || 'Unknown Case',
      url: result.url,
      snippet: result.content || '',
      publishedDate: result.published_date || 'Recent',
      score: result.score || 0,
    }));

    await supabase.from('usage').insert({
      user_id: user.id,
      action_type: 'search',
      tokens_used: 1,
    } as never);

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    );
  }
}
