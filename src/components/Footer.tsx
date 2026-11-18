import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Mail, Phone, ShieldCheck, X } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentTab, setSelectedInstitutionId, setFilterLevel } = useApp();
  const [infoModal, setInfoModal] = useState<{ title: string; body: string } | null>(null);

  const navigateSector = (level: string) => {
    setSelectedInstitutionId(null);
    setFilterLevel(level);
    setCurrentTab('schools');
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      {/* Top Advisory Banner */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>Independence & Verification Notice:</strong> EduSphere Nigeria provides standardized institutional metrics across all 36 Nigerian states and the FCT. Non-statutory metrics are clearly flagged.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 whitespace-nowrap">
            Aligned with NUC, NBTE, NCCE & JAMB frameworks
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Platform Wordmark & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white shadow-inner">
                E
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                EduSphere<span className="text-teal-400">.ng</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Nigeria’s unified education intelligence ecosystem. Connecting educational institutions, prospective candidates, undergraduate researchers, lecturers, and education policymakers nationwide.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Central Business District, Abuja, FCT, Nigeria</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>registry@edusphere.ng</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>+234 (0) 9 461 4000 (Mon - Fri, 8am - 5pm WAT)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Institutional Directory */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Institutional Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateSector('federal_university')}
                  className="hover:text-white transition-colors text-left"
                >
                  Federal Universities
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateSector('state_university')}
                  className="hover:text-white transition-colors text-left"
                >
                  State Universities
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateSector('private_university')}
                  className="hover:text-white transition-colors text-left"
                >
                  Private Universities
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateSector('polytechnic')}
                  className="hover:text-white transition-colors text-left"
                >
                  Polytechnics & Monotechnics
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateSector('college_of_education')}
                  className="hover:text-white transition-colors text-left"
                >
                  Colleges of Education
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateSector('secondary')}
                  className="hover:text-white transition-colors text-left"
                >
                  Federal Unity Colleges & Secondary
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Intelligence & Opportunities */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Intelligence & Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setSelectedInstitutionId(null);
                    setCurrentTab('admissions');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  JAMB Cut-Off Marks 2026
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedInstitutionId(null);
                    setCurrentTab('scholarships');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Verified Scholarships
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedInstitutionId(null);
                    setCurrentTab('news');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Regulatory News & NUC Circulars
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedInstitutionId(null);
                    setCurrentTab('rankings');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Institutional Rankings
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedInstitutionId(null);
                    setCurrentTab('students');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Student & Researcher Honors
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setSelectedInstitutionId(null);
                    setCurrentTab('resources');
                  }}
                  className="hover:text-white transition-colors text-left"
                >
                  Syllabi & Past Benchmarks
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Governance & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Platform & Institutional
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setSelectedInstitutionId(null);
                    setCurrentTab('admin');
                  }}
                  className="hover:text-white transition-colors text-left text-teal-400 font-medium"
                >
                  Institution Registrar Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Institutional Charter Verification',
                      body: 'Every accredited tertiary institution listed in EduSphere Nigeria is cross-checked against statutory charters issued by the National Universities Commission (NUC), National Board for Technical Education (NBTE), National Commission for Colleges of Education (NCCE), or state Ministries of Education. Unverified or demonstration entries are explicitly flagged.',
                    })
                  }
                  className="hover:text-white transition-colors text-left"
                >
                  Institutional Charter Verification
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Help Centre & Editorial Support Desk',
                      body: 'To report outdated admission cut-off marks, fee schedules, or portal URLs, open any institution profile and click "Report Incorrect Information" or contact registry@edusphere.ng.',
                    })
                  }
                  className="hover:text-white transition-colors text-left"
                >
                  Help Centre & Support Desk
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Privacy Policy & NDPR Compliance',
                      body: 'EduSphere Nigeria adheres to the Nigeria Data Protection Act (NDPA) and NDPR principles. When operating in Demonstration Mode, user preferences and edits are stored locally in browser storage; when connected to Supabase, Row Level Security (RLS) restricts write operations strictly to authenticated stakeholders.',
                    })
                  }
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy & NDPR Compliance
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    setInfoModal({
                      title: 'Terms of Service',
                      body: 'All admission statistics, UTME cut-off benchmarks, and scholarship notices are provided for guidance. Candidates must always verify final offers directly on the JAMB Central Admissions Processing System (CAPS) and official institutional portals.',
                    })
                  }
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Copyright & Attribution */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} EduSphere Nigeria Ltd. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Demonstration Data Clearly Labelled</span>
            <span>·</span>
            <span>All 36 States + FCT Supported</span>
            <span>·</span>
            <span className="text-slate-400">RC: 1984201-NG</span>
          </div>
        </div>
      </div>

      {infoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">{infoModal.title}</h3>
              <button onClick={() => setInfoModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{infoModal.body}</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInfoModal(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
