import React, { useState } from 'react';
import { INITIAL_RESOURCES } from '../data/initialData';
import { FileText, Download, CheckCircle2, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ResourcesView: React.FC = () => {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');

  const resources = INITIAL_RESOURCES.filter((r) => {
    if (search.trim()) {
      return r.title.toLowerCase().includes(search.toLowerCase()) || r.targetSubject.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  const handleDownload = (title: string) => {
    showToast(`Downloading official verified resource: ${title}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>Academic Syllabi & Benchmarks</span>
            <span>·</span>
            <span>NUC CCMAS & JAMB Integrated Broadsheets</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Academic Resources & Curriculum Repository
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Free access to verified JAMB brochures, WAEC/NECO marking guides, and NUC Core Curriculum and Minimum Academic Standards (CCMAS) across all disciplines.
          </p>
        </div>

        {/* Resources Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search syllabus, curriculum, or past questions..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            Showing {resources.length} verified publications
          </span>
        </div>

        {/* Resources Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-teal-800">{res.category}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{res.fileFormat}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {res.title}
                </h3>

                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Level:</strong> {res.educationLevel}</div>
                  <div><strong>Focus:</strong> {res.targetSubject}</div>
                  <div><strong>Issued By:</strong> {res.verifiedBy}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono tabular-nums">{res.downloadCount.toLocaleString()} downloads</span>
                <button
                  onClick={() => handleDownload(res.title)}
                  className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
