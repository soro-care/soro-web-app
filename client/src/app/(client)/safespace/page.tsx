// ============================================
// 📁 FILE: src/app/(client)/safespace/page.tsx
// SafeSpace AI Chat Interface
// ============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/new-input';
import { Card } from '@/components/ui/card';
import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  MessageCircle,
  AlertTriangle,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { safespaceAPI, type ChatSession, type Message } from '@/lib/api/safespace';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SafeSpacePage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const data = await safespaceAPI.getSessions();
      setSessions(data);

      // If no session exists, create one
      if (data.length === 0) {
        await createNewSession();
      } else {
        setCurrentSession(data[0]);
        setMessages(data[0].messages);
      }
    } catch (error) {
      console.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await safespaceAPI.createSession();
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
      setSidebarOpen(false);
      toast.success('New chat started');
    } catch (error) {
      toast.error('Failed to create new chat');
    }
  };

  const selectSession = async (session: ChatSession) => {
    try {
      const fullSession = await safespaceAPI.getSession(session.id);
      setCurrentSession(fullSession);
      setMessages(fullSession.messages);
      setSidebarOpen(false);
    } catch (error) {
      toast.error('Failed to load chat');
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await safespaceAPI.deleteSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      
      if (currentSession?.id === sessionId) {
        if (sessions.length > 1) {
          const nextSession = sessions.find(s => s.id !== sessionId);
          if (nextSession) selectSession(nextSession);
        } else {
          createNewSession();
        }
      }
      
      toast.success('Chat deleted');
      setShowDeleteDialog(false);
      setSessionToDelete(null);
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !currentSession || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await safespaceAPI.sendMessage(currentSession.id, inputMessage);
      setMessages(prev => [...prev, response]);

      // Check for crisis flag
      if (response.crisisFlag) {
        setShowCrisisAlert(true);
      }
    } catch (error) {
      toast.error('Failed to send message');
      // Remove user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const crisisResources = [
    {
      name: 'National Suicide Prevention Hotline',
      number: '988',
      available: '24/7',
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      available: '24/7',
    },
    {
      name: 'SORO Emergency Support',
      number: '+234 (0) 800-SORO-911',
      available: '24/7',
    },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Button
            onClick={createNewSession}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-12rem)]">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                currentSession?.id === session.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
              onClick={() => selectSession(session)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <h3 className="font-medium truncate text-sm">
                      {session.title || 'New Chat'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSessionToDelete(session.id);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Chat History</SheetTitle>
          </SheetHeader>
          
          <div className="p-4 border-b">
            <Button
              onClick={createNewSession}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Chat
            </Button>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-12rem)]">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  currentSession?.id === session.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
                onClick={() => selectSession(session)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-sm">
                      {session.title || 'New Chat'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionToDelete(session.id);
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold">SafeSpace AI</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your confidential mental health companion
                </p>
              </div>
            </div>

            {currentSession?.crisisDetected && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => setShowCrisisAlert(true)}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Crisis Resources
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Welcome to SafeSpace</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  I&apos;m here to listen and support you. Everything you share is confidential.
                  How are you feeling today?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "I'm feeling anxious",
                    "I need to talk",
                    "I'm feeling overwhelmed",
                    "I'm doing okay",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => setInputMessage(suggestion)}
                      className="text-left justify-start"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <Bot className="w-6 h-6 text-white" />
                  )}
                </div>

                {/* Message */}
                <div
                  className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  <Card
                    className={`inline-block p-4 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white border-0'
                        : 'glass'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </Card>
                  
                  {message.crisisFlag && (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Crisis support available 24/7</span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isSending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <Card className="glass p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
                </div>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg safe-bottom">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending || !currentSession}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending || !currentSession}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            SafeSpace AI is here to listen. In crisis? Call 988 or text HOME to 741741
          </p>
        </div>
      </div>

      {/* Crisis Alert Dialog */}
      <AlertDialog open={showCrisisAlert} onOpenChange={setShowCrisisAlert}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Crisis Support Available
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              If you&apos;re in crisis or experiencing thoughts of self-harm, please reach out for
              immediate support. These resources are available 24/7:
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {crisisResources.map((resource, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold mb-1">{resource.name}</h4>
                    <div className="flex items-center gap-2 text-2xl font-bold text-purple-600 mb-1">
                      <Phone className="w-5 h-5" />
                      {resource.number}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Available {resource.available}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <a href={`tel:${resource.number.replace(/\D/g, '')}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                </div>
              </Card>
            ))}

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Remember:</strong> You&apos;re not alone. These trained professionals are ready
                to help you right now.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Session Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all its messages. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSessionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToDelete && deleteSession(sessionToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}