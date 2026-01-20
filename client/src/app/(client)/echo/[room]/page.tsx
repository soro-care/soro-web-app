// ============================================
// 📁 FILE: src/app/(client)/echo/[room]/page.tsx
// Echo Room Story Feed
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { echoAPI, type Echo, type EchoRoom } from '@/lib/api/echo';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function EchoRoomPage({ params }: { params: { room: EchoRoom } }) {
  const [stories, setStories] = useState<Echo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Comment dialog
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Echo | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Report dialog
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const router = useRouter();

  const roomNames: Record<EchoRoom, string> = {
    pressure: 'Pressure',
    burnout: 'Burnout',
    not_enough: 'Not Enough',
    silence: 'Silence',
    rage: 'Rage',
    exhaustion: 'Exhaustion',
    gratitude: 'Gratitude',
    victory: 'Victory',
    hope: 'Hope',
    resilience: 'Resilience',
  };

  useEffect(() => {
    loadStories();
  }, [params.room]);

  const loadStories = async () => {
    try {
      setIsLoading(true);
      const data = await echoAPI.getStoriesByRoom(params.room, 1, 20);
      setStories(data);
      setHasMore(data.length === 20);
      setPage(1);
    } catch (error) {
      toast.error('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const data = await echoAPI.getStoriesByRoom(params.room, nextPage, 20);
      setStories([...stories, ...data]);
      setPage(nextPage);
      setHasMore(data.length === 20);
    } catch (error) {
      toast.error('Failed to load more stories');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLike = async (storyId: string) => {
    try {
      await echoAPI.likeStory(storyId);
      
      // Optimistic update
      setStories(stories.map(s => {
        if (s.id === storyId) {
          const currentUserId = 'current-user'; // This should come from auth
          const isLiked = s.likes.includes(currentUserId);
          return {
            ...s,
            likes: isLiked
              ? s.likes.filter(id => id !== currentUserId)
              : [...s.likes, currentUserId],
          };
        }
        return s;
      }));
    } catch (error) {
      toast.error('Failed to like story');
    }
  };

  const handleComment = async () => {
    if (!selectedStory || !commentText.trim() || !commentAuthor.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await echoAPI.addComment(selectedStory.id, commentText, commentAuthor);
      toast.success('Comment added!');
      setCommentDialogOpen(false);
      setCommentText('');
      setCommentAuthor('');
      loadStories(); // Reload to get updated comments
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = async (story: Echo) => {
    try {
      await echoAPI.trackShare(story.id);
      
      if (navigator.share) {
        await navigator.share({
          title: `Echo: ${roomNames[params.room]}`,
          text: story.content.slice(0, 100) + '...',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      // User cancelled share or copy failed
    }
  };

  const handleReport = async () => {
    if (!selectedStory || !reportReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    setIsReporting(true);
    try {
      await echoAPI.reportStory(selectedStory.id, reportReason);
      toast.success('Report submitted. Thank you for keeping Echo safe.');
      setReportDialogOpen(false);
      setReportReason('');
      setSelectedStory(null);
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsReporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/echo"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rooms
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{roomNames[params.room]}</h1>
            <p className="text-gray-600 dark:text-gray-300">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'} shared
            </p>
          </div>

          <Link href="/echo/share">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              Share Your Story
            </Button>
          </Link>
        </div>
      </div>

      {/* Stories Feed */}
      {stories.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Be the first to share in this room
          </p>
          <Link href="/echo/share">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
              Share Your Story
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  {/* Story Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium">
                        {story.authorName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{story.authorName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(story.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStory(story);
                        setReportDialogOpen(true);
                      }}
                    >
                      <Flag className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>

                  {/* Story Content */}
                  <div className="mb-4">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {story.content}
                    </p>
                  </div>

                  {/* Crisis Flag */}
                  {story.crisisFlag && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          If you're in crisis, please call 988 or{' '}
                          <Link href="/safespace" className="underline font-medium">
                            chat with SafeSpace AI
                          </Link>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Emotion Tags */}
                  {story.emotionTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {story.emotionTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(story.id)}
                      className="gap-2"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          story.likes.includes('current-user')
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />
                      <span>{story.likes.length}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStory(story);
                        setCommentDialogOpen(true);
                      }}
                      className="gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{story.comments.length}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(story)}
                      className="gap-2"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{story.shareCount}</span>
                    </Button>
                  </div>

                  {/* Comments Preview */}
                  {story.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      {story.comments.slice(0, 2).map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                            {comment.authorName[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{comment.authorName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      {story.comments.length > 2 && (
                        <button className="text-sm text-purple-600 hover:underline">
                          View all {story.comments.length} comments
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                className="px-8"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Stories'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Comment</DialogTitle>
            <DialogDescription>
              Share your thoughts anonymously. Be kind and supportive.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="commentAuthor">Anonymous Name</Label>
              <Input
                id="commentAuthor"
                placeholder="e.g., Hope Seeker"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commentText">Comment</Label>
              <Textarea
                id="commentText"
                rows={4}
                placeholder="Write something supportive..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleComment}
              disabled={isSubmittingComment || !commentText.trim() || !commentAuthor.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isSubmittingComment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Comment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Story</DialogTitle>
            <DialogDescription>
              Help us keep Echo safe. Please tell us why you're reporting this story.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              rows={4}
              placeholder="Reason for reporting..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReportDialogOpen(false);
                setReportReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              disabled={isReporting || !reportReason.trim()}
              variant="destructive"
            >
              {isReporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}