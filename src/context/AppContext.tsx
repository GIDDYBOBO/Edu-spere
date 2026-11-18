import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Institution,
  NewsArticle,
  Scholarship,
  Achievement,
  AuditLog,
  UserProfile,
  UserRole,
  Review,
  DataReport,
  Course,
  CommunityTopic,
  VerificationStatus,
  VerificationRecord,
} from '../types';
import {
  INITIAL_INSTITUTIONS,
  INITIAL_NEWS,
  INITIAL_SCHOLARSHIPS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_COMMUNITY_TOPICS,
} from '../data/initialData';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  fetchInstitutionsFromSupabase,
  fetchAuditLogsFromSupabase,
  createInstitutionInSupabase,
  updateInstitutionInSupabase,
  verifyInstitutionInSupabase,
  setPublicationStatusInSupabase,
  addCourseInSupabase,
  insertAuditLogToSupabase,
  getInstitutionCompleteness,
} from '../services/institutionService';

export type NavigationTab =
  | 'home'
  | 'schools'
  | 'news'
  | 'admissions'
  | 'scholarships'
  | 'rankings'
  | 'students'
  | 'resources'
  | 'community'
  | 'admin';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

interface AppContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  selectedInstitutionId: string | null;
  setSelectedInstitutionId: (id: string | null) => void;
  openInstitutionProfile: (id: string) => void;

  // Search & Global Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterLevel: string;
  setFilterLevel: (level: string) => void;
  filterState: string;
  setFilterState: (state: string) => void;
  resetFilters: () => void;

  // Data State
  institutions: Institution[];
  publicInstitutions: Institution[];
  isLoadingInstitutions: boolean;
  isSavingInstitution: boolean;
  dbError: string | null;
  refreshInstitutions: () => Promise<void>;

  news: NewsArticle[];
  scholarships: Scholarship[];
  achievements: Achievement[];
  communityTopics: CommunityTopic[];
  auditLogs: AuditLog[];
  usersList: UserProfile[];
  dataReports: DataReport[];
  watchlist: string[];
  watchlistDrawerOpen: boolean;
  setWatchlistDrawerOpen: (open: boolean) => void;
  toggleWatchlist: (institutionId: string) => void;
  isInWatchlist: (institutionId: string) => boolean;

  // Admin & Registry Lifecycle Actions
  addInstitution: (inst: Omit<Institution, 'id' | 'slug' | 'lastUpdated' | 'publicationStatus'>) => Promise<ActionResult>;
  updateInstitution: (id: string, updates: Partial<Institution>, changesSummary?: string) => Promise<ActionResult>;
  submitForVerification: (id: string, sourceUsed?: string) => Promise<ActionResult>;
  verifyInstitution: (
    id: string,
    newStatus: VerificationStatus,
    sourceUsed?: string,
    notes?: string
  ) => Promise<ActionResult>;
  publishInstitution: (id: string) => Promise<ActionResult>;
  unpublishInstitution: (id: string) => Promise<ActionResult>;
  archiveInstitution: (id: string) => Promise<ActionResult>;
  restoreInstitution: (id: string) => Promise<ActionResult>;
  addCourseToInstitution: (
    institutionId: string,
    facultyName: string,
    departmentName: string,
    course: Omit<Course, 'id' | 'institutionId'>
  ) => Promise<ActionResult>;

  addNewsArticle: (newsItem: Omit<NewsArticle, 'id' | 'slug' | 'publishedAt'>) => void;
  deleteNewsArticle: (id: string) => void;
  addScholarship: (scholarship: Omit<Scholarship, 'id'>) => void;
  deleteScholarship: (id: string) => void;
  addReview: (institutionId: string, review: Omit<Review, 'id' | 'date'>) => void;
  addCommunityTopic: (topic: Omit<CommunityTopic, 'id' | 'repliesCount' | 'viewsCount' | 'lastActivity'>) => void;
  updateUserRole: (userId: string, newRole: UserRole) => void;

  // Data Integrity & Inaccuracy Reporting
  submitDataReport: (report: Omit<DataReport, 'id' | 'timestamp' | 'status'>) => void;
  resolveDataReport: (reportId: string, status: DataReport['status'], notes?: string) => void;

  // Authentication & Session
  currentUser: UserProfile;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginUser: (email: string, passwordOrPin: string) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  switchRole: (role: UserRole) => void;

  // Supabase state
  isLiveSupabase: boolean;

  // Notification Toast
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const STORAGE_KEYS = {
  INSTITUTIONS: 'edusphere_institutions_v4',
  NEWS: 'edusphere_news_v2',
  SCHOLARSHIPS: 'edusphere_scholarships_v1',
  COMMUNITY: 'edusphere_community_v1',
  USERS: 'edusphere_users_v1',
  WATCHLIST: 'edusphere_watchlist_v1',
  AUDIT_LOGS: 'edusphere_audit_logs_v2',
  AUTH_USER: 'edusphere_auth_user_v1',
  REPORTS: 'edusphere_data_reports_v1',
};

