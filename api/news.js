import Parser from 'rss-parser';

// Use Google News RSS - much more reliable
const RSS_FEEDS = [
  { 
    name: 'Google News', 
    url: 'https://news.google.com/rss/search?q=Robin+van+Persie+OR+Feyenoord+van+persie&hl=nl&gl=NL&ceid=NL:nl'
  },
];

// Extract source from Google News item
function extractSource(item) {
  // Google News items have source in the title like "Source - Headline"
  const title = item.title || '';
  const match = title.match(/^([^-]+)-/);
  return match ? match[1].trim() : 'Google News';
}

// Format time ago
function getTimeAgo(date) {
  const now = new Date();
  const pubDate = new Date(date);
  const diffMs = now - pubDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} minuten geleden`;
  } else if (diffHours < 24) {
    return `${diffHours} uur geleden`;
  } else if (diffDays === 1) {
    return 'Gisteren';
  } else if (diffDays < 7) {
    return `${diffDays} dagen geleden`;
  } else {
    return pubDate.toLocaleDateString('nl-NL');
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; RVPCoach/1.0; +https://isrvpcoachvanfeyenoord.vercel.app)',
    },
  });

  try {
    const allItems = [];

    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
      try {
        const feed = await parser.parseURL(feedConfig.url);
        return feed.items.map(item => {
          // Extract source and clean title for Google News
          const fullTitle = item.title || '';
          const sourceMatch = fullTitle.match(/^([^-]+)-(.+)$/);
          
          return {
            source: sourceMatch ? sourceMatch[1].trim() : feedConfig.name,
            title: sourceMatch ? sourceMatch[2].trim() : fullTitle,
            link: item.link,
            pubDate: item.pubDate || item.isoDate,
            contentSnippet: item.contentSnippet,
            content: item.content,
          };
        });
      } catch (error) {
        console.error(`Error fetching ${feedConfig.name}:`, error.message);
        return []; // Return empty array if feed fails
      }
    });

    const feedResults = await Promise.all(feedPromises);
    feedResults.forEach(items => allItems.push(...items));

    // Sort by date (newest first) - no keyword filtering needed, Google News already filtered
    allItems.sort((a, b) => {
      const dateA = new Date(a.pubDate);
      const dateB = new Date(b.pubDate);
      return dateB - dateA;
    });

    // Take top 10 most recent
    const topItems = allItems.slice(0, 10);

    // Format for frontend
    const formattedItems = topItems.map(item => ({
      source: item.source,
      headline: item.title,
      time: getTimeAgo(item.pubDate),
      url: item.link,
    }));

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    res.status(200).json({
      success: true,
      count: formattedItems.length,
      items: formattedItems,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in news API:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news',
      message: error.message,
    });
  }
}
