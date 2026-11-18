import React, { useState } from 'react';
import { CommunityTopic } from '../types';
import { useApp } from '../context/AppContext';
import { MessageSquare, Users, Plus, X, Send, Eye, Clock } from 'lucide-react';

export const CommunityView: React.FC = () => {
  const { currentUser, communityTopics, addCommunityTopic } = useApp();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityTopic['category']>('JAMB Prep');

  const categories = ['all', 'JAMB Prep', 'Admission Advice', 'Campus Life', 'Scholarships', 'Postgraduate Study'];

  const filteredTopics = communityTopics.filter((t) => {
    if (categoryFilter !== 'all' && t.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addCommunityTopic({
      title: newTitle.trim(),
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      category: newCategory,
    });

    setNewTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>Stakeholder Peer Forums</span>
            <span>·</span>
            <span>Direct Guidance from Enrolled Students & Lecturers</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Nigerian Education Community & Dialogue
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Connect with verified undergraduates, prospective candidates, academic mentors, and university registrars answering questions on cut-offs, campus safety, and accommodation.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                  categoryFilter === c
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c === 'all' ? 'All Topics' : c}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Question / Post Topic</span>
          </button>
        </div>

        {/* Discussion Topics Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-semibold text-teal-800">{topic.category}</span>
                    <span>·</span>
                    <span>Started by <strong>{topic.authorName}</strong></span>
                    <span className="capitalize">({topic.authorRole.replace('_', ' ')})</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {topic.title}
                  </h3>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-slate-500 font-mono tabular-nums text-xs">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                    <span>{topic.repliesCount} replies</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{topic.viewsCount} views</span>
                  </div>
                  <div className="text-slate-400 font-sans text-[11px] whitespace-nowrap">
                    {topic.lastActivity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Start Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Start a Community Discussion
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Topic Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="JAMB Prep">JAMB Prep</option>
                  <option value="Admission Advice">Admission Advice</option>
                  <option value="Campus Life">Campus Life & Hostels</option>
                  <option value="Scholarships">Scholarships</option>
                  <option value="Postgraduate Study">Postgraduate Study</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Question or Discussion Topic</label>
                <textarea
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. What is the latest departmental cut-off for Computer Science at UNILAG?"
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 text-white rounded-md font-semibold"
                >
                  Publish Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
