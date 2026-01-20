// ============================================
// 📁 FILE: src/app/blog/page.tsx
// Blog listing page with SEO
// ============================================

import { generateSEO } from '@/lib/seo';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';

export const metadata = generateSEO({
  title: 'Blog - Mental Health Articles & Resources',
  description: 'Read the latest articles, tips, and insights on mental health, wellness, and personal growth from SORO\'s team of experts.',
  keywords: ['mental health blog', 'wellness articles', 'mental health tips', 'self-care resources', 'mental wellness'],
  url: '/blog',
});

export default function BlogPage() {
  // This would come from API
  const posts = [
    {
      id: '1',
      title: '10 Signs You Might Need Professional Mental Health Support',
      slug: '10-signs-you-need-mental-health-support',
      excerpt: 'Understanding when to seek help is crucial. Learn the key indicators that it might be time to talk to a professional.',
      image: '/blog/mental-health-support.jpg',
      category: 'Mental Health',
      author: 'Dr. Sarah Johnson',
      publishedAt: '2025-01-15',
      readTime: 8,
    },
    {
      id: '2',
      title: 'The Power of Peer Support in Mental Health Recovery',
      slug: 'power-of-peer-support',
      excerpt: 'Discover how connecting with others who understand your journey can accelerate healing and growth.',
      image: '/blog/peer-support.jpg',
      category: 'Community',
      author: 'Michael Chen',
      publishedAt: '2025-01-12',
      readTime: 6,
    },
    {
      id: '3',
      title: 'Managing Anxiety: Practical Techniques for Daily Life',
      slug: 'managing-anxiety-techniques',
      excerpt: 'Evidence-based strategies to help you navigate anxiety and regain control of your mental wellbeing.',
      image: '/blog/anxiety-management.jpg',
      category: 'Wellness',
      author: 'Dr. Amara Okafor',
      publishedAt: '2025-01-10',
      readTime: 10,
    },
  ];

  const categories = [
    'All',
    'Mental Health',
    'Wellness',
    'Community',
    'Self-Care',
    'Relationships',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              SORO Blog
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Expert insights, personal stories, and practical tips for your mental health journey
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search articles..."
              className="pl-10 h-12 rounded-xl"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'All' ? 'default' : 'outline'}
                className="whitespace-nowrap rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${posts[0].slug}`}>
          <div className="mb-12 rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow group">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative h-64 md:h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 text-sm font-medium text-purple-600">
                  Featured
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                  {posts[0].category}
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {posts[0].excerpt}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(posts[0].publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {posts[0].readTime} min read
                  </div>
                </div>
                
                <div className="mt-6 inline-flex items-center text-purple-600 dark:text-purple-400 font-medium group-hover:gap-2 transition-all">
                  Read More
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:ml-2 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="h-full rounded-3xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all group">
                <div className="relative h-48 bg-gradient-to-br from-pink-500 to-purple-600" />
                
                <div className="p-6">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                    {post.category}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-xl">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
}
