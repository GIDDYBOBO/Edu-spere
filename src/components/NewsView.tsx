import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NewsArticle } from '../types';
import { Clock, ArrowRight, Share2, X, BookOpen, Calendar, Building } from 'lucide-react';

export const NewsView: React.FC = () => {
  const { news } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const categories = ['all', 'Admissions', 'Academic Calendar', 'Research', 'Policy'];

  const filteredNews = news.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>Journalism & Official Bulletins</span>
            <span>·</span>
            <span>Higher Education in Nigeria</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Education News & Regulatory Intelligence
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            In-depth reporting on NUC accreditation guidelines, university senate resolutions, academic union updates, and research breakthroughs across Nigerian campuses.
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Bulletins' : cat}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {article.imageUrl && (
                  <div className="h-44 bg-slate-800 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                
                <div className="p-5 space-y-3">
                  {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
                  <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-500">
                    <span className="font-semibold text-teal-800">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{article.publishedAt.split('T')[0]}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug hover:text-teal-700 transition-colors">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-semibold mt-2">
                <span>Read Full Circular</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Article Detail Reading Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-teal-800 font-medium">
                  <span>{activeArticle.category}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{activeArticle.publishedAt.split('T')[0]}</span>
                  <span>·</span>
                  <span>{activeArticle.readTime}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeArticle.imageUrl && (
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-60 object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            )}

            <div className="prose prose-sm text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p className="font-medium text-slate-900 bg-slate-50 p-3 rounded-lg border-l-2 border-teal-600">
                {activeArticle.summary}
              </p>
              <p>{activeArticle.content}</p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
