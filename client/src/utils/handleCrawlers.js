// src/utils/handleCrawlers.js
export const isCrawler = (userAgent) => {
  const crawlers = [
    'facebookexternalhit',
    'Twitterbot',
    'LinkedInBot',
    'WhatsApp',
    'Slackbot',
    'Discordbot',
    'TelegramBot',
    'Googlebot',
    'Bingbot',
    'Applebot'
  ];
  
  return crawlers.some(crawler => 
    userAgent && userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
};

export const getBlogPostMeta = async (postSlug) => {
  try {
    const response = await fetch(`/api/blog/get/${postSlug}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
    }
  } catch (error) {
    console.error('Error fetching blog post for meta tags:', error);
  }
  return null;
};