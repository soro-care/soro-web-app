
// ============================================
// 📁 FILE: src/app/(client)/psn/page.tsx
// PSN Portal Dashboard
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  PlayCircle,
  TrendingUp,
  Download,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { psnAPI, type PSNApplication, type PSNModule, type PSNProgress } from '@/lib/api/psn';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function PSNPortalPage() {
  const [application, setApplication] = useState<PSNApplication | null>(null);
  const [modules, setModules] = useState<PSNModule[]>([]);
  const [progress, setProgress] = useState<PSNProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    loadPSNData();
  }, []);

  const loadPSNData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user has applied
      try {
        const app = await psnAPI.getMyApplication();
        setApplication(app);

        if (app.status === 'Approved') {
          // Load modules and progress
          const [modulesData, progressData] = await Promise.all([
            psnAPI.getModules(),
            psnAPI.getMyProgress(),
          ]);
          
          setModules(modulesData);
          setProgress(progressData);
          
          // Calculate overall progress
          const completedCount = progressData.filter((p: { completed: any; }) => p.completed).length;
          const totalModules = modulesData.length;
          setOverallProgress((completedCount / totalModules) * 100);
        }
      } catch (error: any) {
        // No application found
        if (error.response?.status === 404) {
          setApplication(null);
        }
      }
    } catch (error) {
      toast.error('Failed to load PSN data');
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string): PSNProgress | undefined => {
    return progress.find(p => p.moduleId === moduleId);
  };

  const isModuleUnlocked = (module: PSNModule): boolean => {
    return new Date(module.unlockDate) <= new Date();
  };

  const handleDownloadCertificate = async () => {
    try {
      const { certificateUrl } = await psnAPI.generateCertificate();
      window.open(certificateUrl, '_blank');
      toast.success('Certificate generated!');
    } catch (error) {
      toast.error('Failed to generate certificate');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading PSN Portal...</p>
        </div>
      </div>
    );
  }

  // No application yet
  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Peer Support Network
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Become a certified peer supporter and help others while growing yourself
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">8-Week Training</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Comprehensive modules covering mental health basics
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Certification</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Receive official peer support certification
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Make Impact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Support others in their mental health journey
            </p>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">What You&apos;ll Learn</h2>
          <div className="space-y-4 mb-8">
            {[
              'Mental health fundamentals',
              'Active listening skills',
              'Empathy and emotional support',
              'Crisis recognition and response',
              'Boundaries and self-care',
              'Cultural competency',
              'Communication techniques',
              'Ethical considerations',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/psn/apply" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 py-6 text-lg">
                Apply Now
              </Button>
            </Link>
            <Button variant="outline" className="flex-1 py-6 text-lg">
              Learn More
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Application pending/rejected
  if (application.status !== 'Approved') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${
            application.status === 'Pending'
              ? 'bg-yellow-100 dark:bg-yellow-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {application.status === 'Pending' ? (
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Application {application.status}
          </h2>

          {application.status === 'Pending' && (
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your application is being reviewed. We&apos;ll notify you via email once it&apos;s processed.
              This typically takes 2-3 business days.
            </p>
          )}

          {application.status === 'Rejected' && (
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Unfortunately, your application was not approved at this time.
              </p>
              <Button onClick={() => router.push('/psn/apply')}>
                Submit New Application
              </Button>
            </div>
          )}

          <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Your Application Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Submitted:</span>
                <span className="ml-2 font-medium">
                  {new Date(application.applicationDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 font-medium ${
                  application.status === 'Pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {application.status}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Approved - Show modules
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PSN Training Portal</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Complete all modules to earn your certification
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold mb-2">{Math.round(overallProgress)}%</div>
          <Progress value={overallProgress} className="h-2" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold">
            {progress.filter(p => p.completed).length}/{modules.length}
          </div>
          <p className="text-xs text-gray-500">Modules</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Videos Watched</span>
            <PlayCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold">
            {progress.filter(p => p.videoWatched).length}/{modules.length}
          </div>
          <p className="text-xs text-gray-500">Videos</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Certificate</span>
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          {overallProgress === 100 ? (
            <Button
              size="sm"
              onClick={handleDownloadCertificate}
              className="w-full mt-2 bg-gradient-to-r from-yellow-500 to-orange-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          ) : (
            <p className="text-sm text-gray-500 mt-2">
              Complete all modules
            </p>
          )}
        </Card>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">Training Modules</h2>

        {modules.map((module, index) => {
          const moduleProgress = getModuleProgress(module.id);
          const unlocked = isModuleUnlocked(module);
          const completed = moduleProgress?.completed || false;

          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-6 transition-all ${
                  unlocked ? 'hover:shadow-xl cursor-pointer' : 'opacity-60'
                }`}
                onClick={() => unlocked && router.push(`/psn/modules/${module.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Module Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    completed
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : unlocked
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {completed ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                    ) : unlocked ? (
                      <BookOpen className="w-8 h-8 text-white" />
                    ) : (
                      <Lock className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  {/* Module Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg">{module.title}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            Week {module.weekNumber}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {module.description}
                        </p>
                      </div>

                      {completed && (
                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Progress Indicators */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {moduleProgress?.videoWatched && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <PlayCircle className="w-4 h-4" />
                          <span>Video watched</span>
                        </div>
                      )}

                      {moduleProgress?.preAssessment && (
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Pre-assessment done</span>
                        </div>
                      )}

                      {moduleProgress?.postAssessment && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Post-assessment done</span>
                        </div>
                      )}

                      {!unlocked && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Lock className="w-4 h-4" />
                          <span>Unlocks {new Date(module.unlockDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {unlocked && !completed && (
                    <Button
                      variant={moduleProgress ? 'default' : 'outline'}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/psn/modules/${module.id}`);
                      }}
                    >
                      {moduleProgress ? 'Continue' : 'Start'}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}