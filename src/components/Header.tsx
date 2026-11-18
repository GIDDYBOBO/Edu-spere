import React, { useState } from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import { Bookmark, Shield, User, Menu, X, ChevronDown, Check, LogIn } from 'lucide-react';
import { UserRole } from '../types';

export const Header: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    watchlist,
    setWatchlistDrawerOpen,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    switchRole,
    isLiveSupabase,
    setSelectedInstitutionId
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const navItems: { label: string; tab: NavigationTab }[] = [
    { label: 'Explore Schools', tab: 'schools' },
    { label: 'Admissions & JAMB', tab: 'admissions' },
    { label: 'Scholarships', tab: 'scholarships' },
    { label: 'Education News', tab: 'news' },
    { label: 'Rankings', tab: 'rankings' },
  ];

  const secondaryNavItems: { label: string; tab: NavigationTab }[] = [
    { label: 'Students & Lecturers', tab: 'students' },
    { label: 'Academic Resources', tab: 'resources' },
    { label: 'Community', tab: 'community' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setSelectedInstitutionId(null);
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
  };

  const roles: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Administrator' },
    { role: 'institution_admin', label: 'Institution Admin' },
    { role: 'student', label: 'Student / Candidate' },
    { role: 'lecturer', label: 'Lecturer / Researcher' },
    { role: 'parent', label: 'Parent / Guardian' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      {/* Platform Environment Notice Strip (Subtle Top Line) */}
      <div className="bg-slate-950 px-4 py-1 text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <span className="text-teal-400 font-medium">Federal Republic of Nigeria</span>
          <span className="text-slate-600">·</span>
          <span>Unified Education Intelligence System</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-400">
            {isLiveSupabase ? (
              <span className="text-emerald-400 font-medium">Supabase PostgreSQL Connected</span>
            ) : (
              <span className="text-amber-400 font-medium">Demonstration Mode (Local State)</span>
            )}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Role: <strong className="text-white capitalize">{currentUser.role.replace('_', ' ')}</strong></span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-md py-1"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white shadow-inner">
              E
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap leading-none">
                EduSphere<span className="text-teal-400">.ng</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 mt-0.5">
                Nigeria Education Intelligence
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => handleNavClick(item.tab)}
                  className={`whitespace-nowrap transition-colors py-1 focus:outline-none ${
                    isActive
                      ? 'text-teal-400 font-semibold border-b-2 border-teal-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Secondary dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 text-slate-300 hover:text-white whitespace-nowrap py-1 focus:outline-none text-sm font-medium"
              >
                <span>Ecosystem</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {moreMenuOpen && (
                <div
                  className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50"
                  onMouseLeave={() => setMoreMenuOpen(false)}
                >
                  {secondaryNavItems.map((item) => (
                    <button
                      key={item.tab}
                      onClick={() => handleNavClick(item.tab)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Watchlist Quick Button */}
            <button
              onClick={() => setWatchlistDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
              title="Open saved institutions watchlist"
            >
              <Bookmark className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Watchlist</span>
              <span className="tabular-nums font-mono font-medium text-slate-200 bg-slate-700 px-1.5 py-0.2 rounded text-[11px]">
                {watchlist.length}
              </span>
            </button>

            {/* Sign In / Account Modal Trigger */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
              title="Account authentication & session controls"
            >
              {isAuthenticated ? (
                <>
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden md:inline max-w-[110px] truncate">{currentUser.fullName.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5 text-teal-400" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Role Switcher Menu (QA / Demonstration Persona) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap"
                title="Switch demonstration persona role"
              >
                <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl py-1.5 z-50"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Demo Persona Switcher
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setRoleMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-left text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <span>{r.label}</span>
                      {currentUser.role === r.role && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Dashboard CTA */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                currentTab === 'admin'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
            Navigation
          </div>
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md ${
              currentTab === 'home' ? 'bg-teal-950/60 text-teal-300 font-medium' : 'text-slate-300'
            }`}
          >
            Home
          </button>
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                currentTab === item.tab ? 'bg-teal-950/60 text-teal-300 font-medium' : 'text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
            More Ecosystem Hubs
          </div>
          {secondaryNavItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                currentTab === item.tab ? 'bg-teal-950/60 text-teal-300 font-medium' : 'text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
            Account & Session
          </div>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setIsAuthModalOpen(true);
            }}
            className="w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between text-slate-200 hover:bg-slate-900"
          >
            <span>
              {isAuthenticated
                ? `${currentUser.fullName} (${currentUser.role.replace('_', ' ')})`
                : 'Sign In / Switch Account'}
            </span>
            {isAuthenticated ? <User className="w-4 h-4 text-teal-400" /> : <LogIn className="w-4 h-4 text-teal-400" />}
          </button>

          <div className="pt-2 border-t border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
            Governance & Administration
          </div>
          <button
            onClick={() => handleNavClick('admin')}
            className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center justify-between ${
              currentTab === 'admin' ? 'bg-teal-950/60 text-teal-300 font-medium' : 'text-teal-400'
            }`}
          >
            <span>Admin Portal</span>
            <Shield className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
