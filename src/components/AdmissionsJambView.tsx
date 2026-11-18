import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, GraduationCap, CheckCircle2, Clock, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';

export const AdmissionsJambView: React.FC = () => {
  const { publicInstitutions, openInstitutionProfile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const admissionInstitutions = publicInstitutions.filter((inst) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return inst.name.toLowerCase().includes(q) || inst.acronym?.toLowerCase().includes(q) || inst.state.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Hero */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
            <span>Central Admissions Processing System (CAPS)</span>
            <span>·</span>
            <span>Official JAMB Directives</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Admissions & JAMB Intelligence Desk
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Verify official institutional cut-off marks, Post-UTME screening dates, O-Level requirements, and JAMB CAPS transfer protocols for all Nigerian universities and polytechnics.
          </p>
        </div>

        {/* 4 Core Pillars of Nigerian Admissions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-bold text-slate-900 block text-sm">1. Post-UTME Fee Cap</span>
            <p className="text-slate-600">
              By Federal Ministry of Education directive, no institution may exceed ₦2,000 for Post-UTME screening form processing.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-bold text-slate-900 block text-sm">2. JAMB CAPS Acceptance</span>
            <p className="text-slate-600">
              Candidates must monitor their JAMB CAPS profile to formally accept or reject course admission offers before matriculation.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-bold text-slate-900 block text-sm">3. O-Level Sitting Policy</span>
            <p className="text-slate-600">
              Most science and engineering faculties accept WAEC/NECO at two sittings; Medicine (MBBS) strictly mandates single-sitting passes.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <span className="font-bold text-slate-900 block text-sm">4. Age Eligibility</span>
            <p className="text-slate-600">
              Candidates must attain a minimum age of 16 years by the matriculation session cutoff as prescribed by the Joint Admissions Board.
            </p>
          </div>
        </div>

        {/* Cut-off Mark Table & Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Harmonized Institutional Cut-Off Marks
              </h2>
              <p className="text-xs text-slate-500">
                Official minimum scores required for post-UTME screening eligibility.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search university or polytechnic..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-3">Institution Name</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3">State</th>
                  <th className="py-3 px-3">UTME Cut-Off</th>
                  <th className="py-3 px-3">Post-UTME Fee</th>
                  <th className="py-3 px-3">Application Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {admissionInstitutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {inst.name}
                      {inst.acronym && <span className="text-slate-400 block font-normal text-[11px]">{inst.acronym}</span>}
                    </td>
                    <td className="py-3 px-3 text-slate-600 capitalize">{inst.level.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-slate-600">{inst.state}</td>
                    <td className="py-3 px-3 font-mono tabular-nums font-bold text-teal-800 text-sm">
                      {inst.admissionInfo ? `${inst.admissionInfo.generalCutOffMark}+` : 'Not verified'}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                      {inst.admissionInfo?.postUtmeFeeNaira !== undefined
                        ? `₦${inst.admissionInfo.postUtmeFeeNaira.toLocaleString()}`
                        : 'Not published'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CAPS Active</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openInstitutionProfile(inst.id)}
                        className="px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-700 hover:text-white rounded transition-colors"
                      >
                        Requirements
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
