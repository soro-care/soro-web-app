// middleware/crawlerMiddleware.js
import Blog from '../models/blog.model.js';

// Function to detect social media crawlers
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
  
  if (!userAgent) return false;
  
  return crawlers.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  );
};

// Function to generate description from content
export const generateDescription = (content) => {
  if (!content) return 'Read this article on Soro';
  
  // Remove HTML tags and get first 160 characters
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
};

// Middleware to handle social media crawlers for blog posts
export const crawlerMiddleware = async (req, res, next) => {
  const userAgent = req.get('User-Agent');
  
  if (isCrawler(userAgent) && req.params.postSlug) {
    try {
      const { postSlug } = req.params;
      
      // Find the blog post in the database
      const post = await Blog.findOne({ slug: postSlug })
        .select('title content excerpt featuredImage slug writtenBy createdAt tags')
        .lean();
      
      if (post) {
        // Generate meta description
        const description = post.excerpt || generateDescription(post.content);
        
        // For development, use a simple HTML template
        let htmlTemplate = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${post.title} | Soro</title>
            <meta name="description" content="${description}" />
            
            <!-- Open Graph Meta Tags -->
            <meta property="og:type" content="article" />
            <meta property="og:title" content="${post.title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${post.featuredImage}" />
            <meta property="og:url" content="https://soro.care/drops/${postSlug}" />
            <meta property="og:site_name" content="Soro" />
            
            <!-- Twitter Card Meta Tags -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="${post.title}" />
            <meta name="twitter:description" content="${description}" />
            <meta name="twitter:image" content="${post.featuredImage}" />
            
            <!-- Additional article tags -->
            <meta property="article:published_time" content="${post.createdAt}" />
            <meta property="article:author" content="${post.writtenBy}" />
            ${post.tags && post.tags.length > 0 ? 
              post.tags.map(tag => `<meta property="article:tag" content="${tag}" />`).join('') : ''}
          </head>
          <body>
            <div id="root"></div>
            <script>
              window.location.href = "/drops/${postSlug}";
            </script>
          </body>
          </html>
        `;
        
        return res.send(htmlTemplate);
      }
    } catch (error) {
      console.error('Error handling crawler request:', error);
    }
  }
  
  next();
};