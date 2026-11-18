/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { DirectoryView } from './components/DirectoryView';
import { InstitutionProfileView } from './components/InstitutionProfileView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdmissionsJambView } from './components/AdmissionsJambView';
import { ScholarshipsView } from './components/ScholarshipsView';
import { NewsView } from './components/NewsView';
import { RankingsView } from './components/RankingsView';
import { StudentsLecturersView } from './components/StudentsLecturersView';
import { ResourcesView } from './components/ResourcesView';
import { CommunityView } from './components/CommunityView';
import { AuthModal } from './components/AuthModal';
import { CheckCircle2, AlertCircle, Info, X, Bookmark } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    currentTab,
    selectedInstitutionId,
    toast,
    watchlist,
    watchlistDrawerOpen,
    setWatchlistDrawerOpen,
    publicInstitutions,
    openInstitutionProfile,
    toggleWatchlist
  } = useApp();

  const bookmarkedInstitutions = publicInstitutions.filter((i) => watchlist.includes(i.id));

  // Render view
  const renderView = () => {
    if (selectedInstitutionId) {
      return <InstitutionProfileView />;
    }

    switch (currentTab) {
      case 'home':
        return <HomeView />;
      case 'schools':
        return <DirectoryView />;
      case 'admissions':
        return <AdmissionsJambView />;
      case 'scholarships':
        return <ScholarshipsView />;
      case 'news':
        return <NewsView />;
      case 'rankings':
        return <RankingsView />;
      case 'students':
        return <StudentsLecturersView />;
      case 'resources':
        return <ResourcesView />;
      case 'community':
        return <CommunityView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div className="bg-slate-900 text-white border border-slate-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header />

      {/* Primary Main Viewport */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Bottom Footer */}
      <Footer />

      {/* Floating Quick Watchlist Drawer Toggle */}
      {watchlist.length > 0 && (
        <button
          onClick={() => setWatchlistDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-teal-800 hover:bg-teal-700 text-white px-3.5 py-2 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold border border-teal-600 transition-transform hover:scale-105"
        >
          <Bookmark className="w-4 h-4 fill-current text-teal-300" />
          <span>Watchlist</span>
          <span className="bg-teal-950 px-1.5 py-0.5 rounded-full font-mono tabular-nums text-[11px]">
            {watchlist.length}
          </span>
        </button>
      )}

      {/* Watchlist Modal / Drawer */}
      {watchlistDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-teal-700 fill-teal-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Your Personal Watchlist ({watchlist.length})
                </h3>
              </div>
              <button
                onClick={() => setWatchlistDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Quick access to your shortlisted schools, cut-offs, and admission portals.
            </p>

            <div className="overflow-y-auto divide-y divide-slate-100 flex-1 space-y-1">
              {bookmarkedInstitutions.map((inst) => (
                <div key={inst.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-slate-900 block font-semibold">{inst.name}</strong>
                    <span className="text-slate-500">{inst.city}, {inst.state} State · Cut-Off: {inst.admissionInfo ? `${inst.admissionInfo.generalCutOffMark}+` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setWatchlistDrawerOpen(false);
                        openInstitutionProfile(inst.id);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-700 hover:text-white rounded transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => toggleWatchlist(inst.id)}
                      className="text-slate-400 hover:text-red-600"
                      title="Remove from Watchlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setWatchlistDrawerOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Sign-In / Session Modal */}
      <AuthModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
