// ============================================
// 📁 FILE: src/app/(client)/psn/modules/[id]/page.tsx
// PSN Module Detail with Video & Assessment
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { psnAPI, type PSNModule, type PSNProgress } from '@/lib/api/psn';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PSNModulePage({ params }: { params: { id: string } }) {
  const [module, setModule] = useState<PSNModule | null>(null);
  const [progress, setProgress] = useState<PSNProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [videoWatched, setVideoWatched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Assessment state
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});

  const router = useRouter();

  useEffect(() => {
    loadModule();
  }, [params.id]);

  const loadModule = async () => {
    try {
      setIsLoading(true);
      const [moduleData, progressData] = await Promise.all([
        psnAPI.getModule(params.id),
        psnAPI.getMyProgress(),
      ]);
      
      setModule(moduleData);
      const moduleProgress = progressData.find((p: { moduleId: string; }) => p.moduleId === params.id);
      setProgress(moduleProgress || null);
      setVideoWatched(moduleProgress?.videoWatched || false);
    } catch (error) {
      toast.error('Failed to load module');
      router.push('/psn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoComplete = async () => {
    if (videoWatched) return;

    try {
      await psnAPI.markVideoWatched(params.id);
      setVideoWatched(true);
      toast.success('Video marked as watched!');
      loadModule(); // Refresh progress
    } catch (error) {
      toast.error('Failed to mark video as watched');
    }
  };

  const handleSubmitAssessment = async (type: 'pre' | 'post') => {
    setIsSubmitting(true);
    try {
      await psnAPI.submitAssessment(params.id, {
        type,
        answers: assessmentAnswers,
      });

      toast.success(`${type === 'pre' ? 'Pre' : 'Post'}-assessment submitted successfully!`);
      setAssessmentAnswers({});
      loadModule(); // Refresh progress
    } catch (error) {
      toast.error('Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock assessment questions
  const assessmentQuestions = [
    {
      id: 'q1',
      question: 'What is the primary goal of peer support?',
      options: [
        'To provide therapy',
        'To share lived experience and provide mutual support',
        'To diagnose mental health conditions',
        'To replace professional counseling',
      ],
    },
    {
      id: 'q2',
      question: 'Which of the following is an example of active listening?',
      options: [
        'Interrupting to give advice',
        'Thinking about your own response while they talk',
        'Reflecting back what you heard',
        'Changing the subject',
      ],
    },
    {
      id: 'q3',
      question: 'What should you do if someone shares thoughts of self-harm?',
      options: [
        'Ignore it and change topics',
        'Take it seriously and encourage professional help',
        'Tell them they\'re being dramatic',
        'Try to solve their problem yourself',
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!module) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Link */}
      <Link
        href="/psn"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Modules
      </Link>

      {/* Module Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
            Week {module.weekNumber}
          </span>
          {progress?.completed && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">{module.description}</p>
      </div>

      {/* Progress Checklist */}
      <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold mb-4">Module Checklist</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              progress?.preAssessment ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}>
              {progress?.preAssessment && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span className={progress?.preAssessment ? 'line-through' : ''}>
              Complete pre-assessment
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              videoWatched ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}>
              {videoWatched && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span className={videoWatched ? 'line-through' : ''}>
              Watch training video
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              progress?.postAssessment ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'
            }`}>
              {progress?.postAssessment && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <span className={progress?.postAssessment ? 'line-through' : ''}>
              Complete post-assessment
            </span>
          </div>
        </div>
      </Card>

      {/* Module Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">
            <BookOpen className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="video">
            <PlayCircle className="w-4 h-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="pre-assessment" disabled={!!progress?.preAssessment}>
            <FileText className="w-4 h-4 mr-2" />
            Pre-Quiz
          </TabsTrigger>
          <TabsTrigger value="post-assessment" disabled={!videoWatched || !!progress?.postAssessment}>
            <FileText className="w-4 h-4 mr-2" />
            Post-Quiz
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content">
          <Card className="p-8">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: module.content }}
            />
          </Card>
        </TabsContent>

        {/* Video Tab */}
        <TabsContent value="video">
          <Card className="p-8">
            {module.videoUrl ? (
              <div className="space-y-6">
                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                  {/* Video player would go here */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <PlayCircle className="w-20 h-20 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Video Player</p>
                      <p className="text-sm opacity-70">{module.videoUrl}</p>
                    </div>
                  </div>
                </div>

                {!videoWatched && (
                  <Button
                    onClick={handleVideoComplete}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 py-6"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Mark Video as Watched
                  </Button>
                )}

                {videoWatched && (
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-800 dark:text-green-200">
                      Video completed! You can now take the post-assessment.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  No video available for this module
                </p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Pre-Assessment Tab */}
        <TabsContent value="pre-assessment">
          <Card className="p-8">
            <h3 className="text-xl font-bold mb-6">Pre-Assessment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Answer these questions to test your current knowledge before the training.
            </p>

            <div className="space-y-8">
              {assessmentQuestions.map((q, index) => (
                <div key={q.id} className="space-y-3">
                  <Label className="text-base font-medium">
                    {index + 1}. {q.question}
                  </Label>
                  <RadioGroup
                    value={assessmentAnswers[q.id]}
                    onValueChange={(value) =>
                      setAssessmentAnswers({ ...assessmentAnswers, [q.id]: value })
                    }
                  >
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3">
                        <RadioGroupItem value={option} id={`${q.id}-${optIndex}`} />
                        <Label htmlFor={`${q.id}-${optIndex}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleSubmitAssessment('pre')}
              disabled={Object.keys(assessmentAnswers).length !== assessmentQuestions.length || isSubmitting}
              className="w-full mt-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 py-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Pre-Assessment'
              )}
            </Button>
          </Card>
        </TabsContent>

        {/* Post-Assessment Tab */}
        <TabsContent value="post-assessment">
          <Card className="p-8">
            <h3 className="text-xl font-bold mb-6">Post-Assessment</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Answer these questions to test what you&apos;ve learned from the training.
            </p>

            <div className="space-y-8">
              {assessmentQuestions.map((q, index) => (
                <div key={q.id} className="space-y-3">
                  <Label className="text-base font-medium">
                    {index + 1}. {q.question}
                  </Label>
                  <RadioGroup
                    value={assessmentAnswers[q.id]}
                    onValueChange={(value) =>
                      setAssessmentAnswers({ ...assessmentAnswers, [q.id]: value })
                    }
                  >
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3">
                        <RadioGroupItem value={option} id={`${q.id}-post-${optIndex}`} />
                        <Label htmlFor={`${q.id}-post-${optIndex}`} className="font-normal cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleSubmitAssessment('post')}
              disabled={Object.keys(assessmentAnswers).length !== assessmentQuestions.length || isSubmitting}
              className="w-full mt-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 py-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Post-Assessment'
              )}
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}