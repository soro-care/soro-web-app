
// ============================================
// 📁 FILE: src/lib/seo.ts
// SEO utilities and metadata generation
// ============================================

import type { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SITE_NAME = 'SORO - Mental Health Support Platform';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://soro.care';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export function generateSEO({
  title,
  description,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      publishedTime,
      modifiedTime,
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@sorocare',
    },
    
    alternates: {
      canonical,
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  return metadata;
}
