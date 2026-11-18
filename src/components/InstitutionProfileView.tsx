import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  EDUCATION_LEVEL_LABELS,
  INSTITUTION_CATEGORY_LABELS,
  VERIFICATION_STATUS_LABELS,
  PUBLICATION_STATUS_LABELS,
} from '../data/nigerianStates';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  Star,
  Send,
  Flag,
  X,
  Shield,
} from 'lucide-react';
import { DataReport } from '../types';
import { getRegulatoryAccreditationStatus } from '../services/institutionService';
import { MEDIA_ASSETS, resolveImageUrl } from '../lib/media';

export const InstitutionProfileView: React.FC = () => {
  const {
    selectedInstitutionId,
    setSelectedInstitutionId,
    setCurrentTab,
    institutions,
    news,
    scholarships,
    achievements,
    watchlist,
    toggleWatchlist,
    showToast,
    currentUser,
    addReview,
    submitDataReport
  } = useApp();

  const matchedInstitution = institutions.find(
    (i) => i.id === selectedInstitutionId || i.slug === selectedInstitutionId
  );

  const canPreviewUnpublished = matchedInstitution
    ? currentUser.role === 'super_admin' ||
      (currentUser.role === 'institution_admin' && currentUser.institutionId === matchedInstitution.id)
    : false;

  const isPubliclyVisible = matchedInstitution
    ? matchedInstitution.publicationStatus === 'published' && !matchedInstitution.isArchived
    : false;

  const institution = matchedInstitution && (isPubliclyVisible || canPreviewUnpublished)
    ? matchedInstitution
    : undefined;

  // 14 Required Sections
  const profileSections = [
    { id: 'overview', label: '1. Overview' },
    { id: 'faculties', label: '2. Faculties & Depts' },
    { id: 'courses', label: '3. Courses & Programmes' },
    { id: 'admissions', label: '4. Admission Requirements' },
    { id: 'jamb', label: '5. JAMB Info & Cut-offs' },
    { id: 'fees', label: '6. School Fees Schedule' },
    { id: 'scholarships', label: '7. Scholarships & Aid' },
    { id: 'news', label: '8. News & Circulars' },
    { id: 'achievements', label: '9. Academic Achievements' },
    { id: 'student_recognition', label: '10. Student Recognition' },
    { id: 'lecturers', label: '11. Lecturers & Researchers' },
    { id: 'competitions', label: '12. Competitions' },
    { id: 'facilities', label: '13. Campus Facilities' },
    { id: 'reviews', label: '14. Reviews & Feedback' },
  ];

  const [activeSection, setActiveSection] = useState('overview');

  // Review submission state
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  // Report Incorrect Information Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState<DataReport['category']>('Cut-Off Mark');
  const [reportDetails, setReportDetails] = useState('');
  const [reportCorrection, setReportCorrection] = useState('');

  if (!institution) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          {matchedInstitution ? 'Institution Not Found or Not Yet Published' : 'Institution Not Found'}
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {matchedInstitution
            ? 'This institutional record is currently unpublished, pending verification, or archived and is not publicly accessible.'
            : 'The requested school profile could not be located in the public directory.'}
        </p>
        <button
          onClick={() => setSelectedInstitutionId(null)}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const bookmarked = watchlist.includes(institution.id);
  const regulatoryBadge = getRegulatoryAccreditationStatus(institution);

  // Institution-specific news and achievements
  const instNews = news.filter(
    (n) =>
      n.institutionId === institution.id ||
      (n.institutionName && n.institutionName.toLowerCase() === institution.name.toLowerCase())
  );
  const instAchievements = achievements.filter((a) => a.institutionId === institution.id);
  const instStudents = instAchievements.filter((a) => a.recipientRole === 'Student');
  const instLecturers = instAchievements.filter(
    (a) => a.recipientRole === 'Lecturer' || a.recipientRole === 'Researcher'
  );
  const instCompetitions = instAchievements.filter((a) => a.recipientRole === 'Institutional Team');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    addReview(institution.id, {
      authorName: currentUser.fullName,
      authorRole: (currentUser.role === 'student' ? 'Student' : currentUser.role === 'lecturer' ? 'Lecturer' : 'Alumnus') as any,
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      academicYear: '2025/2026',
    });

    setNewReviewComment('');
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;
    submitDataReport({
      institutionId: institution.id,
      institutionName: institution.name,
      category: reportCategory,
      details: reportDetails.trim(),
      suggestedCorrection: reportCorrection.trim() || undefined,
      reportedByEmail: currentUser.email,
      reportedByName: currentUser.fullName,
    });
    setReportDetails('');
    setReportCorrection('');
    setIsReportModalOpen(false);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Profile URL copied to clipboard.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      
      {/* 1. TOP BREADCRUMB & RETURN BAR */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <button
            onClick={() => setSelectedInstitutionId(null)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-teal-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Institution Registry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-600 hover:text-amber-700 rounded-md border border-slate-200 hover:bg-amber-50 transition-colors"
              title="Report Incorrect Information"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Data Issue</span>
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Share Profile Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleWatchlist(institution.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                bookmarked
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Saved to Watchlist' : 'Add to Watchlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* UNPUBLISHED ADMIN PREVIEW BANNER */}
      {!isPubliclyVisible && canPreviewUnpublished && (
        <div className="bg-amber-950 text-amber-100 border-b border-amber-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Admin Preview (Not Published Publicly)</strong> — Verification:{' '}
                <strong className="text-white">
                  {VERIFICATION_STATUS_LABELS[institution.verificationStatus] || institution.verificationStatus}
                </strong>{' '}
                · Publication:{' '}
                <strong className="text-white">
                  {PUBLICATION_STATUS_LABELS[institution.publicationStatus] || institution.publicationStatus}
                </strong>
              </span>
            </div>
            <button
              onClick={() => setCurrentTab('admin')}
              className="self-start sm:self-auto px-3 py-1 bg-amber-400 text-slate-950 font-semibold rounded hover:bg-amber-300 transition-colors"
            >
              Manage in Admin Dashboard
            </button>
          </div>
        </div>
      )}

      {/* 2. PROFILE HERO BANNER & ESSENTIAL HEADER */}
      <div className="bg-slate-900 text-white relative">
        <div className="h-64 sm:h-80 w-full overflow-hidden relative">
          <img
            src={resolveImageUrl(institution.coverImageUrl, MEDIA_ASSETS.campusBuilding)}
            alt={institution.name}
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (e.currentTarget.src !== MEDIA_ASSETS.campusBuilding) {
                e.currentTarget.src = MEDIA_ASSETS.campusBuilding;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-28 relative z-10 pb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            
            <div className="flex items-start gap-4 max-w-3xl">
              {institution.logoUrl && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white p-1.5 shadow-lg border border-slate-200 shrink-0 hidden sm:flex items-center justify-center overflow-hidden">
                  <img
                    src={resolveImageUrl(institution.logoUrl, MEDIA_ASSETS.campusBuilding)}
                    alt={`${institution.acronym || institution.name} Logo`}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="space-y-2.5">
                {/* Institution Acronym & Location strip */}
                <div className="flex items-center flex-wrap gap-2 text-xs text-teal-400">
                  <span className="font-semibold tracking-wider uppercase">{institution.acronym || 'INSTITUTION'}</span>
                  <span className="text-slate-500">·</span>
                  <span>
                    {institution.state === 'Unspecified'
                      ? 'Nigeria (Location Pending)'
                      : `${institution.city}${institution.lga && institution.lga !== institution.city ? ` (${institution.lga})` : ''}, ${
                          institution.state === 'FCT Abuja' ? 'FCT Abuja' : `${institution.state} State`
                        }`}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">Est. {institution.establishmentYear}</span>
                  <span className="text-slate-500">·</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    institution.verificationStatus === 'verified'
                      ? 'text-emerald-400'
                      : institution.verificationStatus === 'pending_verification'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}>
                    {institution.verificationStatus === 'verified' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {institution.verificationStatus === 'verified'
                        ? 'Verified Statutory Charter'
                        : VERIFICATION_STATUS_LABELS[institution.verificationStatus] || 'Unverified Record'}
                    </span>
                  </span>
                  {institution.isHistorical && (
                    <>
                      <span className="text-slate-500">·</span>
                      <span className="text-amber-300 font-semibold">Historical / Converted Record</span>
                    </>
                  )}
                </div>

                {/* Official Name & Common Name */}
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                    {institution.name}
                  </h1>
                  {institution.commonName && institution.commonName !== institution.name && (
                    <p className="text-xs text-slate-300 mt-1">
                      Commonly known as: <span className="text-white font-medium">{institution.commonName}</span>
                    </p>
                  )}
                  {institution.formerNames && institution.formerNames.length > 0 && (
                    <p className="text-xs text-slate-300 mt-0.5">
                      Formerly known as: <span className="text-teal-200 font-medium">{institution.formerNames.join(' · ')}</span>
                    </p>
                  )}
                </div>

                {/* Motto */}
                {institution.motto && (
                  <p className="text-xs sm:text-sm italic text-slate-300">
                    "{institution.motto}"
                  </p>
                )}

                {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300 pt-1">
                  <span>
                    <strong>Category:</strong> {INSTITUTION_CATEGORY_LABELS[institution.category] || institution.category}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span><strong>Level:</strong> {EDUCATION_LEVEL_LABELS[institution.level] || institution.level}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span><strong>Ownership:</strong> {institution.ownership}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span><strong>Accreditation:</strong> {institution.accreditationBody || 'Pending Review'}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono tabular-nums text-slate-400">Updated: {institution.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Verification Status Badge & Official Website */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto shrink-0">
              <div
                className={`px-3.5 py-2 rounded-lg border backdrop-blur-sm flex items-center gap-2.5 text-xs ${
                  regulatoryBadge.status === 'active'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100'
                    : regulatoryBadge.status === 'expired'
                    ? 'bg-red-950/85 border-red-500/50 text-red-100'
                    : 'bg-amber-950/80 border-amber-500/40 text-amber-100'
                }`}
                title={regulatoryBadge.summary}
              >
                {regulatoryBadge.status === 'active' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle
                    className={`w-4 h-4 shrink-0 ${
                      regulatoryBadge.status === 'expired' ? 'text-red-400' : 'text-amber-400'
                    }`}
                  />
                )}
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                    Verification Status · {regulatoryBadge.regulator}
                  </div>
                  <div
                    className={`font-bold ${
                      regulatoryBadge.status === 'active'
                        ? 'text-emerald-300'
                        : regulatoryBadge.status === 'expired'
                        ? 'text-red-300'
                        : 'text-amber-300'
                    }`}
                  >
                    {regulatoryBadge.label}
                  </div>
                </div>
              </div>

              {institution.websiteUrl && (
                <a
                  href={institution.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* 3. 14-SECTION SEGMENTED NAVIGATION BAR */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-2 py-2 min-w-max">
            {profileSections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {sec.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 4. ACTIVE SECTION CONTENT VIEWPORT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SECTION 1: OVERVIEW */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {(institution.isHistorical || institution.successorName || institution.operationalStatusNote) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {institution.isHistorical
                        ? 'Historical / Converted Institution Notice'
                        : 'Regulatory & Operational Verification Notice'}
                    </span>
                  </div>
                  {institution.successorName && (
                    <p>
                      <strong>Successor Institution:</strong> {institution.successorName}
                    </p>
                  )}
                  {institution.operationalStatusNote && (
                    <p className="leading-relaxed text-amber-900">{institution.operationalStatusNote}</p>
                  )}
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Institutional Profile & History
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {institution.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block">Principal Officer / Chancellor</span>
                    <strong className="text-slate-900">{institution.chancellorOrPrincipal || 'Not yet available'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Student Body Range</span>
                    <strong className="text-slate-900">{institution.studentPopulationRange || 'Not yet available'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Academic Staff Strength</span>
                    <strong className="text-slate-900 font-mono tabular-nums">{institution.academicStaffCount ? `${institution.academicStaffCount}+ lecturers` : 'Not yet available'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">National Standing / Ranking</span>
                    <strong className="text-slate-900 font-mono tabular-nums">{institution.nationalRanking ? `Ranked #${institution.nationalRanking} in Nigeria` : 'Statutory Registry'}</strong>
                  </div>
                  {institution.formerNames && institution.formerNames.length > 0 && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Former / Historical Name(s)</span>
                      <strong className="text-slate-900">{institution.formerNames.join('; ')}</strong>
                    </div>
                  )}
                  {institution.successorName && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Converted / Successor Institution</span>
                      <strong className="text-slate-900">{institution.successorName}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Fast Highlights */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Statutory Accreditations
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      regulatoryBadge.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : regulatoryBadge.status === 'expired'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {regulatoryBadge.status === 'active' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle
                        className={`w-3.5 h-3.5 ${
                          regulatoryBadge.status === 'expired' ? 'text-red-600' : 'text-amber-600'
                        }`}
                      />
                    )}
                    <span>Verification Status: {regulatoryBadge.label}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Regulatory Body: <strong>{institution.accreditationBody || 'Information has not yet been verified or published.'}</strong>
                  {institution.accreditationStatus && (
                    <> · Status: <strong>{institution.accreditationStatus}</strong></>
                  )}
                  {institution.accreditationReference && (
                    <> · Ref: <span className="font-mono">{institution.accreditationReference}</span></>
                  )}
                </p>
                <p className="text-[11px] text-slate-500">
                  {regulatoryBadge.summary}
                </p>
              </div>
            </div>

            {/* Sidebar Contact & Address Info */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Official Contact & Campus Location
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Campus Address</span>
                      <span className="text-slate-900">
                        {institution.address || `${institution.city}${institution.lga ? `, ${institution.lga}` : ''}, ${institution.state} State`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Official Email</span>
                      <span className={institution.email ? 'text-slate-900 font-mono' : 'text-slate-500 italic'}>
                        {institution.email || 'Information has not yet been verified or published.'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-500 block">Official Telephone</span>
                      <span className={institution.phone ? 'text-slate-900 font-mono' : 'text-slate-500 italic'}>
                        {institution.phone || 'Information has not yet been verified or published.'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Audit Stamp & Source Attribution */}
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-teal-800 font-semibold">
                  {institution.verificationStatus === 'verified' ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>
                    {institution.verificationStatus === 'verified'
                      ? 'Verified Educational Entity'
                      : VERIFICATION_STATUS_LABELS[institution.verificationStatus] || 'Pending Editorial Verification'}
                  </span>
                </div>
                <p className="text-slate-600">
                  Source Reference:{' '}
                  <strong>{institution.sourceReference?.name || institution.accreditationBody || 'Information has not yet been verified or published.'}</strong>
                  {institution.sourceReference?.url && (
                    <>
                      {' '}
                      (
                      <a
                        href={institution.sourceReference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-700 hover:underline"
                      >
                        Official Source
                      </a>
                      )
                    </>
                  )}
                </p>
                {(institution.verifiedAt || institution.sourceReference?.verificationDate) && (
                  <div className="text-[11px] text-slate-600">
                    Last Verified:{' '}
                    <span className="font-mono">
                      {(institution.verifiedAt || institution.sourceReference?.verificationDate || '').split('T')[0]}
                    </span>
                    {institution.verifiedByName && <> by {institution.verifiedByName}</>}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 font-mono pt-1 flex items-center justify-between">
                  <span>Entity ID: {institution.id} · Updated: {institution.lastUpdated}</span>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="text-[11px] font-semibold text-amber-800 hover:underline flex items-center gap-1 pt-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report incorrect cut-off, fee, or contact info</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: FACULTIES AND DEPARTMENTS */}
        {activeSection === 'faculties' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Faculties, Colleges & Academic Departments
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Accredited academic divisions and teaching departments.
              </p>
            </div>

            {institution.faculties && institution.faculties.length > 0 ? (
              <div className="space-y-6">
                {institution.faculties.map((fac) => (
                  <div key={fac.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-base font-bold text-slate-900">{fac.name}</h3>
                      {fac.deanName && (
                        <span className="text-xs text-slate-500">Dean: <strong>{fac.deanName}</strong></span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fac.departments.map((dept) => (
                        <div key={dept.id} className="bg-slate-50 p-3 rounded-md text-xs space-y-1">
                          <strong className="text-slate-900">{dept.name}</strong>
                          <div className="text-slate-500">
                            {dept.courses.length} accredited program{dept.courses.length > 1 ? 's' : ''}:{' '}
                            {dept.courses.map((c) => c.name).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: COURSES & PROGRAMMES */}
        {activeSection === 'courses' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Undergraduate & Postgraduate Courses
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Accredited programs, degree types, course durations, and specific prerequisites.
              </p>
            </div>

            {institution.faculties && institution.faculties.flatMap((f) => f.departments.flatMap((d) => d.courses)).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Course Title</th>
                      <th className="py-3 px-3">Degree</th>
                      <th className="py-3 px-3">Duration</th>
                      <th className="py-3 px-3">UTME Cut-Off</th>
                      <th className="py-3 px-3">Required UTME Subjects</th>
                      <th className="py-3 px-3">Accreditation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {institution.faculties.flatMap((f) =>
                      f.departments.flatMap((d) =>
                        d.courses.map((course) => (
                          <tr key={course.id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {course.name}
                              {course.code && <span className="text-slate-400 block font-normal">({course.code})</span>}
                            </td>
                            <td className="py-3 px-3 text-slate-700">{course.degreeType}</td>
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-600">{course.durationYears} Years</td>
                            <td className="py-3 px-3 font-mono tabular-nums font-semibold text-teal-800">
                              {course.cutOffMark ? `${course.cutOffMark}+` : 'General'}
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {course.utmeSubjects ? course.utmeSubjects.join(', ') : 'English + 3 Relevant Subjects'}
                            </td>
                            <td className="py-3 px-3 text-slate-600">{course.accreditationStatus}</td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: ADMISSION REQUIREMENTS */}
        {activeSection === 'admissions' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Admission Guidelines & Prerequisites
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Official requirements for UTME candidates, Direct Entry, and transfer applicants.
              </p>
            </div>

            {institution.admissionInfo ? (
              <div className="space-y-5 text-xs text-slate-700 leading-relaxed">
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 space-y-1">
                  <strong className="block text-sm">Target Academic Session: {institution.admissionInfo.academicSession}</strong>
                  <p>{institution.admissionInfo.guidelines}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                    <strong className="text-slate-900 block text-sm">O-Level Requirements (WAEC/NECO/NABTEB)</strong>
                    <p className="text-slate-600">
                      Candidates must possess at least five (5) credit passes in relevant subjects including English Language and Mathematics at not more than two sittings. For Medicine, Pharmacy, and Law, single-sitting passes are required.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                    <strong className="text-slate-900 block text-sm">Direct Entry (DE) Benchmarks</strong>
                    <p className="text-slate-600">
                      {institution.admissionInfo.directEntryInfo || 'Candidates with JUPEB, Cambridge A-Levels, or ND with minimum Upper Credit are eligible for 200 Level consideration subject to quota.'}
                    </p>
                  </div>
                </div>

                {institution.admissionInfo.admissionPortalUrl && (
                  <div className="pt-2">
                    <a
                      href={institution.admissionInfo.admissionPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 font-semibold"
                    >
                      <span>Visit Institution Admission Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: JAMB INFORMATION */}
        {activeSection === 'jamb' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                JAMB Information & Screening Benchmarks
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Central Admissions Processing System (CAPS) score cut-offs and screening fee regulations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-slate-500 block">General Institutional Cut-Off</span>
                <span className="text-2xl font-bold font-mono text-teal-800 tabular-nums">
                  {institution.admissionInfo?.generalCutOffMark ? `${institution.admissionInfo.generalCutOffMark}` : 'Not published'}
                </span>
                <span className="text-slate-400 block mt-1">
                  {institution.admissionInfo?.generalCutOffMark
                    ? 'Minimum UTME score required'
                    : 'Information has not yet been verified or published.'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-slate-500 block">Post-UTME Screening Fee</span>
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {institution.admissionInfo?.postUtmeFeeNaira !== undefined
                    ? `₦${institution.admissionInfo.postUtmeFeeNaira.toLocaleString()}`
                    : 'Not published'}
                </span>
                <span className="text-slate-400 block mt-1">
                  {institution.admissionInfo?.postUtmeFeeNaira !== undefined
                    ? 'Verified screening fee'
                    : 'Information has not yet been verified or published.'}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <span className="text-slate-500 block">Application Deadline</span>
                <span className="text-base font-bold text-slate-800">
                  {institution.admissionInfo?.applicationDeadline || 'Information has not yet been verified or published.'}
                </span>
                <span className="text-slate-400 block mt-1">Post-UTME closing date</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-900">JAMB CAPS Compliance Directive</h4>
              <p>
                In compliance with JAMB regulations, no institution may charge above ₦2,000 for post-UTME screening. All admissions must be confirmed via JAMB CAPS before candidate matriculation.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 6: SCHOOL FEES */}
        {activeSection === 'fees' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                School Fees & Municipal Service Charges
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Estimated session breakdown. Figures represent verified schedules or are labelled as 'Not yet available'.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <span className="text-slate-500 block">Estimated Schedule Range</span>
              <div className="text-lg font-bold text-slate-900">
                {institution.schoolFeesRange || 'Information has not yet been verified or published.'}
              </div>
              <p className="text-slate-600">
                * Note: Federal universities operate under tuition-free federal statutory charters; fees cover municipal facility charges, laboratory levies, ICT services, and medical insurance.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 7: SCHOLARSHIPS */}
        {activeSection === 'scholarships' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Scholarships & Financial Aid Tenable at {institution.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Funding opportunities open to enrolled or prospective students of this institution.
              </p>
            </div>

            <div className="space-y-4">
              {scholarships.map((sch) => (
                <div key={sch.id} className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-semibold text-slate-700">{sch.providerType}</span>
                    <span className="font-mono tabular-nums text-amber-700">Deadline: {sch.deadline}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{sch.title}</h3>
                  <p className="text-teal-800 font-medium">{sch.coverage}</p>
                  <a
                    href={sch.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-teal-700 hover:underline pt-1 font-semibold"
                  >
                    <span>View Scholarship Application Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: NEWS & ANNOUNCEMENTS */}
        {activeSection === 'news' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Institution-Specific News & Official Announcements
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Senate circulars, matriculation dates, convocation notices, and academic releases.
              </p>
            </div>

            {instNews.length > 0 ? (
              <div className="space-y-4">
                {instNews.map((n) => (
                  <div key={n.id} className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                    <div className="text-slate-500 font-mono tabular-nums">{n.publishedAt.split('T')[0]} · {n.category}</div>
                    <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                    <p className="text-slate-600">{n.summary}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 9: ACADEMIC ACHIEVEMENTS */}
        {activeSection === 'achievements' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Institutional & Departmental Academic Achievements
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Verified research grants, patents, and scholarly honors.
              </p>
            </div>

            {instAchievements.length > 0 ? (
              <div className="space-y-4">
                {instAchievements.map((ach) => (
                  <div key={ach.id} className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-teal-700 font-semibold">{ach.awardBody}</span>
                      <span className="font-mono tabular-nums">{ach.year}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{ach.title}</h3>
                    <p className="text-slate-600">{ach.description}</p>
                    <div className="text-slate-500">Recipient: <strong>{ach.recipientName}</strong> ({ach.recipientRole})</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 10: STUDENT RECOGNITION */}
        {activeSection === 'student_recognition' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Student Recognition & Scholarly Accolades
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Verified student honours and national innovation awards linked to {institution.name}.
              </p>
            </div>

            {instStudents.length > 0 ? (
              <div className="space-y-4 text-xs">
                {instStudents.map((stu) => (
                  <div key={stu.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-teal-700 font-semibold">{stu.awardBody}</span>
                      <span className="font-mono text-slate-500">{stu.year}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{stu.recipientName} — {stu.title}</h4>
                    <p className="text-slate-600">{stu.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 11: LECTURERS & RESEARCHERS */}
        {activeSection === 'lecturers' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Distinguished Lecturers & Principal Investigators
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Verified faculty and research fellows affiliated with {institution.name}.
              </p>
            </div>

            {instLecturers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {instLecturers.map((lec) => (
                  <div key={lec.id} className="border border-slate-200 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900">{lec.recipientName}</h4>
                      <span className="font-mono text-slate-500">{lec.year}</span>
                    </div>
                    <span className="text-teal-700 font-medium block">{lec.field} ({lec.recipientRole})</span>
                    <p className="text-slate-600"><strong>{lec.title}</strong> — {lec.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 12: COMPETITIONS */}
        {activeSection === 'competitions' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Academic & Technology Competitions
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Verified inter-collegiate championships and national innovation contest records for {institution.name}.
              </p>
            </div>

            {instCompetitions.length > 0 ? (
              <div className="space-y-3 text-xs">
                {instCompetitions.map((comp) => (
                  <div key={comp.id} className="border-l-2 border-teal-600 pl-4 py-1 space-y-1">
                    <strong className="text-slate-900 block text-sm">{comp.title} ({comp.year})</strong>
                    <p className="text-slate-600">{comp.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 13: FACILITIES */}
        {activeSection === 'facilities' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Campus Infrastructure & Academic Facilities
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Verified laboratories, e-libraries, student halls, and sporting complexes.
              </p>
            </div>

            {institution.facilities && institution.facilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {institution.facilities.map((fac) => (
                  <div key={fac.id} className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-teal-800">{fac.category}</span>
                      <span className="text-teal-700 font-medium">Verified Facility</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                    <p className="text-slate-600">{fac.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
                Information has not yet been verified or published.
              </div>
            )}
          </div>
        )}

        {/* SECTION 14: REVIEWS AND FEEDBACK */}
        {activeSection === 'reviews' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Student & Stakeholder Feedback
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Real reviews from current students, alumni, and academic staff.
              </p>
            </div>

            {/* Submit Feedback Form */}
            <form onSubmit={handleAddReview} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Leave a Verified Review as <span className="capitalize">{currentUser.fullName} ({currentUser.role.replace('_', ' ')})</span>
              </h4>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600">Overall Rating:</span>
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900"
                >
                  <option value={5}>5 Stars - Outstanding Academic Standard</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average / Needs Facility Upgrades</option>
                  <option value={2}>2 Stars - Substandard Conditions</option>
                  <option value={1}>1 Star - Poor Support</option>
                </select>
              </div>

              <textarea
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder="Share your experience regarding lecture quality, campus safety, library facilities, and administration responsiveness..."
                rows={3}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>

            {/* Existing Reviews List */}
            <div className="space-y-4 pt-2">
              {(institution.reviews && institution.reviews.length > 0) ? (
                institution.reviews.map((rev) => (
                  <div key={rev.id} className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">{rev.authorName}</strong>
                        <span className="text-slate-500 ml-2">({rev.authorRole})</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                    <div className="text-[11px] text-slate-400 font-mono">Date posted: {rev.date}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 text-center py-6">
                  No public reviews posted yet for this institution. Be the first to submit verified feedback!
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* REPORT INCORRECT INFORMATION MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Report Incorrect Information</h3>
                <p className="text-[11px] text-slate-500">Flag outdated or unverified records for {institution.name}</p>
              </div>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Affected Section</label>
                <select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value as DataReport['category'])}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Cut-Off Mark">JAMB Cut-Off Mark</option>
                  <option value="Accreditation">Accreditation Status</option>
                  <option value="Fees Schedule">School Fees Schedule</option>
                  <option value="Contact / Portal URL">Contact / Official Portal URL</option>
                  <option value="Faculty / Course">Faculty / Course Listing</option>
                  <option value="Other">Other Factual Discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Describe the Issue *</label>
                <textarea
                  required
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  rows={3}
                  placeholder="Provide specific details about what is inaccurate or outdated..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Source / Correction Link (Optional)</label>
                <input
                  type="text"
                  value={reportCorrection}
                  onChange={(e) => setReportCorrection(e.target.value)}
                  placeholder="Link to official Senate circular or portal notice"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-md text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-md font-semibold"
                >
                  Submit Editorial Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
