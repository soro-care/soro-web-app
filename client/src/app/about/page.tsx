import { generateSEO } from '@/lib/seo';
import { Heart, Users, Shield, Award, Target, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = generateSEO({
  title: 'About Us',
  description: 'Learn about SORO\'s mission to make mental health support accessible, affordable, and stigma-free. Discover our story, values, and the team behind the platform.',
  keywords: ['mental health platform', 'about SORO', 'mental wellness mission', 'healthcare technology', 'mental health access'],
  url: '/about',
});

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Compassion First',
      description: 'Every interaction is rooted in empathy and understanding.',
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      description: 'HIPAA-compliant, end-to-end encrypted, and completely confidential.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Building a safe space where everyone feels heard and supported.',
    },
    {
      icon: Award,
      title: 'Professional Excellence',
      description: 'Certified mental health professionals committed to your wellbeing.',
    },
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Clinical Officer',
      image: '/team/sarah.jpg',
      bio: '15+ years in mental health, passionate about accessible care.',
    },
    {
      name: 'Michael Chen',
      role: 'Head of Technology',
      image: '/team/michael.jpg',
      bio: 'Building secure, user-friendly mental health solutions.',
    },
    {
      name: 'Dr. Amara Okafor',
      role: 'Lead Psychologist',
      image: '/team/amara.jpg',
      bio: 'Specializing in trauma-informed care and peer support.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 mb-6">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Our Story
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mental Health Care
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              For Everyone
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            SORO was born from a simple belief: mental health support should be accessible, 
            affordable, and free from stigma. We&apos;re building a platform where everyone can 
            find the help they need, when they need it.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                To democratize mental health care by providing a safe, stigma-free platform 
                that connects individuals with certified professionals, peer support, and 
                resources they need to thrive.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Accessible:</strong> Connect with professionals from anywhere
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Affordable:</strong> Flexible pricing and insurance options
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Anonymous:</strong> Share your story without judgment
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 p-1">
                <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-900 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      10K+
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Lives Touched
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Our Core Values
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands finding support and healing through SORO
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-8 py-6 text-lg rounded-2xl">
                Get Started
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-2xl border-2">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}