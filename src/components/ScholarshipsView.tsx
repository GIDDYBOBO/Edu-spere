import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Clock, ExternalLink, Award, CheckCircle2, AlertCircle } from 'lucide-react';

export const ScholarshipsView: React.FC = () => {
  const { scholarships } = useApp();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = scholarships.filter((s) => {
    if (filterType !== 'all' && s.providerType !== filterType) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.providerName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>Funding & Educational Bursaries</span>
            <span>·</span>
            <span>Verified Grants for Nigerian Students</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Verified Scholarships & Bursary Opportunities
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Discover active undergraduate, postgraduate, and vocational scholarships funded by the Federal Government of Nigeria, state bursary boards, and multinational corporate foundations.
          </p>
        </div>

        {/* Filter controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-500 font-medium whitespace-nowrap">Filter by Provider:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              <option value="all">All Funding Sources</option>
              <option value="Federal Government">Federal Government (FSB & PTDF)</option>
              <option value="Corporate Foundation">Corporate Foundations (MTN, NLNG)</option>
              <option value="State Government">State Bursary Boards</option>
            </select>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarship name or sponsor..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Scholarships List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((sch) => (
            <div
              key={sch.id}
              className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-800">{sch.providerType}</span>
                  <span className="font-mono tabular-nums text-amber-700 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Application Deadline: {sch.deadline}</span>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {sch.title}
                </h3>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Funding Body:</span>
                    <strong className="text-slate-900">{sch.providerName}</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Award Coverage:</span>
                    <span className="text-teal-700 font-semibold">{sch.coverage}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Eligible Level:</span>
                    <span className="text-slate-800">{sch.educationLevels.join(', ')}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block">Eligibility Criteria:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {sch.eligibilityCriteria.map((c, idx) => (
                      <li key={idx} className="leading-relaxed">{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Opportunity</span>
                </span>

                <a
                  href={sch.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Official Application</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
