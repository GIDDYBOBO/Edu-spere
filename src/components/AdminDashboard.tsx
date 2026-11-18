import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  NIGERIAN_STATES,
  EDUCATION_LEVEL_LABELS,
  INSTITUTION_CATEGORY_LABELS,
  VERIFICATION_STATUS_LABELS,
  PUBLICATION_STATUS_LABELS,
} from '../data/nigerianStates';
import {
  getInstitutionCompleteness,
  inferCategoryFromLevel,
} from '../services/institutionService';
import {
  Institution,
  InstitutionCategory,
  InstitutionLevel,
  OwnershipType,
  VerificationStatus,
  NewsArticle,
  Scholarship,
  DataReport,
  UserRole,
} from '../types';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  BookOpen,
  Flag,
  LogIn,
  X,
  Eye,
  CheckCircle2,
  Send,
  Globe,
  EyeOff,
  Archive,
  RotateCcw,
  RefreshCw,
  Database,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type AdminTab =
  | 'overview'
  | 'institutions'
  | 'academics'
  | 'admissions'
  | 'news'
  | 'scholarships'
  | 'reports'
  | 'users'
  | 'audit';

type QuickViewFilter =
  | 'active'
  | 'pending'
  | 'verified_unpublished'
  | 'incomplete'
  | 'recent'
  | 'archived';

