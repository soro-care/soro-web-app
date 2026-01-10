// utils/fileUtils.js
import fs from 'fs';
import path from 'path';

export const readIndexHtml = () => {
  try {
    const indexHtmlPath = path.join(process.cwd(), 'client', 'dist', 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      return fs.readFileSync(indexHtmlPath, 'utf8');
    }
  } catch (error) {
    console.error('Error reading index.html:', error);
  }
  return null;
};

export const updateMetaTags = (html, post, postSlug) => {
  const description = post.excerpt || generateDescription(post.content);
  
  return html
    .replace(/<title>.*?<\/title>/, `<title>${post.title} | Soro</title>`)
    .replace(/<meta name="description" content=".*?"\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content=".*?"\/>/, `<meta property="og:title" content="${post.title}" />`)
    .replace(/<meta property="og:description" content=".*?"\/>/, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:image" content=".*?"\/>/, `<meta property="og:image" content="${post.featuredImage}" />`)
    .replace(/<meta property="og:url" content=".*?"\/>/, `<meta property="og:url" content="https://soro.care/drops/${postSlug}" />`)
    .replace(/<meta property="og:type" content=".*?"\/>/, `<meta property="og:type" content="article" />`)
    .replace(/<meta name="twitter:title" content=".*?"\/>/, `<meta name="twitter:title" content="${post.title}" />`)
    .replace(/<meta name="twitter:description" content=".*?"\/>/, `<meta name="twitter:description" content="${description}" />`)
    .replace(/<meta name="twitter:image" content=".*?"\/>/, `<meta name="twitter:image" content="${post.featuredImage}" />`);
};