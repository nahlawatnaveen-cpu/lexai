export async function searchCaseLaw(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  
  if (!tavilyKey) {
    return "Search service not configured. Please add your Tavily API key.";
  }

  try {
    const searchQuery = `${query} India Supreme Court High Court judgment 2024 2023`;
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: searchQuery,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      return "No relevant case law found. Please try different search terms or consult a legal professional.";
    }

    let responseText = "📚 **Relevant Case Law & Judgments**\n\n";

    for (const result of results.slice(0, 5)) {
      const title = result.title || 'Unknown Case';
      const url = result.url || '';
      const content = result.content || '';
      const publishedDate = result.published_date || 'Recent';

      const citation = extractCitation(title);
      const ratio = extractRatio(content);
      const summary = extractSummary(content);

      responseText += `**Case:** ${title}\n`;
      responseText += `**Citation:** ${citation}\n`;
      responseText += `**Date:** ${publishedDate}\n`;
      responseText += `**Court:** Supreme Court/High Court of India\n\n`;
      responseText += `**Key Ratio:**\n${ratio}\n\n`;
      responseText += `**Summary:**\n${summary}\n\n`;
      responseText += `**Source:** [View Judgment](${url})\n\n`;
      responseText += `---\n\n`;
    }

    responseText += "\n⚠️ **Disclaimer:** This information is for reference only. Always verify with official sources and consult a qualified lawyer.";

    return responseText;
  } catch (error) {
    console.error('Tavily search error:', error);
    return "Unable to search case law at the moment. Please try again later or consult a legal professional.";
  }
}

function extractCitation(title: string): string {
  const yearMatch = title.match(/\((\d{4})\)/) || title.match(/20\d{2}/);
  if (yearMatch) {
    return `AIR ${yearMatch[0]}`;
  }
  return '[Citation pending verification]';
}

function extractRatio(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());
  const keyLines = lines.slice(0, 3).join(' ');
  return keyLines.length > 500 ? keyLines.substring(0, 500) + '...' : keyLines || 'Key reasoning pending';
}

function extractSummary(content: string): string {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length > 3) {
    return lines.slice(0, 5).join(' ').substring(0, 800) + '...';
  }
  return content.substring(0, 800) + '...';
}
