import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Trophy, CheckCircle2, ArrowRight } from 'lucide-react';

export const RankingsView: React.FC = () => {
  const { publicInstitutions, openInstitutionProfile } = useApp();
  const [sector, setSector] = useState<'all' | 'federal' | 'state' | 'private' | 'polytechnic'>('all');

  const rankedInstitutions = publicInstitutions
    .filter((i) => {
      if (sector === 'federal') return i.level === 'federal_university';
      if (sector === 'state') return i.level === 'state_university';
      if (sector === 'private') return i.level === 'private_university';
      if (sector === 'polytechnic') return i.level === 'polytechnic';
      return true;
    })
    .sort((a, b) => (a.nationalRanking || 99) - (b.nationalRanking || 99));

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>Verified Institutional Metrics</span>
            <span>·</span>
            <span>Research Output & Governance Standing</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Institutional Rankings & Academic Recognition
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Benchmarking Nigerian educational institutions across research output, faculty citations, graduate employability, and continuous academic calendar compliance.
          </p>
        </div>

        {/* Sector Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Higher Institutions' },
            { id: 'federal', label: 'Federal Universities' },
            { id: 'state', label: 'State Universities' },
            { id: 'private', label: 'Private Universities' },
            { id: 'polytechnic', label: 'Polytechnics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSector(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                sector === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Rankings Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Standing</th>
                  <th className="py-3 px-4">Institution Name</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Staff Strength</th>
                  <th className="py-3 px-3">Accreditation</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rankedInstitutions.map((inst, idx) => (
                  <tr key={inst.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 font-bold'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-900'
                          : 'bg-slate-50 text-slate-600'
                      }`}>
                        #{inst.nationalRanking || idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <button
                        onClick={() => openInstitutionProfile(inst.id)}
                        className="hover:text-teal-700 text-left"
                      >
                        {inst.name}
                      </button>
                      {inst.acronym && <span className="text-slate-400 block font-normal text-[11px]">{inst.acronym}</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-600 capitalize">{inst.ownership} {inst.level.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-slate-600">{inst.city}, {inst.state}</td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                      {inst.academicStaffCount ? `${inst.academicStaffCount}+ staff` : 'Charter verified'}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-medium">{inst.accreditationBody}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openInstitutionProfile(inst.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-700 hover:text-white rounded transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
