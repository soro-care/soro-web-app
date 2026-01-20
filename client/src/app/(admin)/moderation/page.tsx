// 📁 FILE: src/app/(admin)/moderation/page.tsx
// ============================================

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  Flag, CheckCircle, XCircle, AlertTriangle, Search,
  MessageSquare, Heart, Eye, User, Clock
} from 'lucide-react';
import type { 
  ModerationItem, 
  ModerationItemType, 
  ModerationPriority,
  TypeFilter,
  PriorityFilter 
} from '../types';

// Mock data generator
const generateMockModerationItems = (): ModerationItem[] => {
  const types: ModerationItemType[] = ['echo', 'comment'];
  const reasons = [
    'Inappropriate content',
    'Spam',
    'Harassment',
    'Misinformation',
    'Violence',
    'Hate speech'
  ];
  
  const echoTitles = [
    'My Journey with Anxiety',
    'Finding Peace After Loss',
    'Overcoming Depression',
    'Therapy Changed My Life',
    'Dealing with Panic Attacks',
    'Breaking Free from Addiction',
    'Learning to Love Myself'
  ];
  
  const commentTexts = [
    'This is exactly what I needed to hear today.',
    'Thank you for sharing your story.',
    'I can relate to this so much.',
    'This helped me understand my own feelings.',
    'Your courage inspires me.',
    'I\'m going through something similar.',
    'This resonates deeply with me.'
  ];

  const reporters = ['User123', 'Client456', 'Member789', 'User999'];
  const authors = ['Sarah M.', 'John D.', 'Emily R.', 'Michael T.', 'Lisa K.'];
  
  return Array.from({ length: 30 }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      id: `mod-${i + 1}`,
      type,
      content: type === 'echo' 
        ? {
            title: echoTitles[Math.floor(Math.random() * echoTitles.length)],
            excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 50)
          }
        : commentTexts[Math.floor(Math.random() * commentTexts.length)],
      author: {
        name: authors[Math.floor(Math.random() * authors.length)],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=author${i}`
      },
      reportCount: Math.floor(Math.random() * 10) + 1,
      reports: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        reporter: reporters[Math.floor(Math.random() * reporters.length)],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        details: 'Additional context about the report...',
        reportedAt: new Date(2025, 0, Math.floor(Math.random() * 18) + 1).toISOString()
      })),
      flaggedAt: new Date(2025, 0, Math.floor(Math.random() * 18) + 1).toISOString(),
      status: 'pending',
      priority: (Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low') as ModerationPriority
    };
  });
};

interface ModerationStats {
  total: number;
  high: number;
  medium: number;
  low: number;
  echo: number;
  comment: number;
}

const AdminModerationPage = () => {
  const [items, setItems] = useState<ModerationItem[]>(generateMockModerationItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use useMemo for filtered items - no useEffect needed
  const filteredItems = useMemo(() => {
    let result = items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        if (item.type === 'echo' && typeof item.content !== 'string') {
          return item.content.title.toLowerCase().includes(query) ||
                 item.author.name.toLowerCase().includes(query);
        } else if (typeof item.content === 'string') {
          return item.content.toLowerCase().includes(query) ||
                 item.author.name.toLowerCase().includes(query);
        }
        return false;
      });
    }

    if (typeFilter !== 'all') {
      result = result.filter(item => item.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      result = result.filter(item => item.priority === priorityFilter);
    }

    return result;
  }, [searchQuery, typeFilter, priorityFilter, items]);

  // Reset current page when filters change
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const handleModerate = useCallback((itemId: string, action: 'approve' | 'reject', reason?: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    setShowDetailsModal(false);
    
    // Show success message
    const actionText = action === 'approve' ? 'approved' : 'rejected';
    alert(`Content ${actionText} successfully${reason ? `: ${reason}` : ''}`);
  }, []);

  const getPriorityColor = useCallback((priority: ModerationPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  }, []);

  const getTypeColor = useCallback((type: ModerationItemType) => {
    return type === 'echo' 
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  }, []);

  // Stats - use useMemo
  const stats = useMemo((): ModerationStats => ({
    total: items.length,
    high: items.filter(i => i.priority === 'high').length,
    medium: items.filter(i => i.priority === 'medium').length,
    low: items.filter(i => i.priority === 'low').length,
    echo: items.filter(i => i.type === 'echo').length,
    comment: items.filter(i => i.type === 'comment').length
  }), [items]);

  // Handle filter changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handleTypeFilterChange = useCallback((value: TypeFilter) => {
    setTypeFilter(value);
    handleFilterChange();
  }, [handleFilterChange]);

  const handlePriorityFilterChange = useCallback((value: PriorityFilter) => {
    setPriorityFilter(value);
    handleFilterChange();
  }, [handleFilterChange]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredItems.length} items pending review
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-600">{stats.high} High Priority</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-red-600">High Priority</p>
            <p className="text-2xl font-bold text-red-600">{stats.high}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-yellow-600">Medium Priority</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-blue-600">Low Priority</p>
            <p className="text-2xl font-bold text-blue-600">{stats.low}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-purple-600">Echo Stories</p>
            <p className="text-2xl font-bold text-purple-600">{stats.echo}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <p className="text-sm text-green-600">Comments</p>
            <p className="text-2xl font-bold text-green-600">{stats.comment}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => handleTypeFilterChange(e.target.value as TypeFilter)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="echo">Echo Stories</option>
              <option value="comment">Comments</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityFilterChange(e.target.value as PriorityFilter)}
              className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Moderation Queue */}
        <div className="space-y-4">
          {paginatedItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                {/* Author Avatar */}
                <img
                  src={item.author.avatar}
                  alt={item.author.name}
                  className="w-12 h-12 rounded-full flex-shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {item.author.name}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {item.type === 'echo' ? 'Echo Story' : 'Comment'}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority} priority
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {new Date(item.flaggedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4">
                    {item.type === 'echo' && typeof item.content !== 'string' ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {item.content.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                          {item.content.excerpt}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {item.content.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {item.content.comments}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {typeof item.content === 'string' ? item.content : ''}
                      </p>
                    )}
                  </div>

                  {/* Reports */}
                  <div className="flex items-center gap-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
                    <Flag className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-300">
                        {item.reportCount} {item.reportCount === 1 ? 'Report' : 'Reports'}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Most common: {item.reports[0]?.reason || 'No reason provided'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Review Details
                    </button>
                    <button
                      onClick={() => handleModerate(item.id, 'approve')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleModerate(item.id, 'reject')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailsModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Review</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">ID: {selectedItem.id}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Author Info */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Author</p>
                  <div className="flex items-center gap-3">
                    <img src={selectedItem.author.avatar} alt={selectedItem.author.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.author.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active member</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Content</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    {selectedItem.type === 'echo' && typeof selectedItem.content !== 'string' ? (
                      <>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {selectedItem.content.title}
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedItem.content.excerpt}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {typeof selectedItem.content === 'string' ? selectedItem.content : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reports */}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Reports ({selectedItem.reports.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedItem.reports.map((report, index) => (
                      <div key={index} className="p-4 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-900 dark:text-red-300">{report.reporter}</span>
                          </div>
                          <span className="text-xs text-red-600">
                            {new Date(report.reportedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                          Reason: {report.reason}
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          {report.details}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Moderation Action</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleModerate(selectedItem.id, 'approve')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Content
                    </button>
                    <button
                      onClick={() => handleModerate(selectedItem.id, 'reject')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      Remove Content
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModerationPage;