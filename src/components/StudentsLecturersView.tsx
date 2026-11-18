import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, BookOpen, Users, CheckCircle2, Search, ExternalLink } from 'lucide-react';

export const StudentsLecturersView: React.FC = () => {
  const { achievements, openInstitutionProfile } = useApp();
  const [filterRole, setFilterRole] = useState<'all' | 'Student' | 'Lecturer' | 'Researcher'>('all');

  const filteredAchievements = achievements.filter((ach) => {
    if (filterRole !== 'all' && ach.recipientRole !== filterRole) {
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
            <span>Scholarly Honors & Citations</span>
            <span>·</span>
            <span>Nigerian Minds Shaping The Globe</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Students, Lecturers & Research Achievers
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Spotlighting exceptional undergraduate innovators, pioneering doctoral researchers, and globally distinguished faculty across Nigerian universities and technical institutes.
          </p>
        </div>

        {/* Feature Banner with Researcher Imagery */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 p-6 sm:p-8 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
              National Research Excellence Spotlight
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Empowering Indigenous Research in Renewable Grids & Molecular Biology
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              From solar micro-inverter designs in Samaru, Zaria to genomics sequencing in Ibadan, Nigerian scholars are spearheading solutions directly addressing continental industrialization.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-700">
              <span className="font-semibold text-slate-900">4,200+</span> Peer-Reviewed Citations Indexed
              <span>·</span>
              <span className="font-semibold text-slate-900">100%</span> Verified Records
            </div>
          </div>
          <div className="md:w-1/2 h-64 md:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src="/src/assets/images/nigerian_student_researcher_1794428719416.jpg"
              alt="Outstanding Nigerian Researcher"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2 text-xs">
          {[
            { id: 'all', label: 'All Achievers' },
            { id: 'Student', label: 'Outstanding Students' },
            { id: 'Lecturer', label: 'Distinguished Lecturers' },
            { id: 'Researcher', label: 'Research Fellows' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                filterRole === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-semibold text-teal-800">{ach.institutionName}</span>
                  <span className="font-mono tabular-nums">{ach.year}</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{ach.recipientName}</h3>
                    <span className="text-xs text-slate-500">{ach.recipientRole} · {ach.field}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <strong className="text-xs font-semibold text-slate-900 block">{ach.title}</strong>
                  <p className="text-xs text-slate-600 leading-relaxed">{ach.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Award: {ach.awardBody}</span>
                <button
                  onClick={() => openInstitutionProfile(ach.institutionId)}
                  className="text-teal-700 hover:underline font-semibold"
                >
                  Institution Profile →
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