const INITIAL_REPORTS_DATA: DataReport[] = [
  {
    id: 'rep-01',
    institutionId: 'inst-ui',
    institutionName: 'University of Ibadan',
    category: 'Cut-Off Mark',
    details: 'The departmental cut-off for MBBS was adjusted in the latest Senate release.',
    suggestedCorrection: 'Check official UI Admissions circular dated 2026-02-01.',
    reportedByEmail: 'chidinma.eze@gmail.com',
    reportedByName: 'Chidinma Eze',
    timestamp: '2026-02-12 11:20:00',
    status: 'investigating',
  },
];

const GUEST_USER: UserProfile = {
  id: 'usr-guest',
  fullName: 'Public Visitor',
  email: 'visitor@edusphere.ng',
  role: 'student',
  stateOfOrigin: 'FCT Abuja',
  savedInstitutionIds: [],
};

const INITIAL_USERS_DATA: UserProfile[] = [
  {
    id: 'usr-demo-01',
    fullName: 'Toluwanimi Adeleke',
    email: 'tolu.adeleke@edusphere.ng',
    role: 'super_admin',
    stateOfOrigin: 'Lagos',
    savedInstitutionIds: ['inst-unilag', 'inst-ui'],
  },
  { id: 'usr-demo-02', fullName: 'Prof. Kayode Adebowale', email: 'k.adebowale@ui.edu.ng', role: 'institution_admin', institutionId: 'inst-ui', savedInstitutionIds: [] },
  { id: 'usr-demo-03', fullName: 'Dr. Folasade Ogunsola', email: 'vc@unilag.edu.ng', role: 'institution_admin', institutionId: 'inst-unilag', savedInstitutionIds: [] },
  { id: 'usr-demo-04', fullName: 'Babatunde Alabi', email: 'babatunde.alabi@guardian.ng', role: 'editor', savedInstitutionIds: [] },
  { id: 'usr-demo-05', fullName: 'Chidinma Eze', email: 'chidinma.eze@gmail.com', role: 'student', stateOfOrigin: 'Enugu', savedInstitutionIds: ['inst-unilag', 'inst-ui'] },
  { id: 'usr-demo-06', fullName: 'Dr. Grace Okonkwo', email: 'g.okonkwo@futo.edu.ng', role: 'lecturer', institutionId: 'inst-futo', savedInstitutionIds: [] },
  { id: 'usr-demo-07', fullName: 'Alhaji Musa Garba', email: 'musa.garba@yahoo.com', role: 'parent', stateOfOrigin: 'Kaduna', savedInstitutionIds: ['inst-abu'] },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const parseHashRoute = () => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    if (!hash) return { tab: 'home' as NavigationTab, instId: null };

    if (hash.startsWith('school/')) {
      const slugOrId = hash.replace('school/', '');
      return { tab: 'schools' as NavigationTab, instId: slugOrId };
    }

    const validTabs: NavigationTab[] = [
      'home', 'schools', 'news', 'admissions', 'scholarships',
      'rankings', 'students', 'resources', 'community', 'admin',
    ];
    if (validTabs.includes(hash as NavigationTab)) {
      return { tab: hash as NavigationTab, instId: null };
    }
    return { tab: 'home' as NavigationTab, instId: null };
  };

  const initialRoute = parseHashRoute();
  const [currentTab, setCurrentTabState] = useState<NavigationTab>(initialRoute.tab);
  const [selectedInstitutionId, setSelectedInstitutionIdState] = useState<string | null>(initialRoute.instId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterState, setFilterState] = useState('all');

  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState<boolean>(isSupabaseConfigured);
  const [isSavingInstitution, setIsSavingInstitution] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    if (isSupabaseConfigured) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSTITUTIONS);
      if (stored) {
        const parsed = JSON.parse(stored) as Institution[];
        const normalized = parsed.map((inst) => ({
          ...inst,
          publicationStatus: inst.publicationStatus || (inst.isArchived ? 'archived' : 'published'),
          isArchived: Boolean(inst.isArchived),
        }));
        const existingIds = new Set(normalized.map((i) => i.id));
        const missingFromSeed = INITIAL_INSTITUTIONS.filter((i) => !existingIds.has(i.id));
        return missingFromSeed.length > 0 ? [...normalized, ...missingFromSeed] : normalized;
      }
    } catch {
      // fallback
    }
    return INITIAL_INSTITUTIONS;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NEWS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_NEWS;
  });

  const [scholarships, setScholarships] = useState<Scholarship[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHOLARSHIPS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_SCHOLARSHIPS;
  });

  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_USERS_DATA;
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return ['inst-unilag', 'inst-ui'];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (isSupabaseConfigured) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'log-1',
        actorEmail: 'tolu.adeleke@edusphere.ng',
        actorName: 'Toluwanimi Adeleke',
        actorRole: 'super_admin',
        action: 'VERIFY_INSTITUTION',
        entityType: 'Institution',
        entityId: 'inst-ui',
        details: 'Verified & published University of Ibadan charter against NUC registry.',
        timestamp: '2026-02-14 09:24:10',
      },
      {
        id: 'log-2',
        actorEmail: 'tolu.adeleke@edusphere.ng',
        actorName: 'Toluwanimi Adeleke',
        actorRole: 'super_admin',
        action: 'PUBLISH_INSTITUTION',
        entityType: 'Institution',
        entityId: 'inst-unilag',
        details: 'Published University of Lagos 2025/2026 registry profile and cut-off benchmarks.',
        timestamp: '2026-02-12 14:11:05',
      },
    ];
  });

  const [communityTopics, setCommunityTopics] = useState<CommunityTopic[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMMUNITY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_COMMUNITY_TOPICS;
  });

  const [watchlistDrawerOpen, setWatchlistDrawerOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (isSupabaseConfigured) return GUEST_USER;
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed && parsed.user) return parsed.user;
      }
    } catch {
      // fallback
    }
    return GUEST_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (isSupabaseConfigured) return false;
    try {
      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        return Boolean(parsed?.isAuthenticated);
      }
    } catch {
      // fallback
    }
    return false;
  });

  const [dataReports, setDataReports] = useState<DataReport[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return INITIAL_REPORTS_DATA;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Publicly visible institutions ONLY (published & not archived)
  const publicInstitutions = useMemo(
    () =>
      institutions.filter(
        (inst) => inst.publicationStatus === 'published' && !inst.isArchived
      ),
    [institutions]
  );

  // Restore real Supabase Auth session if configured
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const hydrateAuth = async () => {
      try {
        const { data } = await client.auth.getSession();
        const sessionUser = data.session?.user;
        if (sessionUser) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle();

          setCurrentUser({
            id: sessionUser.id,
            fullName: profile?.full_name || sessionUser.user_metadata?.full_name || sessionUser.email || 'Authenticated User',
            email: profile?.email || sessionUser.email || '',
            role: profile?.role || 'student',
            stateOfOrigin: profile?.state_of_origin || undefined,
            institutionId: profile?.institution_id || undefined,
            savedInstitutionIds: [],
          });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('Supabase session hydration error:', err);
      }
    };

    hydrateAuth();
  }, []);

  // Load real institutions & audit logs when Supabase is configured
  const refreshInstitutions = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoadingInstitutions(true);
    setDbError(null);
    try {
      const includeAdminRecords =
        currentUser.role === 'super_admin' || currentUser.role === 'institution_admin';
      const rows = await fetchInstitutionsFromSupabase(includeAdminRecords);
      setInstitutions(rows);

      if (currentUser.role === 'super_admin') {
        const logs = await fetchAuditLogsFromSupabase();
        setAuditLogs(logs);
      }
    } catch (err: any) {
      setDbError(err?.message || 'Unable to load institution registry from Supabase PostgreSQL.');
    } finally {
      setIsLoadingInstitutions(false);
    }
  }, [currentUser.role]);

  useEffect(() => {
    if (isSupabaseConfigured) {
      refreshInstitutions();
    }
  }, [refreshInstitutions]);

  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHashRoute();
      setCurrentTabState(route.tab);
      setSelectedInstitutionIdState(route.instId);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setCurrentTab = (tab: NavigationTab) => {
    setSelectedInstitutionIdState(null);
    setCurrentTabState(tab);
    window.location.hash = `/${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setSelectedInstitutionId = (id: string | null) => {
    setSelectedInstitutionIdState(id);
    if (id) {
      window.location.hash = `/school/${id}`;
    } else {
      window.location.hash = `/${currentTab}`;
    }
  };

  const openInstitutionProfile = (id: string) => {
    setSelectedInstitutionIdState(id);
    window.location.hash = `/school/${id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Persist local preview state ONLY when Supabase is not configured
  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      localStorage.setItem(STORAGE_KEYS.INSTITUTIONS, JSON.stringify(institutions));
    } catch (e) {
      console.warn('Could not save institutions to localStorage', e);
    }
  }, [institutions]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Could not save audit logs', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    try {
      localStorage.setItem(
        STORAGE_KEYS.AUTH_USER,
        JSON.stringify({ user: currentUser, isAuthenticated })
      );
    } catch (e) {
      console.warn('Could not save auth session to localStorage', e);
    }
  }, [currentUser, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
    } catch { /* ignore */ }
  }, [news]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOLARSHIPS, JSON.stringify(scholarships));
    } catch { /* ignore */ }
  }, [scholarships]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
    } catch { /* ignore */ }
  }, [usersList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch { /* ignore */ }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(dataReports));
    } catch { /* ignore */ }
  }, [dataReports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMUNITY, JSON.stringify(communityTopics));
    } catch { /* ignore */ }
  }, [communityTopics]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4200);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterLevel('all');
    setFilterState('all');
  };

  const toggleWatchlist = (institutionId: string) => {
    setWatchlist((prev) => {
      const exists = prev.includes(institutionId);
      const updated = exists ? prev.filter((id) => id !== institutionId) : [...prev, institutionId];
      showToast(
        exists ? 'Removed institution from your Watchlist.' : 'Added institution to your Watchlist.',
        'info'
      );
      return updated;
    });
  };

  const isInWatchlist = (institutionId: string) => watchlist.includes(institutionId);

  const appendLocalAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorEmail: currentUser.email,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const addInstitution = async (
    instData: Omit<Institution, 'id' | 'slug' | 'lastUpdated' | 'publicationStatus'>
  ): Promise<ActionResult> => {
    if (currentUser.role !== 'super_admin') {
      const msg = 'Permission denied: Only Super Administrators can register new institutions.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }

    // Never automatically mark new institutions as verified or published
    const initialVerification: VerificationStatus =
      instData.verificationStatus === 'pending_verification' ? 'pending_verification' : 'draft';

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        const created = await createInstitutionInSupabase(
          { ...instData, verificationStatus: initialVerification, publicationStatus: 'unpublished' },
          currentUser
        );
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'INSTITUTION_CREATED',
          entityType: 'Institution',
          entityId: created.id,
          details: `Created institution "${created.name}" (${created.state}) as ${initialVerification} / unpublished.`,
        });
        await refreshInstitutions();
        showToast(`Saved "${created.name}" to PostgreSQL as ${initialVerification.replace('_', ' ')} (Unpublished).`);
        return { ok: true, id: created.id };
      } catch (err: any) {
        const errMsg = err?.message || 'Failed to save institution to Supabase PostgreSQL.';
        showToast(errMsg, 'warning');
        return { ok: false, error: errMsg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    // Local preview mode (Supabase not configured)
    const nowDate = new Date().toISOString().split('T')[0];
    const slugBase = instData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = institutions.some((i) => i.slug === slugBase) ? `${slugBase}-${Date.now().toString().slice(-4)}` : slugBase;
    const newInst: Institution = {
      ...instData,
      id: `inst-${Date.now()}`,
      slug: uniqueSlug,
      verificationStatus: initialVerification,
      publicationStatus: 'unpublished',
      isArchived: false,
      createdAt: nowDate,
      createdBy: currentUser.id,
      createdByName: currentUser.fullName,
      updatedBy: currentUser.id,
      updatedByName: currentUser.fullName,
      lastUpdated: nowDate,
      isFeatured: false,
    };

    setInstitutions((prev) => [newInst, ...prev]);
    appendLocalAudit(
      'INSTITUTION_CREATED',
      'Institution',
      newInst.id,
      `Created "${newInst.name}" (${newInst.state}) in ${initialVerification} / unpublished status.`
    );
    showToast(
      `Local preview: "${newInst.name}" saved as ${initialVerification.replace('_', ' ')}. Configure Supabase (.env) for PostgreSQL persistence.`,
      'info'
    );
    return { ok: true, id: newInst.id };
  };

  const updateInstitution = async (
    id: string,
    updates: Partial<Institution>,
    changesSummary?: string
  ): Promise<ActionResult> => {
    const canEdit =
      currentUser.role === 'super_admin' ||
      (currentUser.role === 'institution_admin' && currentUser.institutionId === id);

    if (!canEdit) {
      const msg = 'Permission denied: You are only authorized to edit your assigned institution.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }

    const safeUpdates: Partial<Institution> = { ...updates };
    if (currentUser.role === 'institution_admin') {
      delete safeUpdates.verificationStatus;
      delete safeUpdates.publicationStatus;
      delete safeUpdates.isArchived;
    }

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await updateInstitutionInSupabase(id, safeUpdates, currentUser);
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'INSTITUTION_UPDATED',
          entityType: 'Institution',
          entityId: id,
          details: changesSummary || `Updated institution profile details for ID: ${id}`,
        });
        await refreshInstitutions();
        showToast('Institution changes committed to PostgreSQL.');
        return { ok: true, id };
      } catch (err: any) {
        const errMsg = err?.message || 'Failed updating institution in PostgreSQL.';
        showToast(errMsg, 'warning');
        return { ok: false, error: errMsg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    setInstitutions((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst;
        const mergedAdmission = safeUpdates.admissionInfo
          ? { ...inst.admissionInfo, ...safeUpdates.admissionInfo }
          : inst.admissionInfo;
        return {
          ...inst,
          ...safeUpdates,
          admissionInfo: mergedAdmission,
          updatedBy: currentUser.id,
          updatedByName: currentUser.fullName,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );
    appendLocalAudit(
      'INSTITUTION_UPDATED',
      'Institution',
      id,
      changesSummary || `Updated details for institution ID: ${id}`
    );
    showToast('Institution updated in local preview mode.');
    return { ok: true, id };
  };

  const submitForVerification = async (id: string, sourceUsed?: string): Promise<ActionResult> => {
    const canSubmit =
      currentUser.role === 'super_admin' ||
      (currentUser.role === 'institution_admin' && currentUser.institutionId === id);

    if (!canSubmit) {
      const msg = 'Permission denied: Cannot submit this institution for verification.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await verifyInstitutionInSupabase(
          id,
          'pending_verification',
          sourceUsed || 'Submitted by administrator',
          'Submitted for statutory verification review.',
          currentUser
        );
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'VERIFICATION_STATUS_CHANGED',
          entityType: 'Institution',
          entityId: id,
          details: 'Submitted institution record for verification review (pending_verification).',
        });
        await refreshInstitutions();
        showToast('Submitted institution for verification review.');
        return { ok: true, id };
      } catch (err: any) {
        const msg = err?.message || 'Database rejected verification submission.';
        showToast(msg, 'warning');
        return { ok: false, error: msg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    const nowIso = new Date().toISOString();
    const record: VerificationRecord = {
      id: `ver-${Date.now()}`,
      institutionId: id,
      status: 'pending_verification',
      reviewerName: currentUser.fullName,
      reviewerEmail: currentUser.email,
      sourceUsed: sourceUsed || 'Institutional submission',
      notes: 'Submitted for verification review.',
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
    };

    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              verificationStatus: 'pending_verification',
              updatedBy: currentUser.id,
              updatedByName: currentUser.fullName,
              verificationHistory: [record, ...(inst.verificationHistory || [])],
              lastUpdated: nowIso.split('T')[0],
            }
          : inst
      )
    );
    appendLocalAudit(
      'VERIFICATION_STATUS_CHANGED',
      'Institution',
      id,
      'Submitted record for verification review (pending_verification).'
    );
    showToast('Institution submitted for verification review.');
    return { ok: true, id };
  };

  const verifyInstitution = async (
    id: string,
    newStatus: VerificationStatus,
    sourceUsed?: string,
    notes?: string
  ): Promise<ActionResult> => {
    if (currentUser.role !== 'super_admin') {
      const msg = 'Permission denied: Verification approval requires Super Administrator clearance.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }

    const effectiveSource = sourceUsed?.trim() || 'Federal Ministry / NUC / NBTE / NCCE Official Registry';

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await verifyInstitutionInSupabase(id, newStatus, effectiveSource, notes || '', currentUser);
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'VERIFICATION_STATUS_CHANGED',
          entityType: 'Institution',
          entityId: id,
          details: `Verification changed to "${newStatus}" using source "${effectiveSource}". ${notes || ''}`,
        });
        await refreshInstitutions();
        showToast(`Verification status updated to: ${newStatus.replace('_', ' ')}`);
        return { ok: true, id };
      } catch (err: any) {
        const msg = err?.message || 'Database rejected verification update.';
        showToast(msg, 'warning');
        return { ok: false, error: msg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    const nowIso = new Date().toISOString();
    const record: VerificationRecord = {
      id: `ver-${Date.now()}`,
      institutionId: id,
      status: newStatus,
      reviewerName: currentUser.fullName,
      reviewerEmail: currentUser.email,
      sourceUsed: effectiveSource,
      notes: notes || undefined,
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
    };

    setInstitutions((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst;
        // If rejected or drafted while published, unpublish automatically to preserve integrity
        const nextPub =
          (newStatus === 'rejected' || newStatus === 'draft') && inst.publicationStatus === 'published'
            ? 'unpublished'
            : inst.publicationStatus;

        return {
          ...inst,
          verificationStatus: newStatus,
          publicationStatus: nextPub,
          verifiedAt: newStatus === 'verified' ? nowIso : inst.verifiedAt,
          verifiedBy: newStatus === 'verified' ? currentUser.id : inst.verifiedBy,
          verifiedByName: newStatus === 'verified' ? currentUser.fullName : inst.verifiedByName,
          verificationNotes: notes || inst.verificationNotes,
          sourceReference: {
            name: effectiveSource,
            url: inst.sourceReference?.url,
            verificationDate: nowIso.split('T')[0],
          },
          verificationHistory: [record, ...(inst.verificationHistory || [])],
          updatedBy: currentUser.id,
          updatedByName: currentUser.fullName,
          lastUpdated: nowIso.split('T')[0],
        };
      })
    );

    appendLocalAudit(
      'VERIFICATION_STATUS_CHANGED',
      'Institution',
      id,
      `Verification status set to "${newStatus}" (Source: ${effectiveSource})`
    );
    showToast(`Verification status updated to: ${newStatus.replace('_', ' ')}`);
    return { ok: true, id };
  };

  const publishInstitution = async (id: string): Promise<ActionResult> => {
    if (currentUser.role !== 'super_admin') {
      const msg = 'Permission denied: Only Super Administrators can publish institutions publicly.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }

    const target = institutions.find((i) => i.id === id);
    if (!target) return { ok: false, error: 'Institution not found.' };
    if (target.isArchived || target.publicationStatus === 'archived') {
      const msg = 'Cannot publish an archived institution. Restore it from archive first.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }
    if (target.verificationStatus !== 'verified') {
      const msg = 'Cannot publish an unverified institution. Verify the record first.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }
    if (!target.name?.trim() || !target.state?.trim() || !target.city?.trim() || !target.description?.trim()) {
      const msg = 'Cannot publish an incomplete record missing required core details.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }

    const completeness = getInstitutionCompleteness(target);

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await setPublicationStatusInSupabase(id, 'published', currentUser);
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'INSTITUTION_PUBLISHED',
          entityType: 'Institution',
          entityId: id,
          details: `Published "${target.name}" to public Explore Schools directory (Completeness: ${completeness.score}/${completeness.total}).`,
        });
        await refreshInstitutions();
        showToast(`Published "${target.name}" to public Explore Schools directory.`);
        return { ok: true, id };
      } catch (err: any) {
        const msg = err?.message || 'Database rejected publish operation.';
        showToast(msg, 'warning');
        return { ok: false, error: msg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    const nowIso = new Date().toISOString();
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              publicationStatus: 'published',
              isArchived: false,
              publishedAt: nowIso,
              publishedBy: currentUser.id,
              publishedByName: currentUser.fullName,
              updatedBy: currentUser.id,
              updatedByName: currentUser.fullName,
              lastUpdated: nowIso.split('T')[0],
            }
          : inst
      )
    );
    appendLocalAudit(
      'INSTITUTION_PUBLISHED',
      'Institution',
      id,
      `Published "${target.name}" to public Explore Schools registry.`
    );
    showToast(`Published "${target.name}" to public Explore Schools registry.`);
    return { ok: true, id };
  };

  const unpublishInstitution = async (id: string): Promise<ActionResult> => {
    if (currentUser.role !== 'super_admin') {
      const msg = 'Permission denied: Only Super Administrators can unpublish institutions.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }
    const target = institutions.find((i) => i.id === id);

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await setPublicationStatusInSupabase(id, 'unpublished', currentUser);
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'INSTITUTION_UNPUBLISHED',
          entityType: 'Institution',
          entityId: id,
          details: `Unpublished "${target?.name || id}" from public Explore Schools visibility.`,
        });
        await refreshInstitutions();
        showToast(`Unpublished "${target?.name || id}".`, 'info');
        return { ok: true, id };
      } catch (err: any) {
        const msg = err?.message || 'Failed to unpublish institution.';
        showToast(msg, 'warning');
        return { ok: false, error: msg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              publicationStatus: 'unpublished',
              updatedBy: currentUser.id,
              updatedByName: currentUser.fullName,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : inst
      )
    );
    appendLocalAudit(
      'INSTITUTION_UNPUBLISHED',
      'Institution',
      id,
      `Unpublished "${target?.name || id}" from public view.`
    );
    showToast(`Unpublished "${target?.name || id}" from public directory.`, 'info');
    return { ok: true, id };
  };

  const archiveInstitution = async (id: string): Promise<ActionResult> => {
    if (currentUser.role !== 'super_admin') {
      const msg = 'Permission denied: Only Super Administrators can archive institutions.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }
    const target = institutions.find((i) => i.id === id);

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await setPublicationStatusInSupabase(id, 'archived', currentUser);
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'INSTITUTION_ARCHIVED',
          entityType: 'Institution',
          entityId: id,
          details: `Archived institution "${target?.name || id}" (retained in governance archive).`,
        });
        await refreshInstitutions();
        showToast(`Archived "${target?.name || id}".`, 'warning');
        return { ok: true, id };
      } catch (err: any) {
        const msg = err?.message || 'Failed to archive institution.';
        showToast(msg, 'warning');
        return { ok: false, error: msg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    const nowIso = new Date().toISOString();
    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              publicationStatus: 'archived',
              isArchived: true,
              archivedAt: nowIso,
              archivedBy: currentUser.id,
              updatedBy: currentUser.id,
              updatedByName: currentUser.fullName,
              lastUpdated: nowIso.split('T')[0],
            }
          : inst
      )
    );
    appendLocalAudit(
      'INSTITUTION_ARCHIVED',
      'Institution',
      id,
      `Archived "${target?.name || id}" (hidden from public view).`
    );
    showToast(`Archived "${target?.name || id}" (preserved in audit history).`, 'warning');
    return { ok: true, id };
  };

  const restoreInstitution = async (id: string): Promise<ActionResult> => {
    if (currentUser.role !== 'super_admin') {
      const msg = 'Permission denied: Only Super Administrators can restore archived institutions.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }
    const target = institutions.find((i) => i.id === id);

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await setPublicationStatusInSupabase(id, 'unpublished', currentUser);
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'INSTITUTION_RESTORED',
          entityType: 'Institution',
          entityId: id,
          details: `Restored "${target?.name || id}" from archive into unpublished status.`,
        });
        await refreshInstitutions();
        showToast(`Restored "${target?.name || id}" as unpublished.`);
        return { ok: true, id };
      } catch (err: any) {
        const msg = err?.message || 'Failed to restore institution.';
        showToast(msg, 'warning');
        return { ok: false, error: msg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    setInstitutions((prev) =>
      prev.map((inst) =>
        inst.id === id
          ? {
              ...inst,
              publicationStatus: 'unpublished',
              isArchived: false,
              archivedAt: undefined,
              updatedBy: currentUser.id,
              updatedByName: currentUser.fullName,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : inst
      )
    );
    appendLocalAudit(
      'INSTITUTION_RESTORED',
      'Institution',
      id,
      `Restored "${target?.name || id}" from archive.`
    );
    showToast(`Restored "${target?.name || id}" (currently unpublished).`);
    return { ok: true, id };
  };

  const addCourseToInstitution = async (
    institutionId: string,
    facultyName: string,
    departmentName: string,
    courseData: Omit<Course, 'id' | 'institutionId'>
  ): Promise<ActionResult> => {
    const canEdit =
      currentUser.role === 'super_admin' ||
      (currentUser.role === 'institution_admin' && currentUser.institutionId === institutionId);

    if (!canEdit) {
      const msg = 'Permission denied: Cannot modify academic programs for this institution.';
      showToast(msg, 'warning');
      return { ok: false, error: msg };
    }

    if (isSupabaseConfigured) {
      setIsSavingInstitution(true);
      try {
        await addCourseInSupabase(institutionId, facultyName, departmentName, courseData);
        await insertAuditLogToSupabase({
          actorId: currentUser.id,
          actorEmail: currentUser.email,
          actorName: currentUser.fullName,
          actorRole: currentUser.role,
          action: 'ADD_COURSE_PROGRAMME',
          entityType: 'Course',
          entityId: institutionId,
          details: `Added ${courseData.degreeType} ${courseData.name} under ${facultyName} -> ${departmentName}`,
        });
        await refreshInstitutions();
        showToast(`Added programme "${courseData.name}" (${courseData.degreeType}) to PostgreSQL.`);
        return { ok: true };
      } catch (err: any) {
        const msg = err?.message || 'Failed adding course in PostgreSQL.';
        showToast(msg, 'warning');
        return { ok: false, error: msg };
      } finally {
        setIsSavingInstitution(false);
      }
    }

    const newCourse: Course = {
      ...courseData,
      id: `crs-${Date.now()}`,
      institutionId,
    };

    setInstitutions((prev) =>
      prev.map((inst) => {
        if (inst.id !== institutionId) return inst;
        const existingFaculties = inst.faculties ? [...inst.faculties] : [];
        const facIndex = existingFaculties.findIndex(
          (f) => f.name.toLowerCase() === facultyName.trim().toLowerCase()
        );

        if (facIndex === -1) {
          existingFaculties.push({
            id: `fac-${Date.now()}`,
            name: facultyName.trim(),
            departments: [
              {
                id: `dept-${Date.now()}`,
                name: departmentName.trim(),
                courses: [newCourse],
              },
            ],
          });
        } else {
          const targetFac = { ...existingFaculties[facIndex] };
          const depts = [...targetFac.departments];
          const deptIndex = depts.findIndex(
            (d) => d.name.toLowerCase() === departmentName.trim().toLowerCase()
          );
          if (deptIndex === -1) {
            depts.push({
              id: `dept-${Date.now()}`,
              name: departmentName.trim(),
              courses: [newCourse],
            });
          } else {
            depts[deptIndex] = {
              ...depts[deptIndex],
              courses: [...depts[deptIndex].courses, newCourse],
            };
          }
          targetFac.departments = depts;
          existingFaculties[facIndex] = targetFac;
        }

        return {
          ...inst,
          faculties: existingFaculties,
          updatedBy: currentUser.id,
          updatedByName: currentUser.fullName,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );

    appendLocalAudit(
      'ADD_COURSE_PROGRAMME',
      'Course',
      newCourse.id,
      `Added ${newCourse.degreeType} ${newCourse.name} under ${facultyName} -> ${departmentName}`
    );
    showToast(`Added programme "${newCourse.name}" (${newCourse.degreeType}).`);
    return { ok: true, id: newCourse.id };
  };

  const addNewsArticle = (newsItem: Omit<NewsArticle, 'id' | 'slug' | 'publishedAt'>) => {
    if (!['super_admin', 'institution_admin', 'editor'].includes(currentUser.role)) {
      showToast('Permission denied: Editorial or Administrative clearance required.', 'warning');
      return;
    }

    const slug = newsItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newArticle: NewsArticle = {
      ...newsItem,
      id: `news-${Date.now()}`,
      slug,
      publishedAt: new Date().toISOString(),
    };
    setNews((prev) => [newArticle, ...prev]);
    appendLocalAudit('PUBLISH_NEWS', 'NewsArticle', newArticle.id, `Published news article: ${newArticle.title}`);
    showToast('News article published successfully.');
  };

  const deleteNewsArticle = (id: string) => {
    if (!['super_admin', 'editor'].includes(currentUser.role)) {
      showToast('Permission denied: Only Super Admins or Editors can retract bulletins.', 'warning');
      return;
    }
    setNews((prev) => prev.filter((n) => n.id !== id));
    appendLocalAudit('DELETE_NEWS', 'NewsArticle', id, `Retracted bulletin ID: ${id}`);
    showToast('News bulletin removed.', 'warning');
  };

  const addScholarship = (schItem: Omit<Scholarship, 'id'>) => {
    if (!['super_admin', 'editor'].includes(currentUser.role)) {
      showToast('Permission denied: Only Super Admins or Editors can publish scholarships.', 'warning');
      return;
    }

    const newSch: Scholarship = { ...schItem, id: `sch-${Date.now()}` };
    setScholarships((prev) => [newSch, ...prev]);
    appendLocalAudit('PUBLISH_SCHOLARSHIP', 'Scholarship', newSch.id, `Published scholarship opportunity: ${newSch.title}`);
    showToast('New scholarship opportunity published.');
  };

  const deleteScholarship = (id: string) => {
    if (currentUser.role !== 'super_admin') {
      showToast('Permission denied: Only Super Administrators can remove scholarships.', 'warning');
      return;
    }
    setScholarships((prev) => prev.filter((s) => s.id !== id));
    appendLocalAudit('DELETE_SCHOLARSHIP', 'Scholarship', id, `Removed scholarship ID: ${id}`);
    showToast('Scholarship listing removed.', 'warning');
  };

  const addReview = (institutionId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };

    setInstitutions((prev) =>
      prev.map((inst) => {
        if (inst.id === institutionId) {
          return {
            ...inst,
            reviews: [newReview, ...(inst.reviews || [])],
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return inst;
      })
    );

    appendLocalAudit('SUBMIT_REVIEW', 'Institution', institutionId, `Submitted rating (${newReview.rating}/5) for ${institutionId}`);
    showToast('Your verified institutional feedback has been published.');
  };

  const addCommunityTopic = (topicData: Omit<CommunityTopic, 'id' | 'repliesCount' | 'viewsCount' | 'lastActivity'>) => {
    const newTopic: CommunityTopic = {
      ...topicData,
      id: `top-${Date.now()}`,
      repliesCount: 0,
      viewsCount: 1,
      lastActivity: 'Just now',
    };
    setCommunityTopics((prev) => [newTopic, ...prev]);
    showToast('Community topic posted and saved.');
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (currentUser.role !== 'super_admin') {
      showToast('Permission denied: Only Super Administrators can modify user RBAC roles.', 'warning');
      return;
    }

    setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, role: newRole }));
    }
    appendLocalAudit('UPDATE_USER_ROLE', 'UserProfile', userId, `Assigned role "${newRole}" to user account: ${userId}`);
    showToast(`Role updated to ${newRole.replace('_', ' ').toUpperCase()}`);
  };

  const switchRole = (role: UserRole) => {
    if (isSupabaseConfigured) {
      showToast('Persona switching is disabled when connected to live Supabase Auth.', 'warning');
      return;
    }
    const matchedPersona = usersList.find((u) => u.role === role);
    if (matchedPersona) {
      setCurrentUser(matchedPersona);
    } else {
      setCurrentUser((prev) => ({ ...prev, role }));
    }
    setIsAuthenticated(true);
    showToast(`Switched demonstration persona to: ${role.replace('_', ' ').toUpperCase()}`, 'info');
  };

  const submitDataReport = (repData: Omit<DataReport, 'id' | 'timestamp' | 'status'>) => {
    const newReport: DataReport = {
      ...repData,
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'pending',
    };
    setDataReports((prev) => [newReport, ...prev]);
    appendLocalAudit('SUBMIT_DATA_REPORT', 'DataReport', newReport.id, `Reported issue with ${newReport.institutionName}: ${newReport.category}`);
    showToast('Inaccuracy report logged. Our editorial board will verify against official sources.', 'info');
  };

  const resolveDataReport = (reportId: string, status: DataReport['status'], notes?: string) => {
    if (!['super_admin', 'editor'].includes(currentUser.role)) {
      showToast('Permission denied: Administrative review required to resolve reports.', 'warning');
      return;
    }

    setDataReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status, adminNotes: notes } : r)));
    appendLocalAudit('RESOLVE_DATA_REPORT', 'DataReport', reportId, `Updated report status to "${status}"`);
    showToast(`Report status updated to: ${status.toUpperCase()}`);
  };

  const loginUser = async (email: string, passwordOrPin: string): Promise<boolean> => {
    const client = supabase;
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: passwordOrPin,
        });
        if (error) {
          showToast(`Supabase Auth error: ${error.message}`, 'warning');
          return false;
        }
        if (data.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          setCurrentUser({
            id: data.user.id,
            fullName: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
            email: profile?.email || data.user.email || email,
            role: profile?.role || 'student',
            institutionId: profile?.institution_id || undefined,
            savedInstitutionIds: [],
          });
          setIsAuthenticated(true);
          showToast(`Authenticated with Supabase as ${email}`);
          return true;
        }
      } catch (e: any) {
        showToast(e?.message || 'Authentication failed.', 'warning');
        return false;
      }
    }

    const found = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (found && passwordOrPin.trim().length >= 4) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      showToast(`Signed in (Demo) as ${found.fullName} (${found.role.replace('_', ' ').toUpperCase()})`);
      return true;
    }
    showToast('Invalid credentials or unrecognised account email.', 'warning');
    return false;
  };

  const logoutUser = async () => {
    const client = supabase;
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        // ignore
      }
    }

    setCurrentUser(GUEST_USER);
    setIsAuthenticated(false);
    showToast('Signed out of session. Operating as Public Visitor.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        selectedInstitutionId,
        setSelectedInstitutionId,
        openInstitutionProfile,
        searchQuery,
        setSearchQuery,
        filterLevel,
        setFilterLevel,
        filterState,
        setFilterState,
        resetFilters,
        institutions,
        publicInstitutions,
        isLoadingInstitutions,
        isSavingInstitution,
        dbError,
        refreshInstitutions,
        news,
        scholarships,
        achievements: INITIAL_ACHIEVEMENTS,
        communityTopics,
        auditLogs,
        usersList,
        dataReports,
        watchlist,
        watchlistDrawerOpen,
        setWatchlistDrawerOpen,
        toggleWatchlist,
        isInWatchlist,
        addInstitution,
        updateInstitution,
        submitForVerification,
        verifyInstitution,
        publishInstitution,
        unpublishInstitution,
        archiveInstitution,
        restoreInstitution,
        addCourseToInstitution,
        addNewsArticle,
        deleteNewsArticle,
        addScholarship,
        deleteScholarship,
        addReview,
        addCommunityTopic,
        updateUserRole,
        submitDataReport,
        resolveDataReport,
        currentUser,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginUser,
        logoutUser,
        switchRole,
        isLiveSupabase: isSupabaseConfigured,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
