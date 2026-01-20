// ============================================
// 📁 FILE: src/app/blog/[slug]/page.tsx
// Individual blog post with dynamic SEO
// ============================================

import { generateSEO } from '@/lib/seo';
import { Calendar, Clock, User, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// This would be fetched from API
async function getPost(slug: string) {
  return {
    title: '10 Signs You Might Need Professional Mental Health Support',
    slug: 'signs-you-need-mental-health-support',
    content: `<p>Mental health is just as important as physical health...</p>`,
    excerpt: 'Understanding when to seek help is crucial...',
    image: '/blog/mental-health-support.jpg',
    category: 'Mental Health',
    author: 'Dr. Sarah Johnson',
    publishedAt: '2025-01-15',
    modifiedAt: '2025-01-15',
    readTime: 8,
    keywords: ['mental health', 'therapy', 'counseling', 'wellness'],
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  return generateSEO({
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    image: post.image,
    url: `/blog/${post.slug}`,
    type: 'article',
    author: post.author,
    publishedTime: post.publishedAt,
    modifiedTime: post.modifiedAt,
  });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  return (
    <article className="min-h-screen bg-white dark:bg-gray-900 pt-24 pb-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-purple-600">Home</Link>
          {' '}/{' '}
          <Link href="/blog" className="hover:text-purple-600">Blog</Link>
          {' '}/{' '}
          <span className="text-gray-900 dark:text-white">{post.title}</span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-4">
            {post.category}
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative h-96 rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-pink-500 to-purple-600" />

        {/* Share Buttons */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Share:
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full">
              <Twitter className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <Facebook className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <Linkedin className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-800">
          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Need Support?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect with a certified mental health professional today.
          </p>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}