import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, X, Lock, Mail, LogOut, UserCheck, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isAuthenticated,
    currentUser,
    loginUser,
    logoutUser,
    isLiveSupabase,
    setCurrentTab,
  } = useApp();

  const [email, setEmail] = useState('tolu.adeleke@edusphere.ng');
  const [password, setPassword] = useState('edusphere2026');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const demoAccounts = [
    { label: 'Super Admin', email: 'tolu.adeleke@edusphere.ng', scope: 'Full Platform Governance' },
    { label: 'Institution Admin (UI)', email: 'k.adebowale@ui.edu.ng', scope: 'University of Ibadan Only' },
    { label: 'Institution Admin (UNILAG)', email: 'vc@unilag.edu.ng', scope: 'University of Lagos Only' },
    { label: 'Editorial Staff', email: 'babatunde.alabi@guardian.ng', scope: 'News & Reports Review' },
    { label: 'Student / Candidate', email: 'chidinma.eze@gmail.com', scope: 'Public Registry & Reviews' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }
    setSubmitting(true);
    const ok = await loginUser(email, password);
    setSubmitting(false);
    if (ok) {
      setIsAuthModalOpen(false);
    } else {
      setErrorMsg('Invalid email or password. Select one of the verified demonstration accounts below or enter valid Supabase credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 my-8 border border-slate-200">
        <div className="flex items-start justify-between border-b border-slate-200 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-teal-700">
              <Shield className="w-3.5 h-3.5" />
              <span>{isLiveSupabase ? 'Supabase Authentication' : 'Demonstration Session Access'}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {isAuthenticated ? 'Active Account & Security' : 'Sign In to EduSphere Nigeria'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
            aria-label="Close authentication modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAuthenticated && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Signed in as:</span>
              <strong className="text-slate-900">{currentUser.fullName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="font-mono text-slate-700">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Assigned Role:</span>
              <span className="capitalize font-semibold text-teal-800">{currentUser.role.replace('_', ' ')}</span>
            </div>
            {currentUser.institutionId && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Institutional Scope:</span>
                <span className="font-mono text-slate-700">{currentUser.institutionId}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              {(currentUser.role === 'super_admin' || currentUser.role === 'institution_admin' || currentUser.role === 'editor') && (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(false);
                    setCurrentTab('admin');
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Open Admin Portal
                </button>
              )}
              <button
                onClick={async () => {
                  await logoutUser();
                  setIsAuthModalOpen(false);
                }}
                className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div className="text-slate-600 font-medium">
            {isAuthenticated ? 'Switch or Sign In with Another Account:' : 'Enter institutional or stakeholder credentials:'}
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu.ng"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Password / Access Passkey</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min. 4 chars in demo)"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {!isLiveSupabase && (
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Demonstration Quick-Fill Accounts
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword('edusphere2026');
                    setErrorMsg('');
                  }}
                  className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-[11px] flex items-center justify-between transition-colors"
                >
                  <div>
                    <strong className="text-slate-900 block">{acc.label}</strong>
                    <span className="text-slate-500 font-mono">{acc.email}</span>
                  </div>
                  <span className="text-teal-700 font-medium text-[10px]">{acc.scope}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