export const AdminDashboard: React.FC = () => {
  const {
    institutions,
    publicInstitutions,
    isLoadingInstitutions,
    isSavingInstitution,
    dbError,
    refreshInstitutions,
    news,
    scholarships,
    auditLogs,
    usersList,
    dataReports,
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
    updateUserRole,
    resolveDataReport,
    currentUser,
    switchRole,
    setIsAuthModalOpen,
    setCurrentTab,
    isLiveSupabase,
    openInstitutionProfile,
  } = useApp();

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isInstitutionAdmin = currentUser.role === 'institution_admin';
  const isEditor = currentUser.role === 'editor';
  const isAuthorizedAdmin = isSuperAdmin || isInstitutionAdmin || isEditor;

  const assignedInstitution = isInstitutionAdmin && currentUser.institutionId
    ? institutions.find((i) => i.id === currentUser.institutionId) || null
    : null;

  const scopedInstitutions = isInstitutionAdmin
    ? institutions.filter((i) => i.id === currentUser.institutionId)
    : institutions;

  const pendingReportsCount = dataReports.filter(
    (r) => r.status === 'pending' || r.status === 'investigating'
  ).length;

  const allTabs: { id: AdminTab; label: string; allowed: boolean }[] = [
    { id: 'overview', label: 'Platform Statistics', allowed: isSuperAdmin || isInstitutionAdmin },
    { id: 'institutions', label: `Institutions (${scopedInstitutions.length})`, allowed: isSuperAdmin || isInstitutionAdmin },
    { id: 'academics', label: 'Faculties & Courses', allowed: isSuperAdmin || isInstitutionAdmin },
    { id: 'admissions', label: 'Admission Cut-offs', allowed: isSuperAdmin || isInstitutionAdmin },
    { id: 'news', label: `Education News (${news.length})`, allowed: isSuperAdmin || isInstitutionAdmin || isEditor },
    { id: 'scholarships', label: `Scholarships (${scholarships.length})`, allowed: isSuperAdmin || isEditor },
    { id: 'reports', label: `Data Reports (${pendingReportsCount} open)`, allowed: isSuperAdmin || isEditor },
    { id: 'users', label: 'User Roles & RBAC', allowed: isSuperAdmin },
    { id: 'audit', label: `Audit Trail (${auditLogs.length})`, allowed: isSuperAdmin },
  ];

  const permittedTabs = allTabs.filter((t) => t.allowed);
  const [activeTab, setActiveTab] = useState<AdminTab>(isEditor ? 'news' : 'institutions');
  const effectiveTab: AdminTab = permittedTabs.some((t) => t.id === activeTab)
    ? activeTab
    : (permittedTabs[0]?.id ?? 'institutions');

  // Institution Search, Filters & Quick Views
  const [instSearch, setInstSearch] = useState('');
  const [instCategoryFilter, setInstCategoryFilter] = useState('all');
  const [instLevelFilter, setInstLevelFilter] = useState('all');
  const [instOwnershipFilter, setInstOwnershipFilter] = useState('all');
  const [instVerificationFilter, setInstVerificationFilter] = useState('all');
  const [instPublicationFilter, setInstPublicationFilter] = useState('all');
  const [quickView, setQuickView] = useState<QuickViewFilter>('active');
  const [instPage, setInstPage] = useState(1);
  const [admissionsPage, setAdmissionsPage] = useState(1);
  const adminPageSize = 25;
  const [actionErrorBanner, setActionErrorBanner] = useState<string | null>(null);

  // Form State for 6-Section Adding / Editing Institution
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstId, setEditingInstId] = useState<string | null>(null);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);

  // Details Inspector & Verification Review Modals
  const [inspectingInstId, setInspectingInstId] = useState<string | null>(null);
  const [verifyingInstId, setVerifyingInstId] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<VerificationStatus>('verified');
  const [verifySource, setVerifySource] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Form State for Admission Cut-off Modal
  const [editingAdmissionInstId, setEditingAdmissionInstId] = useState<string | null>(null);
  const [admissionFormData, setAdmissionFormData] = useState({
    academicSession: '2025/2026',
    generalCutOffMark: 180,
    postUtmeFeeNaira: 2000,
    applicationDeadline: '',
    directEntryInfo: '',
    guidelines: '',
  });
  const [admissionErrors, setAdmissionErrors] = useState<Record<string, string>>({});

  // Form State for Faculties & Courses Manager
  const [selectedAcademicInstId, setSelectedAcademicInstId] = useState<string>(
    currentUser.institutionId || institutions[0]?.id || ''
  );
  const effectiveAcademicInstId = isInstitutionAdmin && currentUser.institutionId
    ? currentUser.institutionId
    : (institutions.some((i) => i.id === selectedAcademicInstId)
        ? selectedAcademicInstId
        : institutions[0]?.id || '');
  const selectedAcademicInst = institutions.find((i) => i.id === effectiveAcademicInstId) || null;

  const [courseFormData, setCourseFormData] = useState({
    facultyName: '',
    departmentName: '',
    courseName: '',
    degreeType: 'B.Sc.',
    durationYears: 4,
    accreditationStatus: 'Full NUC Accreditation',
    cutOffMark: 200,
    oLevelRequirements: '5 SSCE credits including English Language & Mathematics',
  });
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});

  // Form State for News
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsFormData, setNewsFormData] = useState({
    title: '',
    category: 'Admissions' as NewsArticle['category'],
    summary: '',
    content: '',
    institutionName: assignedInstitution?.name || '',
    readTime: '3 min read',
  });
  const [newsFormErrors, setNewsFormErrors] = useState<Record<string, string>>({});

  // Form State for Scholarship
  const [isSchModalOpen, setIsSchModalOpen] = useState(false);
  const [schFormData, setSchFormData] = useState({
    title: '',
    providerName: '',
    providerType: 'Federal Government' as Scholarship['providerType'],
    coverage: 'Full Tuition & Monthly Stipend',
    deadline: '2026-06-30',
    applicationUrl: 'https://',
    eligibilityText: 'Minimum 5 credits in SSCE WAEC/NECO at one sitting, Enrolled undergraduate',
  });
  const [schFormErrors, setSchFormErrors] = useState<Record<string, string>>({});

  // Report notes draft map
  const [reportNotes, setReportNotes] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    // Section 1: Basic Information
    name: '',
    commonName: '',
    acronym: '',
    establishmentYear: 1960,
    description: '',
    // Section 2: Institution Classification
    category: 'university' as InstitutionCategory,
    level: 'federal_university' as InstitutionLevel,
    ownership: 'Federal' as OwnershipType,
    // Section 3: Location
    state: 'Lagos',
    lga: '',
    city: 'Lagos',
    address: '',
    // Section 4: Contact Information
    websiteUrl: 'https://',
    email: '',
    phone: '',
    // Section 5: Accreditation and Verification
    accreditationBody: 'National Universities Commission (NUC)',
    accreditationStatus: '',
    accreditationReference: '',
    verificationStatus: 'draft' as VerificationStatus,
    sourceName: '',
    sourceUrl: '',
    // Section 6: Media and Branding & Leadership
    logoUrl: '',
    coverImageUrl: '',
    motto: '',
    chancellorOrPrincipal: '',
    studentPopulationRange: '',
    schoolFees: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedStateLgas = useMemo(() => {
    return NIGERIAN_STATES.find((s) => s.name === formData.state)?.majorLgas || [];
  }, [formData.state]);

  // Filtered institutions in admin table
  const adminInstitutions = useMemo(() => {
    const filtered = scopedInstitutions.filter((inst) => {
      const archived = Boolean(inst.isArchived || inst.publicationStatus === 'archived');

      // Quick view filtering
      if (quickView === 'archived') {
        if (!archived) return false;
      } else {
        if (archived && instPublicationFilter !== 'archived') return false;
        if (quickView === 'pending' && inst.verificationStatus !== 'pending_verification' && inst.verificationStatus !== 'draft') {
          return false;
        }
        if (quickView === 'verified_unpublished' && (inst.verificationStatus !== 'verified' || inst.publicationStatus !== 'unpublished')) {
          return false;
        }
        if (quickView === 'incomplete' && getInstitutionCompleteness(inst).isComplete) {
          return false;
        }
      }

      if (instSearch.trim()) {
        const q = instSearch.toLowerCase();
        const match =
          inst.name.toLowerCase().includes(q) ||
          (inst.commonName && inst.commonName.toLowerCase().includes(q)) ||
          (inst.acronym && inst.acronym.toLowerCase().includes(q)) ||
          (inst.formerNames && inst.formerNames.some((fn) => fn.toLowerCase().includes(q))) ||
          (inst.successorName && inst.successorName.toLowerCase().includes(q)) ||
          (inst.operationalStatusNote && inst.operationalStatusNote.toLowerCase().includes(q)) ||
          inst.city.toLowerCase().includes(q) ||
          inst.state.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (instCategoryFilter !== 'all' && inst.category !== instCategoryFilter) {
        return false;
      }
      if (instLevelFilter !== 'all' && inst.level !== instLevelFilter) {
        return false;
      }
      if (instOwnershipFilter !== 'all' && inst.ownership !== instOwnershipFilter) {
        return false;
      }
      if (instVerificationFilter !== 'all' && inst.verificationStatus !== instVerificationFilter) {
        return false;
      }
      if (instPublicationFilter !== 'all' && inst.publicationStatus !== instPublicationFilter) {
        return false;
      }
      return true;
    });

    if (quickView === 'recent') {
      return [...filtered].sort((a, b) => (b.lastUpdated || '').localeCompare(a.lastUpdated || ''));
    }
    return filtered;
  }, [
    scopedInstitutions,
    quickView,
    instSearch,
    instCategoryFilter,
    instLevelFilter,
    instOwnershipFilter,
    instVerificationFilter,
    instPublicationFilter,
  ]);

  const instTotalPages = Math.ceil(adminInstitutions.length / adminPageSize) || 1;
  const safeInstPage = Math.min(instPage, instTotalPages);
  const paginatedAdminInstitutions = useMemo(() => {
    const start = (safeInstPage - 1) * adminPageSize;
    return adminInstitutions.slice(start, start + adminPageSize);
  }, [adminInstitutions, safeInstPage]);

  const admissionsTotalPages = Math.ceil(scopedInstitutions.length / adminPageSize) || 1;
  const safeAdmissionsPage = Math.min(admissionsPage, admissionsTotalPages);
  const paginatedAdmissionsInstitutions = useMemo(() => {
    const start = (safeAdmissionsPage - 1) * adminPageSize;
    return scopedInstitutions.slice(start, start + adminPageSize);
  }, [scopedInstitutions, safeAdmissionsPage]);

  const openAddModal = () => {
    setEditingInstId(null);
    setFormSubmitError(null);
    setFormData({
      name: '',
      commonName: '',
      acronym: '',
      establishmentYear: 1960,
      description: '',
      category: 'university',
      level: 'federal_university',
      ownership: 'Federal',
      state: 'Lagos',
      lga: 'Lagos Mainland',
      city: 'Lagos',
      address: '',
      websiteUrl: 'https://',
      email: '',
      phone: '',
      accreditationBody: 'National Universities Commission (NUC)',
      accreditationStatus: '',
      accreditationReference: '',
      verificationStatus: 'draft',
      sourceName: '',
      sourceUrl: '',
      logoUrl: '',
      coverImageUrl: '',
      motto: '',
      chancellorOrPrincipal: '',
      studentPopulationRange: '',
      schoolFees: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (inst: Institution) => {
    setEditingInstId(inst.id);
    setFormSubmitError(null);
    setFormData({
      name: inst.name,
      commonName: inst.commonName || '',
      acronym: inst.acronym || '',
      establishmentYear: inst.establishmentYear || 1960,
      description: inst.description || '',
      category: inst.category || inferCategoryFromLevel(inst.level),
      level: inst.level,
      ownership: inst.ownership,
      state: inst.state,
      lga: inst.lga || '',
      city: inst.city,
      address: inst.address || '',
      websiteUrl: inst.websiteUrl || 'https://',
      email: inst.email || '',
      phone: inst.phone || '',
      accreditationBody: inst.accreditationBody || 'National Universities Commission (NUC)',
      accreditationStatus: inst.accreditationStatus || '',
      accreditationReference: inst.accreditationReference || '',
      verificationStatus: inst.verificationStatus,
      sourceName: inst.sourceReference?.name || '',
      sourceUrl: inst.sourceReference?.url || '',
      logoUrl: inst.logoUrl || '',
      coverImageUrl: inst.coverImageUrl || '',
      motto: inst.motto || '',
      chancellorOrPrincipal: inst.chancellorOrPrincipal || '',
      studentPopulationRange: inst.studentPopulationRange || '',
      schoolFees: inst.schoolFeesRange || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Official institution name is required.';
    if (!formData.state.trim()) errors.state = 'State / FCT is required.';
    if (!formData.lga.trim()) errors.lga = 'Local Government Area (LGA) is required.';
    if (!formData.city.trim()) errors.city = 'City or town is required.';
    if (!formData.address.trim()) errors.address = 'Physical street/campus address is required.';
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errors.description = 'Provide at least 20 characters of factual overview.';
    }
    const currentYear = new Date().getFullYear();
    if (formData.establishmentYear < 1850 || formData.establishmentYear > currentYear) {
      errors.establishmentYear = `Valid establishment year required (1850 - ${currentYear}).`;
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid official email address.';
    }
    const cleanedWebsite = formData.websiteUrl.trim();
    if (cleanedWebsite && cleanedWebsite !== 'https://' && !/^https?:\/\/.+\..+/.test(cleanedWebsite)) {
      errors.websiteUrl = 'Website must be a valid http:// or https:// URL.';
    }
    if (formData.sourceUrl.trim() && !/^https?:\/\/.+\..+/.test(formData.sourceUrl.trim())) {
      errors.sourceUrl = 'Source URL must begin with http:// or https://';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormSubmitError(null);

    const existingInst = editingInstId
      ? institutions.find((i) => i.id === editingInstId)
      : undefined;

    const normalizedWebsite =
      formData.websiteUrl.trim() === 'https://' ? '' : formData.websiteUrl.trim();

    const sourceRefPayload = formData.sourceName.trim()
      ? {
          name: formData.sourceName.trim(),
          url: formData.sourceUrl.trim() || undefined,
          verificationDate: existingInst?.sourceReference?.verificationDate,
        }
      : existingInst?.sourceReference;

    let result;
    if (editingInstId) {
      result = await updateInstitution(
        editingInstId,
        {
          name: formData.name.trim(),
          commonName: formData.commonName.trim() || undefined,
          acronym: formData.acronym.trim(),
          category: formData.category,
          level: formData.level,
          ownership: formData.ownership,
          state: formData.state,
          lga: formData.lga.trim(),
          city: formData.city.trim(),
          address: formData.address.trim(),
          establishmentYear: Number(formData.establishmentYear),
          motto: formData.motto.trim(),
          websiteUrl: normalizedWebsite,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          logoUrl: formData.logoUrl.trim() || undefined,
          coverImageUrl: formData.coverImageUrl.trim() || undefined,
          chancellorOrPrincipal: formData.chancellorOrPrincipal.trim() || undefined,
          studentPopulationRange: formData.studentPopulationRange.trim() || undefined,
          schoolFeesRange: formData.schoolFees.trim() || undefined,
          description: formData.description.trim(),
          accreditationBody: formData.accreditationBody.trim(),
          accreditationStatus: formData.accreditationStatus.trim() || undefined,
          accreditationReference: formData.accreditationReference.trim() || undefined,
          sourceReference: sourceRefPayload,
        },
        `Edited registry record for "${formData.name.trim()}"`
      );
    } else {
      result = await addInstitution({
        name: formData.name.trim(),
        commonName: formData.commonName.trim() || undefined,
        acronym: formData.acronym.trim(),
        category: formData.category,
        level: formData.level,
        ownership: formData.ownership,
        state: formData.state,
        lga: formData.lga.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        establishmentYear: Number(formData.establishmentYear),
        motto: formData.motto.trim(),
        websiteUrl: normalizedWebsite,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        logoUrl: formData.logoUrl.trim() || undefined,
        coverImageUrl: formData.coverImageUrl.trim() || undefined,
        chancellorOrPrincipal: formData.chancellorOrPrincipal.trim() || undefined,
        studentPopulationRange: formData.studentPopulationRange.trim() || undefined,
        verificationStatus: formData.verificationStatus === 'pending_verification' ? 'pending_verification' : 'draft',
        accreditationBody: formData.accreditationBody.trim(),
        accreditationStatus: formData.accreditationStatus.trim() || undefined,
        accreditationReference: formData.accreditationReference.trim() || undefined,
        description: formData.description.trim(),
        schoolFeesRange: formData.schoolFees.trim() || undefined,
        sourceReference: sourceRefPayload,
      });
    }

    if (result.ok) {
      setIsFormOpen(false);
    } else {
      setFormSubmitError(result.error || 'Could not save institution record.');
    }
  };

  const openVerificationModal = (inst: Institution) => {
    setVerifyingInstId(inst.id);
    setVerifyStatus(inst.verificationStatus === 'verified' ? 'verified' : 'verified');
    setVerifySource(inst.sourceReference?.name || inst.accreditationBody || '');
    setVerifyNotes(inst.verificationNotes || '');
    setVerifyError(null);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingInstId) return;
    if (!verifySource.trim()) {
      setVerifyError('Specify the official source used for this verification decision (e.g., NUC / NBTE / NCCE / Federal Gazette).');
      return;
    }
    setVerifyError(null);
    const res = await verifyInstitution(
      verifyingInstId,
      verifyStatus,
      verifySource.trim(),
      verifyNotes.trim() || undefined
    );
    if (res.ok) {
      setVerifyingInstId(null);
    } else {
      setVerifyError(res.error || 'Verification update failed.');
    }
  };

  const handleLifecycleAction = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setActionErrorBanner(null);
    const res = await fn();
    if (!res.ok && res.error) {
      setActionErrorBanner(res.error);
    }
  };

  const openAdmissionEditor = (inst: Institution) => {
    setEditingAdmissionInstId(inst.id);
    setAdmissionFormData({
      academicSession: inst.admissionInfo?.academicSession || '2025/2026',
      generalCutOffMark: inst.admissionInfo?.generalCutOffMark || 180,
      postUtmeFeeNaira: inst.admissionInfo?.postUtmeFeeNaira ?? 2000,
      applicationDeadline: inst.admissionInfo?.applicationDeadline || '',
      directEntryInfo: inst.admissionInfo?.directEntryInfo || '',
      guidelines: inst.admissionInfo?.guidelines || '',
    });
    setAdmissionErrors({});
  };

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmissionInstId) return;
    const errs: Record<string, string> = {};
    if (admissionFormData.generalCutOffMark < 100 || admissionFormData.generalCutOffMark > 400) {
      errs.generalCutOffMark = 'UTME cut-off mark must be between 100 and 400.';
    }
    if (!admissionFormData.guidelines.trim()) {
      errs.guidelines = 'Screening and CAPS admission guidelines are required.';
    }
    if (Object.keys(errs).length > 0) {
      setAdmissionErrors(errs);
      return;
    }

    const existing = institutions.find((i) => i.id === editingAdmissionInstId);
    const res = await updateInstitution(
      editingAdmissionInstId,
      {
        admissionInfo: {
          ...existing?.admissionInfo,
          academicSession: admissionFormData.academicSession.trim() || '2025/2026',
          generalCutOffMark: Number(admissionFormData.generalCutOffMark),
          postUtmeFeeNaira: Number(admissionFormData.postUtmeFeeNaira),
          applicationDeadline: admissionFormData.applicationDeadline.trim() || undefined,
          directEntryInfo: admissionFormData.directEntryInfo.trim() || undefined,
          guidelines: admissionFormData.guidelines.trim(),
        },
      },
      `Updated JAMB/admission rules for ${existing?.name || editingAdmissionInstId}`
    );
    if (res.ok) {
      setEditingAdmissionInstId(null);
    }
  };

  const handleCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveAcademicInstId) return;
    const errs: Record<string, string> = {};
    if (!courseFormData.facultyName.trim()) errs.facultyName = 'Faculty / School name is required.';
    if (!courseFormData.departmentName.trim()) errs.departmentName = 'Department name is required.';
    if (!courseFormData.courseName.trim()) errs.courseName = 'Course / Programme title is required.';
    if (Object.keys(errs).length > 0) {
      setCourseErrors(errs);
      return;
    }

    addCourseToInstitution(
      effectiveAcademicInstId,
      courseFormData.facultyName,
      courseFormData.departmentName,
      {
        name: courseFormData.courseName.trim(),
        degreeType: courseFormData.degreeType.trim(),
        durationYears: Number(courseFormData.durationYears),
        accreditationStatus: courseFormData.accreditationStatus.trim(),
        cutOffMark: Number(courseFormData.cutOffMark),
        oLevelRequirements: courseFormData.oLevelRequirements.trim(),
      }
    );

    setCourseFormData((prev) => ({
      ...prev,
      courseName: '',
    }));
    setCourseErrors({});
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newsFormData.title.trim()) errs.title = 'Headline is required';
    if (!newsFormData.summary.trim()) errs.summary = 'Summary is required';
    if (!newsFormData.content.trim()) errs.content = 'Full report content is required';
    if (Object.keys(errs).length > 0) {
      setNewsFormErrors(errs);
      return;
    }

    addNewsArticle({
      title: newsFormData.title.trim(),
      category: newsFormData.category,
      summary: newsFormData.summary.trim(),
      content: newsFormData.content.trim(),
      institutionId: isInstitutionAdmin ? currentUser.institutionId : undefined,
      institutionName:
        isInstitutionAdmin && assignedInstitution
          ? assignedInstitution.name
          : newsFormData.institutionName.trim() || undefined,
      readTime: newsFormData.readTime,
      isPublished: true,
      imageUrl: '/src/assets/images/campus_faculty_building_1794428718479.jpg',
    });

    setIsNewsModalOpen(false);
    setNewsFormData({
      title: '',
      category: 'Admissions',
      summary: '',
      content: '',
      institutionName: assignedInstitution?.name || '',
      readTime: '3 min read',
    });
    setNewsFormErrors({});
  };

  const handleSchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!schFormData.title.trim()) errs.title = 'Scholarship title is required';
    if (!schFormData.providerName.trim()) errs.providerName = 'Provider name is required';
    if (!schFormData.applicationUrl.trim()) errs.applicationUrl = 'Application portal URL is required';
    if (Object.keys(errs).length > 0) {
      setSchFormErrors(errs);
      return;
    }

    addScholarship({
      title: schFormData.title.trim(),
      providerName: schFormData.providerName.trim(),
      providerType: schFormData.providerType,
      coverage: schFormData.coverage.trim(),
      deadline: schFormData.deadline,
      applicationUrl: schFormData.applicationUrl.trim(),
      educationLevels: ['Undergraduate (100L - 400L)', 'Postgraduate'],
      eligibilityCriteria: schFormData.eligibilityText.split(',').map((s) => s.trim()).filter(Boolean),
      isVerified: true,
    });

    setIsSchModalOpen(false);
    setSchFormData({
      title: '',
      providerName: '',
      providerType: 'Federal Government',
      coverage: 'Full Tuition & Monthly Stipend',
      deadline: '2026-06-30',
      applicationUrl: 'https://',
      eligibilityText: 'Minimum 5 credits in SSCE WAEC/NECO at one sitting, Enrolled undergraduate',
    });
    setSchFormErrors({});
  };

  if (!isAuthorizedAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              Access Denied: Administrative Clearance Required
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are currently browsing as <strong>{currentUser.fullName}</strong> ({currentUser.role.replace('_', ' ')}).
              Access to this registry management dashboard requires verified{' '}
              <strong>Super Administrator</strong>, <strong>Institution Administrator</strong>, or{' '}
              <strong>Editorial Staff</strong> clearance.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-400" />
              <span>Sign In as Administrator</span>
            </button>
            {!isLiveSupabase && (
              <button
                onClick={() => switchRole('super_admin')}
                className="w-full sm:w-auto px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                Demo: Super Admin Persona
              </button>
            )}
            <button
              onClick={() => setCurrentTab('schools')}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Return to Public Registry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inspectingInst = inspectingInstId
    ? institutions.find((i) => i.id === inspectingInstId) || null
    : null;
  const verifyingInst = verifyingInstId
    ? institutions.find((i) => i.id === verifyingInstId) || null
    : null;

  const activeCount = scopedInstitutions.filter((i) => !i.isArchived && i.publicationStatus !== 'archived').length;
  const publishedCount = scopedInstitutions.filter((i) => !i.isArchived && i.publicationStatus === 'published').length;
  const pendingCount = scopedInstitutions.filter(
    (i) => !i.isArchived && (i.verificationStatus === 'draft' || i.verificationStatus === 'pending_verification')
  ).length;
  const verifiedUnpublishedCount = scopedInstitutions.filter(
    (i) => !i.isArchived && i.verificationStatus === 'verified' && i.publicationStatus === 'unpublished'
  ).length;
  const incompleteCount = scopedInstitutions.filter(
    (i) => !i.isArchived && !getInstitutionCompleteness(i).isComplete
  ).length;
  const archivedCount = scopedInstitutions.filter(
    (i) => Boolean(i.isArchived || i.publicationStatus === 'archived')
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Admin Header Bar */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400">
              <Shield className="w-4 h-4" />
              <span>EduSphere Nigeria Central Administration</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isInstitutionAdmin && assignedInstitution
                ? `${assignedInstitution.name} — Institutional Portal`
                : isEditor
                  ? 'Editorial & Data Integrity Desk'
                  : 'Institution Registry & Lifecycle Governance'}
            </h1>
            <p className="text-xs text-slate-300">
              Signed in as <strong className="text-white">{currentUser.fullName}</strong> · Role:{' '}
              <span className="capitalize text-teal-300">{currentUser.role.replace('_', ' ')}</span>
              {isInstitutionAdmin && assignedInstitution && (
                <> · Scope: <span className="text-amber-300">{assignedInstitution.acronym || assignedInstitution.name} Only</span></>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isLiveSupabase && (
              <button
                onClick={() => refreshInstitutions()}
                disabled={isLoadingInstitutions}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingInstitutions ? 'animate-spin' : ''}`} />
                <span>Sync PostgreSQL</span>
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Institution</span>
              </button>
            )}
          </div>
        </div>

        {/* Honest Database Configuration / Connection Status Banner */}
        {!isLiveSupabase && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
            <Database className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">
                Local Preview Mode Active — Supabase PostgreSQL Credentials Not Configured
              </div>
              <p className="text-amber-900 leading-relaxed">
                Changes currently persist only in browser preview storage (<code className="font-mono bg-amber-100 px-1 rounded">localStorage</code>) and are not written to a remote PostgreSQL database. To enable real PostgreSQL persistence and Row Level Security, set{' '}
                <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
                <code className="font-mono bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in{' '}
                <code className="font-mono bg-amber-100 px-1 rounded">.env</code> and execute{' '}
                <code className="font-mono bg-amber-100 px-1 rounded">/supabase_schema.sql</code> in your Supabase SQL Editor.
              </p>
            </div>
          </div>
        )}

        {isLiveSupabase && dbError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-900 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">PostgreSQL Sync Error</strong>
                <span>{dbError}</span>
              </div>
            </div>
            <button
              onClick={() => refreshInstitutions()}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md font-semibold shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex items-center gap-1 shadow-sm overflow-x-auto">
          {permittedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                effectiveTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {effectiveTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Publicly Published</span>
                <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">{publishedCount}</div>
                <div className="text-[11px] text-slate-500">Live in Explore Schools ({publicInstitutions.length} national)</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Draft / Pending Review</span>
                <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">{pendingCount}</div>
                <div className="text-[11px] text-slate-500">Awaiting source verification</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Verified (Unpublished)</span>
                <div className="text-2xl font-bold text-teal-800 font-mono tabular-nums">{verifiedUnpublishedCount}</div>
                <div className="text-[11px] text-slate-500">Ready for public release</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Incomplete Records</span>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{incompleteCount}</div>
                <div className="text-[11px] text-slate-500">Missing optional/recommended fields</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-medium">Archived Records</span>
                <div className="text-2xl font-bold text-slate-500 font-mono tabular-nums">{archivedCount}</div>
                <div className="text-[11px] text-slate-500">Retained safely out of public view</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Supabase PostgreSQL Registry & Governance Architecture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Defined in <code className="text-teal-800 bg-slate-100 px-1 py-0.5 rounded font-mono">/supabase_schema.sql</code> with normalized tables for institutions, faculties, departments, courses, admission requirements, campus facilities, reviews, verification records, and immutable audit logs. Database triggers and RLS prevent unauthorized verification or publication of unverified records.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Connection Status:</span>
                  <span className={`font-medium ${isLiveSupabase ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isLiveSupabase ? 'Connected to Remote Supabase PostgreSQL' : 'Local Preview Mode (.env Supabase keys missing)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Public Visibility Rule:</span>
                  <span className="font-mono text-slate-600">publication_status = &apos;published&apos; AND is_archived = false</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800">Lifecycle Enforcement:</span>
                  <span className="text-slate-600">Scoped RBAC + Supabase RLS + Trigger-Verified Publishing</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INSTITUTIONS LIFECYCLE TABLE */}
        {effectiveTab === 'institutions' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
            {isInstitutionAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <strong>Scoped Institutional Access:</strong> As an Institution Administrator, you can update profile details, submit drafts for verification, and manage academics for{' '}
                <strong>{assignedInstitution?.name || 'your assigned institution'}</strong> only. Charter verification approval, public publishing, and archiving require Super Administrator clearance.
              </div>
            )}

            {actionErrorBanner && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{actionErrorBanner}</span>
                </div>
                <button
                  onClick={() => setActionErrorBanner(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Manage Institutions Registry
                </h3>
                <p className="text-xs text-slate-500">
                  {isSuperAdmin
                    ? 'Create, inspect, update, verify, publish, unpublish, or archive registered institutions.'
                    : 'Inspect, update details, and submit updates for verification for your assigned institution.'}
                </p>
              </div>

              {/* Quick Lifecycle Views */}
              <div className="flex flex-wrap items-center gap-1.5">
                {([
                  { id: 'active', label: `All Active (${activeCount})` },
                  { id: 'pending', label: `Pending / Draft (${pendingCount})` },
                  { id: 'verified_unpublished', label: `Verified Unpublished (${verifiedUnpublishedCount})` },
                  { id: 'incomplete', label: `Incomplete (${incompleteCount})` },
                  { id: 'recent', label: 'Recently Updated' },
                  { id: 'archived', label: `Archived (${archivedCount})` },
                ] as { id: QuickViewFilter; label: string }[]).map((qv) => (
                  <button
                    key={qv.id}
                    onClick={() => {
                      setQuickView(qv.id);
                      setInstPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
                      quickView === qv.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {qv.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Multi-Faceted Filters */}
            {isSuperAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-1">
                <input
                  type="text"
                  value={instSearch}
                  onChange={(e) => {
                    setInstSearch(e.target.value);
                    setInstPage(1);
                  }}
                  placeholder="Search name, former name, acronym, state..."
                  className="lg:col-span-2 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <select
                  value={instCategoryFilter}
                  onChange={(e) => {
                    setInstCategoryFilter(e.target.value);
                    setInstPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                >
                  <option value="all">All Categories</option>
                  {Object.entries(INSTITUTION_CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
                <select
                  value={instLevelFilter}
                  onChange={(e) => {
                    setInstLevelFilter(e.target.value);
                    setInstPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                >
                  <option value="all">All Education Levels</option>
                  {Object.entries(EDUCATION_LEVEL_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>{label}</option>
                  ))}
                </select>
                <select
                  value={instOwnershipFilter}
                  onChange={(e) => {
                    setInstOwnershipFilter(e.target.value);
                    setInstPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                >
                  <option value="all">All Ownership</option>
                  <option value="Federal">Federal</option>
                  <option value="State">State</option>
                  <option value="Private">Private</option>
                  <option value="Missionary">Missionary</option>
                  <option value="Community">Community</option>
                </select>
                <div className="flex gap-1.5">
                  <select
                    value={instVerificationFilter}
                    onChange={(e) => {
                      setInstVerificationFilter(e.target.value);
                      setInstPage(1);
                    }}
                    className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                  >
                    <option value="all">Verification</option>
                    {Object.entries(VERIFICATION_STATUS_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                  <select
                    value={instPublicationFilter}
                    onChange={(e) => {
                      setInstPublicationFilter(e.target.value);
                      setInstPage(1);
                    }}
                    className="w-1/2 px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-800"
                  >
                    <option value="all">Publication</option>
                    {Object.entries(PUBLICATION_STATUS_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {isLoadingInstitutions ? (
              <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
                <span>Loading institution records from PostgreSQL...</span>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Institution</th>
                      <th className="py-3 px-3">Classification & State</th>
                      <th className="py-3 px-3">Verification</th>
                      <th className="py-3 px-3">Publication</th>
                      <th className="py-3 px-3">Completeness</th>
                      <th className="py-3 px-3">Audit Trail</th>
                      <th className="py-3 px-3 text-right">Lifecycle Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedAdminInstitutions.map((inst) => {
                      const comp = getInstitutionCompleteness(inst);
                      const isArch = Boolean(inst.isArchived || inst.publicationStatus === 'archived');
                      const isPub = inst.publicationStatus === 'published' && !isArch;

                      return (
                        <tr key={inst.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3">
                            <button
                              onClick={() => openInstitutionProfile(inst.id)}
                              className="font-semibold text-slate-900 hover:text-teal-700 text-left block"
                            >
                              {inst.name}
                            </button>
                            <div className="text-[11px] text-slate-500">
                              {inst.acronym || 'No acronym'}
                              {inst.formerNames && inst.formerNames.length > 0
                                ? ` · Formerly: ${inst.formerNames[0]}`
                                : inst.commonName && inst.commonName !== inst.name
                                ? ` · "${inst.commonName}"`
                                : ''}
                            </div>
                            {(inst.isHistorical || inst.operationalStatusNote) && (
                              <div className="text-[10px] text-amber-800 font-medium mt-0.5 line-clamp-1">
                                {inst.isHistorical ? 'Historical / Converted' : 'Advisory Note'}
                                {inst.successorName ? ` → ${inst.successorName}` : ''}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            <div className="font-medium text-slate-800">
                              {INSTITUTION_CATEGORY_LABELS[inst.category] || inst.category}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {inst.ownership} · {inst.city}, {inst.state}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] border ${
                                inst.verificationStatus === 'verified'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : inst.verificationStatus === 'pending_verification'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : inst.verificationStatus === 'rejected' || inst.verificationStatus === 'flagged'
                                  ? 'bg-red-50 text-red-800 border-red-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {VERIFICATION_STATUS_LABELS[inst.verificationStatus] || inst.verificationStatus}
                            </span>
                            {inst.verifiedAt && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {inst.verifiedAt.split('T')[0]}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-semibold text-[11px] border ${
                                isArch
                                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                                  : isPub
                                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {isArch ? 'Archived' : isPub ? 'Published' : 'Unpublished'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-mono font-semibold text-slate-800">
                              {comp.score}/{comp.total}
                            </div>
                            <div className={`text-[10px] ${comp.isComplete ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {comp.isComplete ? 'Complete' : `${comp.missingFields.length} missing`}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            <div className="font-mono">{inst.lastUpdated}</div>
                            <div className="text-slate-400 truncate max-w-[140px]">
                              {inst.updatedByName || inst.createdByName || 'Seed Registry'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="inline-flex flex-wrap items-center justify-end gap-1">
                              <button
                                onClick={() => setInspectingInstId(inst.id)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                                title="Inspect details & verification history"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditModal(inst)}
                                className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded"
                                title="Edit institution"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {!isArch && (inst.verificationStatus === 'draft' || inst.verificationStatus === 'rejected' || inst.verificationStatus === 'unverified') && (
                                <button
                                  disabled={isSavingInstitution}
                                  onClick={() => handleLifecycleAction(() => submitForVerification(inst.id, inst.sourceReference?.name))}
                                  className="px-2 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded inline-flex items-center gap-1 disabled:opacity-50"
                                  title="Submit for Verification"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Submit</span>
                                </button>
                              )}

                              {isSuperAdmin && !isArch && (
                                <button
                                  disabled={isSavingInstitution}
                                  onClick={() => openVerificationModal(inst)}
                                  className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded inline-flex items-center gap-1 disabled:opacity-50"
                                  title="Review & Verify Institution"
                                >
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>Verify</span>
                                </button>
                              )}

                              {isSuperAdmin && !isArch && (
                                isPub ? (
                                  <button
                                    disabled={isSavingInstitution}
                                    onClick={() => handleLifecycleAction(() => unpublishInstitution(inst.id))}
                                    className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 rounded inline-flex items-center gap-1 disabled:opacity-50"
                                    title="Unpublish from public directory"
                                  >
                                    <EyeOff className="w-3 h-3" />
                                    <span>Unpublish</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled={isSavingInstitution}
                                    onClick={() => handleLifecycleAction(() => publishInstitution(inst.id))}
                                    className="px-2 py-1 text-[11px] font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded inline-flex items-center gap-1 disabled:opacity-50"
                                    title="Publish to public directory (requires Verified status)"
                                  >
                                    <Globe className="w-3 h-3" />
                                    <span>Publish</span>
                                  </button>
                                )
                              )}

                              {isSuperAdmin && (
                                isArch ? (
                                  <button
                                    disabled={isSavingInstitution}
                                    onClick={() => handleLifecycleAction(() => restoreInstitution(inst.id))}
                                    className="px-2 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded inline-flex items-center gap-1 disabled:opacity-50"
                                    title="Restore from archive"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Restore</span>
                                  </button>
                                ) : (
                                  <button
                                    disabled={isSavingInstitution}
                                    onClick={() => {
                                      if (window.confirm(`Archive "${inst.name}"? It will be removed from public visibility and preserved in governance history.`)) {
                                        handleLifecycleAction(() => archiveInstitution(inst.id));
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded disabled:opacity-50"
                                    title="Archive institution"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {adminInstitutions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No institutions match your current filter or lifecycle view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!isLoadingInstitutions && adminInstitutions.length > adminPageSize && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div>
                  Showing{' '}
                  <strong className="font-mono text-slate-900">
                    {(safeInstPage - 1) * adminPageSize + 1}–{Math.min(safeInstPage * adminPageSize, adminInstitutions.length)}
                  </strong>{' '}
                  of <strong className="font-mono text-slate-900">{adminInstitutions.length}</strong> records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={safeInstPage === 1}
                    onClick={() => setInstPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 font-medium"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-[11px]">
                    Page {safeInstPage} / {instTotalPages}
                  </span>
                  <button
                    disabled={safeInstPage === instTotalPages}
                    onClick={() => setInstPage((p) => Math.min(instTotalPages, p + 1))}
                    className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FACULTIES, DEPARTMENTS & COURSES MANAGER */}
        {effectiveTab === 'academics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Structured Curriculum Tree */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-700" />
                    <span>Faculties, Departments & Programmes</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Structured academic hierarchy linked directly to the institution profile.
                  </p>
                </div>

                <select
                  value={effectiveAcademicInstId}
                  onChange={(e) => setSelectedAcademicInstId(e.target.value)}
                  disabled={isInstitutionAdmin}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium max-w-xs"
                >
                  {scopedInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.acronym ? `${inst.acronym} — ${inst.name}` : inst.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAcademicInst?.faculties && selectedAcademicInst.faculties.length > 0 ? (
                <div className="space-y-4">
                  {selectedAcademicInst.faculties.map((fac) => (
                    <div key={fac.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                        <strong className="text-xs font-bold text-slate-900">{fac.name}</strong>
                        <span className="text-[11px] text-slate-500">{fac.departments.length} Dept(s)</span>
                      </div>
                      <div className="p-3 space-y-3">
                        {fac.departments.map((dept) => (
                          <div key={dept.id} className="space-y-1.5">
                            <div className="text-xs font-semibold text-teal-800">{dept.name}</div>
                            <div className="divide-y divide-slate-100 border border-slate-100 rounded">
                              {dept.courses.map((course) => (
                                <div key={course.id} className="px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <span className="font-semibold text-slate-900">
                                      {course.degreeType} {course.name}
                                    </span>
                                    <span className="text-slate-500 block text-[11px]">
                                      {course.accreditationStatus} · {course.durationYears} yrs
                                    </span>
                                  </div>
                                  {course.cutOffMark !== undefined && (
                                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                      Cut-Off: {course.cutOffMark}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-300 rounded-lg text-xs text-slate-500">
                  No structured faculties or accredited courses catalogued yet for{' '}
                  <strong>{selectedAcademicInst?.name || 'this institution'}</strong>. Use the form on the right to add the first programme record.
                </div>
              )}
            </div>

            {/* Right: Add Structured Course Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Accredited Programme</h3>
                <p className="text-xs text-slate-500">
                  Creates or attaches to matching Faculty and Department records and persists immediately.
                </p>
              </div>

              <form onSubmit={handleCourseSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty / College Name *</label>
                  <input
                    type="text"
                    value={courseFormData.facultyName}
                    onChange={(e) => setCourseFormData({ ...courseFormData, facultyName: e.target.value })}
                    placeholder="e.g. Faculty of Science"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                  {courseErrors.facultyName && <p className="text-red-600 text-[11px] mt-0.5">{courseErrors.facultyName}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={courseFormData.departmentName}
                    onChange={(e) => setCourseFormData({ ...courseFormData, departmentName: e.target.value })}
                    placeholder="e.g. Department of Computer Science"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                  {courseErrors.departmentName && <p className="text-red-600 text-[11px] mt-0.5">{courseErrors.departmentName}</p>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                    <input
                      type="text"
                      value={courseFormData.courseName}
                      onChange={(e) => setCourseFormData({ ...courseFormData, courseName: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                    {courseErrors.courseName && <p className="text-red-600 text-[11px] mt-0.5">{courseErrors.courseName}</p>}
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Degree</label>
                    <input
                      type="text"
                      value={courseFormData.degreeType}
                      onChange={(e) => setCourseFormData({ ...courseFormData, degreeType: e.target.value })}
                      placeholder="B.Sc."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={courseFormData.durationYears}
                      onChange={(e) => setCourseFormData({ ...courseFormData, durationYears: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">UTME Cut-Off</label>
                    <input
                      type="number"
                      min={100}
                      max={400}
                      value={courseFormData.cutOffMark}
                      onChange={(e) => setCourseFormData({ ...courseFormData, cutOffMark: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accreditation Status</label>
                  <input
                    type="text"
                    value={courseFormData.accreditationStatus}
                    onChange={(e) => setCourseFormData({ ...courseFormData, accreditationStatus: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">O&apos;Level Requirement</label>
                  <textarea
                    rows={2}
                    value={courseFormData.oLevelRequirements}
                    onChange={(e) => setCourseFormData({ ...courseFormData, oLevelRequirements: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Save Programme to Institution
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: ADMISSION CUT-OFFS (EDITABLE) */}
        {effectiveTab === 'admissions' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Central Admissions Processing System (CAPS) Benchmarks
              </h3>
              <p className="text-xs text-slate-600">
                Inspect and update official UTME cut-off marks, Post-UTME screening fees, deadlines, and Direct Entry rules.
              </p>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Institution</th>
                    <th className="py-2.5 px-3">Session</th>
                    <th className="py-2.5 px-3">General Cut-Off</th>
                    <th className="py-2.5 px-3">Post-UTME Fee</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedAdmissionsInstitutions.map((i) => (
                    <tr key={i.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{i.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{i.admissionInfo?.academicSession || 'Not set'}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-teal-800">
                        {i.admissionInfo ? `${i.admissionInfo.generalCutOffMark}` : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {i.admissionInfo?.postUtmeFeeNaira !== undefined
                          ? `₦${i.admissionInfo.postUtmeFeeNaira.toLocaleString()}`
                          : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {i.admissionInfo?.applicationDeadline || 'TBA'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openAdmissionEditor(i)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded text-[11px] font-semibold"
                        >
                          Edit Cut-off
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {scopedInstitutions.length > adminPageSize && (
              <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
                <span>
                  Showing {(safeAdmissionsPage - 1) * adminPageSize + 1}–{Math.min(safeAdmissionsPage * adminPageSize, scopedInstitutions.length)} of {scopedInstitutions.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={safeAdmissionsPage === 1}
                    onClick={() => setAdmissionsPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 font-medium"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-[11px]">
                    Page {safeAdmissionsPage} / {admissionsTotalPages}
                  </span>
                  <button
                    disabled={safeAdmissionsPage === admissionsTotalPages}
                    onClick={() => setAdmissionsPage((p) => Math.min(admissionsTotalPages, p + 1))}
                    className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NEWS MANAGEMENT */}
        {effectiveTab === 'news' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Education News & Circulars
                </h3>
                <p className="text-xs text-slate-500">
                  Manage official regulatory press releases, admissions announcements, and editorial articles.
                </p>
              </div>
              <button
                onClick={() => {
                  setNewsFormData((prev) => ({
                    ...prev,
                    institutionName: assignedInstitution?.name || prev.institutionName,
                  }));
                  setIsNewsModalOpen(true);
                }}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Circular / News</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {news.map((item) => (
                <div key={item.id} className="p-3.5 text-xs flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-semibold text-teal-800">{item.category}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-slate-600">{item.summary}</p>
                    <span className="text-slate-400 font-mono text-[11px]">
                      Published: {item.publishedAt.split('T')[0]} · {item.readTime}
                      {item.institutionName ? ` · ${item.institutionName}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-emerald-700 font-medium whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      Live
                    </span>
                    {(isSuperAdmin || isEditor) && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove bulletin "${item.title}"?`)) {
                            deleteNewsArticle(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                        title="Delete bulletin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SCHOLARSHIPS MANAGEMENT */}
        {effectiveTab === 'scholarships' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Verified Scholarships & Bursary Opportunities
                </h3>
                <p className="text-xs text-slate-500">
                  Manage verified funding programs, bursaries, and educational grants for Nigerian students.
                </p>
              </div>
              <button
                onClick={() => setIsSchModalOpen(true)}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Opportunity</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {scholarships.map((sch) => (
                <div key={sch.id} className="p-3.5 text-xs flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <strong className="text-slate-900 text-sm">{sch.title}</strong>
                      <span className="font-mono text-amber-700">Deadline: {sch.deadline}</span>
                    </div>
                    <div className="text-slate-600">{sch.providerName} · {sch.coverage}</div>
                    <div className="text-slate-400 text-[11px]">Portal: {sch.applicationUrl}</div>
                  </div>
                  {isSuperAdmin && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove scholarship "${sch.title}"?`)) {
                          deleteScholarship(sch.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded shrink-0"
                      title="Remove scholarship"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: DATA ACCURACY REPORTS QUEUE */}
        {effectiveTab === 'reports' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-600" />
                <span>Data Accuracy & Correction Reports</span>
              </h3>
              <p className="text-xs text-slate-500">
                Review public flags on institution cut-offs, accreditation status, fees, or portal URLs before publishing updates.
              </p>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
              {dataReports.map((rep) => (
                <div key={rep.id} className="p-4 text-xs space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{rep.institutionName}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {rep.category}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                        rep.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rep.status === 'dismissed'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{rep.details}</p>

                  {rep.suggestedCorrection && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-600">
                      <strong>Suggested Source / Correction:</strong> {rep.suggestedCorrection}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 font-mono">
                    Reported by {rep.reportedByName} ({rep.reportedByEmail}) · {rep.timestamp}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={reportNotes[rep.id] ?? rep.adminNotes ?? ''}
                      onChange={(e) => setReportNotes((prev) => ({ ...prev, [rep.id]: e.target.value }))}
                      placeholder="Verification notes (optional)..."
                      className="flex-1 min-w-[200px] px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800"
                    />
                    {(['investigating', 'resolved', 'dismissed'] as DataReport['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => resolveDataReport(rep.id, st, reportNotes[rep.id] ?? rep.adminNotes)}
                        className={`px-2.5 py-1.5 rounded text-[11px] font-semibold capitalize border transition-colors ${
                          rep.status === st
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Mark {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {dataReports.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No data accuracy reports in the queue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: USERS & RBAC (SUPER ADMIN ONLY) */}
        {effectiveTab === 'users' && isSuperAdmin && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                User Accounts & Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-slate-600">
                Manage user permissions and assign institutional governance roles. Changes take effect immediately.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Email Address</th>
                    <th className="py-2.5 px-3">Assigned Role</th>
                    <th className="py-2.5 px-3">Affiliation / Scope</th>
                    <th className="py-2.5 px-3 text-right">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {user.fullName}
                        {user.id === currentUser.id && (
                          <span className="ml-1.5 text-[10px] text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded">You</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{user.email}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold capitalize text-slate-900">{user.role.replace('_', ' ')}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {user.institutionId ? institutions.find((i) => i.id === user.institutionId)?.acronym || user.institutionId : 'Global'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="institution_admin">Institution Admin</option>
                          <option value="editor">Editor</option>
                          <option value="contributor">Contributor</option>
                          <option value="lecturer">Lecturer</option>
                          <option value="student">Student</option>
                          <option value="parent">Parent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Permission Scopes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { role: 'super_admin', title: 'Super Administrator', desc: 'Full authority to create, edit, verify, delete institutions and audit the platform.' },
                  { role: 'institution_admin', title: 'Institution Admin (Registrar)', desc: 'Authorized to update their assigned school cut-off marks, faculties, and news.' },
                  { role: 'editor', title: 'Editorial Staff', desc: 'Can curate education news, scholarships, and resolve public data accuracy reports.' },
                  { role: 'student', title: 'Student / Candidate', desc: 'Can save institutions, submit reviews/reports, and view admissions cut-offs.' },
                ].map((r) => (
                  <div key={r.role} className="border border-slate-200 rounded-lg p-3 space-y-0.5">
                    <strong className="text-slate-900 text-xs block">{r.title}</strong>
                    <p className="text-slate-500 text-[11px]">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: AUDIT LOGS (SUPER ADMIN ONLY) */}
        {effectiveTab === 'audit' && isSuperAdmin && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                System Audit Logs
              </h3>
              <p className="text-xs text-slate-500">
                Immutable record of institutional modifications, verification status updates, and deletions.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Entity</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-2.5 px-3 text-slate-800">
                        {log.actorName ? `${log.actorName} (${log.actorEmail})` : log.actorEmail}{' '}
                        <span className="text-slate-400">[{log.actorRole}]</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-teal-800">{log.action}</td>
                      <td className="py-2.5 px-3 text-slate-700">{log.entityType} ({log.entityId})</td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 6-SECTION INSTITUTION ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 space-y-5 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingInstId ? 'Edit Institution Registry Record' : 'Register New Educational Institution'}
                </h3>
                <p className="text-xs text-slate-500">
                  New institutions are created as Draft or Pending Verification and remain unpublished until verified by a Super Administrator.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSubmitError && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{formSubmitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  1. Basic Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Institution Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Obafemi Awolowo University"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                    {formErrors.name && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Common Name (Optional)</label>
                    <input
                      type="text"
                      value={formData.commonName}
                      onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
                      placeholder="e.g. Great Ife"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Abbreviation / Acronym</label>
                    <input
                      type="text"
                      value={formData.acronym}
                      onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                      placeholder="e.g. OAU"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Year Established *</label>
                    <input
                      type="number"
                      value={formData.establishmentYear}
                      onChange={(e) => setFormData({ ...formData, establishmentYear: Number(e.target.value) })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                    {formErrors.establishmentYear && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.establishmentYear}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Institution Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Factual institutional overview, mandate, founding charter, and flagship colleges..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                  {formErrors.description && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.description}</p>}
                </div>
              </div>

              {/* SECTION 2: INSTITUTION CLASSIFICATION */}
              <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  2. Institution Classification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Institution Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as InstitutionCategory })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    >
                      {Object.entries(INSTITUTION_CATEGORY_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Education Level *</label>
                    <select
                      value={formData.level}
                      onChange={(e) => {
                        const lvl = e.target.value as InstitutionLevel;
                        setFormData({
                          ...formData,
                          level: lvl,
                          category: inferCategoryFromLevel(lvl),
                        });
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    >
                      {Object.entries(EDUCATION_LEVEL_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Ownership *</label>
                    <select
                      value={formData.ownership}
                      onChange={(e) => setFormData({ ...formData, ownership: e.target.value as OwnershipType })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    >
                      <option value="Federal">Federal</option>
                      <option value="State">State</option>
                      <option value="Private">Private</option>
                      <option value="Missionary">Missionary</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: LOCATION */}
              <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  3. Location
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">State / FCT *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    >
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s.code} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                    {formErrors.state && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Local Government Area (LGA) *</label>
                    <input
                      type="text"
                      list="lga-suggestions"
                      value={formData.lga}
                      onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                      placeholder="Select or type LGA"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                    <datalist id="lga-suggestions">
                      {selectedStateLgas.map((lga) => (
                        <option key={lga} value={lga} />
                      ))}
                    </datalist>
                    {formErrors.lga && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.lga}</p>}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">City / Town *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Ile-Ife"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                    {formErrors.city && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.city}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Physical Campus Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. University Road, Akoka, Yaba, Lagos"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                  {formErrors.address && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.address}</p>}
                </div>
              </div>

              {/* SECTION 4: CONTACT INFORMATION */}
              <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  4. Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Website</label>
                    <input
                      type="url"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      placeholder="https://institution.edu.ng"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                    {formErrors.websiteUrl && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.websiteUrl}</p>}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="admissions@institution.edu.ng"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                    {formErrors.email && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Telephone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 ..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: ACCREDITATION AND VERIFICATION */}
              <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  5. Accreditation and Verification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Accreditation Body</label>
                    <input
                      type="text"
                      value={formData.accreditationBody}
                      onChange={(e) => setFormData({ ...formData, accreditationBody: e.target.value })}
                      placeholder="NUC / NBTE / NCCE / State MoE"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Accreditation Status</label>
                    <input
                      type="text"
                      value={formData.accreditationStatus}
                      onChange={(e) => setFormData({ ...formData, accreditationStatus: e.target.value })}
                      placeholder="e.g. Full Institutional Charter"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Charter / Accreditation Ref</label>
                    <input
                      type="text"
                      value={formData.accreditationReference}
                      onChange={(e) => setFormData({ ...formData, accreditationReference: e.target.value })}
                      placeholder="e.g. NUC/GOV/1962/04"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      {editingInstId ? 'Current Verification State' : 'Initial Workflow Status'}
                    </label>
                    {editingInstId ? (
                      <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium">
                        {VERIFICATION_STATUS_LABELS[formData.verificationStatus] || formData.verificationStatus}
                      </div>
                    ) : (
                      <select
                        value={formData.verificationStatus}
                        onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as VerificationStatus })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value="draft">Draft (Internal Only)</option>
                        <option value="pending_verification">Pending Verification</option>
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Source Reference</label>
                    <input
                      type="text"
                      value={formData.sourceName}
                      onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                      placeholder="e.g. NUC Approved Universities List"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Official Source URL</label>
                    <input
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://nuc.edu.ng/..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                    {formErrors.sourceUrl && <p className="text-red-600 text-[11px] mt-0.5">{formErrors.sourceUrl}</p>}
                  </div>
                </div>
              </div>

              {/* SECTION 6: MEDIA AND BRANDING */}
              <div className="space-y-3 border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                  6. Media, Branding & Leadership
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Institution Logo URL</label>
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      placeholder="https://.../logo.png"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Campus Cover Image URL</label>
                    <input
                      type="url"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      placeholder="https://.../campus.jpg"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
                {(formData.logoUrl || formData.coverImageUrl) && (
                  <div className="flex items-center gap-4 pt-1">
                    {formData.logoUrl && (
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="w-12 h-12 rounded-lg object-contain border border-slate-300 bg-white p-1"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {formData.coverImageUrl && (
                      <img
                        src={formData.coverImageUrl}
                        alt="Cover preview"
                        className="h-12 w-28 rounded-lg object-cover border border-slate-300"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Motto</label>
                    <input
                      type="text"
                      value={formData.motto}
                      onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                      placeholder="e.g. For Learning and Culture"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Principal / VC / Rector</label>
                    <input
                      type="text"
                      value={formData.chancellorOrPrincipal}
                      onChange={(e) => setFormData({ ...formData, chancellorOrPrincipal: e.target.value })}
                      placeholder="e.g. Prof. A. B. Bamgbose"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">School Fees Estimate</label>
                    <input
                      type="text"
                      value={formData.schoolFees}
                      onChange={(e) => setFormData({ ...formData, schoolFees: e.target.value })}
                      placeholder="Leave empty if unverified"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSavingInstitution}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingInstitution}
                  className="px-5 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 font-semibold shadow-sm inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSavingInstitution && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingInstId ? 'Save Changes' : 'Create Draft Institution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS INSPECTOR MODAL */}
      {inspectingInst && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3 gap-4">
              <div>
                <div className="text-[11px] font-mono text-slate-500">ID: {inspectingInst.id} · Slug: {inspectingInst.slug}</div>
                <h3 className="text-lg font-bold text-slate-900">{inspectingInst.name}</h3>
                <p className="text-xs text-slate-500">
                  {INSTITUTION_CATEGORY_LABELS[inspectingInst.category]} · {EDUCATION_LEVEL_LABELS[inspectingInst.level]} · {inspectingInst.ownership}
                </p>
              </div>
              <button onClick={() => setInspectingInstId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const comp = getInstitutionCompleteness(inspectingInst);
              return (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div>
                      <span className="text-slate-500 block">Verification Status</span>
                      <strong className="text-slate-900">
                        {VERIFICATION_STATUS_LABELS[inspectingInst.verificationStatus] || inspectingInst.verificationStatus}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Publication Status</span>
                      <strong className="text-slate-900">
                        {PUBLICATION_STATUS_LABELS[inspectingInst.publicationStatus] || inspectingInst.publicationStatus}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Completeness</span>
                      <strong className="text-slate-900 font-mono">{comp.score}/{comp.total} checks</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Created By</span>
                      <strong className="text-slate-900">{inspectingInst.createdByName || 'Seed Registry'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Last Updated By</span>
                      <strong className="text-slate-900">{inspectingInst.updatedByName || 'Seed Registry'} ({inspectingInst.lastUpdated})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Verified By</span>
                      <strong className="text-slate-900">
                        {inspectingInst.verifiedByName || 'Not yet verified'}
                        {inspectingInst.verifiedAt ? ` (${inspectingInst.verifiedAt.split('T')[0]})` : ''}
                      </strong>
                    </div>
                  </div>

                  {!comp.isComplete && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <strong className="text-amber-900 block mb-1">Missing Recommended Fields:</strong>
                      <div className="text-amber-800">{comp.missingFields.join(' · ')}</div>
                    </div>
                  )}

                  {(inspectingInst.formerNames?.length || inspectingInst.isHistorical || inspectingInst.successorName || inspectingInst.operationalStatusNote) && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                      <strong className="text-slate-800 block">Lineage & Regulatory Status Notes</strong>
                      {inspectingInst.formerNames && inspectingInst.formerNames.length > 0 && (
                        <div className="text-slate-600">
                          <strong>Former Name(s):</strong> {inspectingInst.formerNames.join('; ')}
                        </div>
                      )}
                      {inspectingInst.isHistorical && (
                        <div className="text-amber-800 font-medium">
                          Historical / Converted Institution Record
                          {inspectingInst.successorName ? ` → Successor: ${inspectingInst.successorName}` : ''}
                        </div>
                      )}
                      {inspectingInst.operationalStatusNote && (
                        <div className="text-slate-700">{inspectingInst.operationalStatusNote}</div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <strong className="text-slate-800 block">Location & Contact</strong>
                    <div className="text-slate-600">
                      Address: {inspectingInst.address || 'Not provided'} ({inspectingInst.city}, {inspectingInst.lga || 'N/A'}, {inspectingInst.state})
                    </div>
                    <div className="text-slate-600">
                      Email: {inspectingInst.email || 'Not provided'} · Tel: {inspectingInst.phone || 'Not provided'} · Web: {inspectingInst.websiteUrl || 'Not provided'}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <strong className="text-slate-800 block">Verification History</strong>
                    {inspectingInst.verificationHistory && inspectingInst.verificationHistory.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {inspectingInst.verificationHistory.map((vr) => (
                          <div key={vr.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                            <div className="flex justify-between font-semibold text-slate-800">
                              <span>Status: {VERIFICATION_STATUS_LABELS[vr.status] || vr.status} — {vr.reviewerName}</span>
                              <span className="font-mono text-slate-500">{vr.timestamp}</span>
                            </div>
                            <div className="text-slate-600 mt-0.5">Source: {vr.sourceUsed}</div>
                            {vr.notes && <div className="text-slate-500 mt-0.5">Notes: {vr.notes}</div>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No verification review entries recorded yet.</p>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setInspectingInstId(null);
                        openInstitutionProfile(inspectingInst.id);
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-semibold"
                    >
                      Open Profile Preview
                    </button>
                    <button
                      onClick={() => {
                        setInspectingInstId(null);
                        openEditModal(inspectingInst);
                      }}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold"
                    >
                      Edit Record
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* VERIFICATION REVIEW MODAL (SUPER ADMIN) */}
      {verifyingInst && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verify Institution Record</h3>
                <p className="text-xs text-slate-500">{verifyingInst.name}</p>
              </div>
              <button onClick={() => setVerifyingInstId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {verifyError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {verifyError}
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Verification Decision *</label>
                <select
                  value={verifyStatus}
                  onChange={(e) => setVerifyStatus(e.target.value as VerificationStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="verified">Verified (Meets Statutory Charter)</option>
                  <option value="pending_verification">Keep Pending Verification</option>
                  <option value="rejected">Rejected (Fails Verification / Unpublish)</option>
                  <option value="flagged">Flagged for Investigation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Source Used for Verification *</label>
                <input
                  type="text"
                  value={verifySource}
                  onChange={(e) => setVerifySource(e.target.value)}
                  placeholder="e.g. NUC Approved Universities Registry / Federal Ministry Gazette"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Verification Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Document charter details, date checked, or discrepancies found..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setVerifyingInstId(null)}
                  disabled={isSavingInstitution}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingInstitution}
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold shadow-sm inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSavingInstitution && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Commit Verification Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMISSION CUT-OFF EDITOR MODAL */}
      {editingAdmissionInstId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Admission & JAMB Cut-Off Rules
                </h3>
                <p className="text-xs text-slate-500">
                  {institutions.find((i) => i.id === editingAdmissionInstId)?.name}
                </p>
              </div>
              <button onClick={() => setEditingAdmissionInstId(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmissionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={admissionFormData.academicSession}
                    onChange={(e) => setAdmissionFormData({ ...admissionFormData, academicSession: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">UTME Cut-Off *</label>
                  <input
                    type="number"
                    value={admissionFormData.generalCutOffMark}
                    onChange={(e) => setAdmissionFormData({ ...admissionFormData, generalCutOffMark: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                  {admissionErrors.generalCutOffMark && (
                    <p className="text-red-600 text-[11px] mt-0.5">{admissionErrors.generalCutOffMark}</p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Post-UTME Fee (₦)</label>
                  <input
                    type="number"
                    value={admissionFormData.postUtmeFeeNaira}
                    onChange={(e) => setAdmissionFormData({ ...admissionFormData, postUtmeFeeNaira: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Application Deadline (Optional)</label>
                <input
                  type="text"
                  value={admissionFormData.applicationDeadline}
                  onChange={(e) => setAdmissionFormData({ ...admissionFormData, applicationDeadline: e.target.value })}
                  placeholder="e.g. 2026-08-31"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Direct Entry Requirements</label>
                <input
                  type="text"
                  value={admissionFormData.directEntryInfo}
                  onChange={(e) => setAdmissionFormData({ ...admissionFormData, directEntryInfo: e.target.value })}
                  placeholder="e.g. Upper Credit ND/HND or JUPEB/A-Level..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Screening Guidelines *</label>
                <textarea
                  rows={3}
                  value={admissionFormData.guidelines}
                  onChange={(e) => setAdmissionFormData({ ...admissionFormData, guidelines: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
                {admissionErrors.guidelines && (
                  <p className="text-red-600 text-[11px] mt-0.5">{admissionErrors.guidelines}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAdmissionInstId(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold shadow-sm"
                >
                  Save Cut-Off Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEWS ADD MODAL */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Publish Education Circular / News Report
              </h3>
              <button onClick={() => setIsNewsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewsSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Headline / Report Title *</label>
                <input
                  type="text"
                  value={newsFormData.title}
                  onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                  placeholder="e.g. JAMB Directs Tertiary Institutions on Strict Compliance with 2026 CAPS Quotas"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
                {newsFormErrors.title && <p className="text-red-600 text-[11px] mt-0.5">{newsFormErrors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                  <select
                    value={newsFormData.category}
                    onChange={(e) => setNewsFormData({ ...newsFormData, category: e.target.value as NewsArticle['category'] })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Admissions">Admissions</option>
                    <option value="Academic Calendar">Academic Calendar</option>
                    <option value="Research">Research</option>
                    <option value="Policy">Policy</option>
                    <option value="Convocation">Convocation</option>
                    <option value="Scholarships">Scholarships</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Affiliated Institution</label>
                  <input
                    type="text"
                    value={newsFormData.institutionName}
                    disabled={isInstitutionAdmin && Boolean(assignedInstitution)}
                    onChange={(e) => setNewsFormData({ ...newsFormData, institutionName: e.target.value })}
                    placeholder="e.g. University of Lagos"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Executive Summary *</label>
                <textarea
                  value={newsFormData.summary}
                  onChange={(e) => setNewsFormData({ ...newsFormData, summary: e.target.value })}
                  rows={2}
                  placeholder="Short 1-2 sentence lead summary of this bulletin..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
                {newsFormErrors.summary && <p className="text-red-600 text-[11px] mt-0.5">{newsFormErrors.summary}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Report Content *</label>
                <textarea
                  value={newsFormData.content}
                  onChange={(e) => setNewsFormData({ ...newsFormData, content: e.target.value })}
                  rows={4}
                  placeholder="Comprehensive editorial copy or official senate resolution details..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
                {newsFormErrors.content && <p className="text-red-600 text-[11px] mt-0.5">{newsFormErrors.content}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold shadow-sm"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHOLARSHIP ADD MODAL */}
      {isSchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Publish Verified Scholarship Opportunity
              </h3>
              <button onClick={() => setIsSchModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSchSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Scholarship Title *</label>
                <input
                  type="text"
                  value={schFormData.title}
                  onChange={(e) => setSchFormData({ ...schFormData, title: e.target.value })}
                  placeholder="e.g. Chevron Nigeria National University Scholarship Scheme"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
                {schFormErrors.title && <p className="text-red-600 text-[11px] mt-0.5">{schFormErrors.title}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Provider / Sponsor Name *</label>
                  <input
                    type="text"
                    value={schFormData.providerName}
                    onChange={(e) => setSchFormData({ ...schFormData, providerName: e.target.value })}
                    placeholder="e.g. Chevron Nigeria Limited"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                  {schFormErrors.providerName && <p className="text-red-600 text-[11px] mt-0.5">{schFormErrors.providerName}</p>}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Funding Category *</label>
                  <select
                    value={schFormData.providerType}
                    onChange={(e) => setSchFormData({ ...schFormData, providerType: e.target.value as Scholarship['providerType'] })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="Federal Government">Federal Government</option>
                    <option value="Corporate Foundation">Corporate Foundation</option>
                    <option value="State Government">State Government</option>
                    <option value="International Agency">International Agency</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Coverage Scope *</label>
                  <input
                    type="text"
                    value={schFormData.coverage}
                    onChange={(e) => setSchFormData({ ...schFormData, coverage: e.target.value })}
                    placeholder="e.g. ₦250,000 per academic session"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Application Deadline *</label>
                  <input
                    type="date"
                    value={schFormData.deadline}
                    onChange={(e) => setSchFormData({ ...schFormData, deadline: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Application URL *</label>
                <input
                  type="url"
                  value={schFormData.applicationUrl}
                  onChange={(e) => setSchFormData({ ...schFormData, applicationUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
                {schFormErrors.applicationUrl && <p className="text-red-600 text-[11px] mt-0.5">{schFormErrors.applicationUrl}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Eligibility Criteria (Comma-separated) *</label>
                <textarea
                  value={schFormData.eligibilityText}
                  onChange={(e) => setSchFormData({ ...schFormData, eligibilityText: e.target.value })}
                  rows={2}
                  placeholder="e.g. Full-time undergraduate in 200 Level, Minimum CGPA of 3.5/5.0"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSchModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-md font-semibold shadow-sm"
                >
                  Publish Scholarship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
