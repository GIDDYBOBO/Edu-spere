import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NIGERIAN_STATES, EDUCATION_LEVEL_LABELS } from '../data/nigerianStates';
import {
  Search,
  RotateCcw,
  Bookmark,
  ExternalLink,
  LayoutGrid,
  List,
  Plus,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const DirectoryView: React.FC = () => {
  const {
    publicInstitutions,
    isLoadingInstitutions,
    dbError,
    refreshInstitutions,
    openInstitutionProfile,
    searchQuery,
    setSearchQuery,
    filterLevel,
    setFilterLevel,
    filterState,
    setFilterState,
    resetFilters,
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    setCurrentTab
  } = useApp();

  // Additional granular filter states
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [filterLga, setFilterLga] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ranking' | 'name' | 'established' | 'cutoff' | 'updated'>('ranking');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [onlyWatchlist, setOnlyWatchlist] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Selected state's LGAs
  const currentSelectedStateInfo = useMemo(() => {
    return NIGERIAN_STATES.find((s) => s.name === filterState);
  }, [filterState]);

  // Filter and sort computation (strictly over published publicInstitutions)
  const filteredInstitutions = useMemo(() => {
    return publicInstitutions.filter((inst) => {
      if (onlyWatchlist && !watchlist.includes(inst.id)) {
        return false;
      }

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = inst.name.toLowerCase().includes(q);
        const matchesCommon = inst.commonName?.toLowerCase().includes(q);
        const matchesAcronym = inst.acronym?.toLowerCase().includes(q);
        const matchesFormer = inst.formerNames?.some((fn) => fn.toLowerCase().includes(q));
        const matchesSuccessor = inst.successorName?.toLowerCase().includes(q);
        const matchesCity = inst.city.toLowerCase().includes(q);
        const matchesState = inst.state.toLowerCase().includes(q);
        const matchesCourse = inst.faculties?.some((f) =>
          f.departments.some((d) => d.courses.some((c) => c.name.toLowerCase().includes(q)))
        );
        if (
          !matchesName &&
          !matchesCommon &&
          !matchesAcronym &&
          !matchesFormer &&
          !matchesSuccessor &&
          !matchesCity &&
          !matchesState &&
          !matchesCourse
        ) {
          return false;
        }
      }

      // Level filter
      if (filterLevel !== 'all' && inst.level !== filterLevel) {
        return false;
      }

      // State filter
      if (filterState !== 'all' && inst.state !== filterState) {
        return false;
      }

      // LGA filter
      if (filterLga !== 'all' && inst.lga !== filterLga) {
        return false;
      }

      // Verification filter
      if (filterVerification !== 'all' && inst.verificationStatus !== filterVerification) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'established') {
        return (a.establishmentYear || 0) - (b.establishmentYear || 0);
      }
      if (sortBy === 'cutoff') {
        return (b.admissionInfo?.generalCutOffMark || 0) - (a.admissionInfo?.generalCutOffMark || 0);
      }
      if (sortBy === 'updated') {
        return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
      return (a.nationalRanking || 999) - (b.nationalRanking || 999);
    });
  }, [
    publicInstitutions,
    searchQuery,
    filterLevel,
    filterState,
    filterLga,
    filterVerification,
    sortBy,
    onlyWatchlist,
    watchlist,
  ]);

  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage) || 1;
  const safePage = Math.min(page, totalPages);
  const paginatedInstitutions = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredInstitutions.slice(start, start + itemsPerPage);
  }, [filteredInstitutions, safePage, itemsPerPage]);

  const paginationItems = useMemo(() => {
    const items: (number | 'ellipsis-left' | 'ellipsis-right')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }
    items.push(1);
    const left = Math.max(2, safePage - 1);
    const right = Math.min(totalPages - 1, safePage + 1);
    if (left > 2) items.push('ellipsis-left');
    for (let i = left; i <= right; i++) items.push(i);
    if (right < totalPages - 1) items.push('ellipsis-right');
    items.push(totalPages);
    return items;
  }, [safePage, totalPages]);

  const handleResetAll = () => {
    resetFilters();
    setFilterVerification('all');
    setFilterLga('all');
    setSortBy('ranking');
    setOnlyWatchlist(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>EduSphere Nigeria</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Institution Registry & Discovery</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Explore Educational Institutions
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Discover, compare, and inspect verified universities, polytechnics, colleges, and secondary schools nationwide.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setOnlyWatchlist(!onlyWatchlist);
                  setPage(1);
                }}
                className={`px-3 py-2 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                  onlyWatchlist
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Watchlist ({watchlist.length})</span>
              </button>

              <button
                onClick={() => setCurrentTab('admin')}
                className="px-3.5 py-2 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Institution</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Comprehensive Filters Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 mb-8 shadow-sm space-y-4">
          {/* Main search bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by school name, acronym (e.g. UNILAG, UI, FUTO), town, or course..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-800 px-2"
              >
                Clear query
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">

            {/* Level */}
            <div>
              <label className="block text-slate-500 font-medium mb-1">Education Level</label>
              <select
                value={filterLevel}
                onChange={(e) => {
                  setFilterLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="all">All Levels</option>
                {Object.entries(EDUCATION_LEVEL_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-slate-500 font-medium mb-1">State / FCT</label>
              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setFilterLga('all');
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="all">All 36 States + FCT</option>
                {NIGERIAN_STATES.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name} ({s.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* LGA (Dynamic based on selected state) */}
            <div>
              <label className="block text-slate-500 font-medium mb-1">Local Govt Area</label>
              <select
                value={filterLga}
                disabled={filterState === 'all' || !currentSelectedStateInfo}
                onChange={(e) => {
                  setFilterLga(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:opacity-50"
              >
                <option value="all">All LGAs</option>
                {currentSelectedStateInfo?.majorLgas.map((lga) => (
                  <option key={lga} value={lga}>
                    {lga}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-slate-500 font-medium mb-1">Status</label>
              <select
                value={filterVerification}
                onChange={(e) => {
                  setFilterVerification(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="all">All Statuses</option>
                <option value="verified">Verified Charter</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="unverified">Unverified</option>
                <option value="flagged">Flagged for Review</option>
              </select>
            </div>

          </div>

          {/* Reset Filters & Active Filter Count */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-900 font-mono tabular-nums">{filteredInstitutions.length}</strong> matching institutions
            </div>
            <button
              onClick={handleResetAll}
              className="text-xs text-teal-700 hover:text-teal-900 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset all filters</span>
            </button>
          </div>
        </div>

        {/* View Controls & Sorting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort results by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
            >
              <option value="ranking">National Standing / Ranking</option>
              <option value="name">Alphabetical (A - Z)</option>
              <option value="updated">Recently Updated</option>
              <option value="established">Establishment Year (Oldest First)</option>
              <option value="cutoff">UTME Cut-Off Mark (High to Low)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View switcher buttons */}
            <div className="flex items-center border border-slate-300 rounded-md overflow-hidden bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading or Database Error State */}
        {dbError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4 text-xs text-red-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{dbError}</span>
            </div>
            <button
              onClick={() => refreshInstitutions()}
              className="px-3 py-1 bg-white border border-red-300 rounded font-semibold hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results Container */}
        {isLoadingInstitutions ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <Loader2 className="w-7 h-7 animate-spin text-teal-700 mx-auto" />
            <p className="text-xs text-slate-500">Loading published institutions from PostgreSQL registry...</p>
          </div>
        ) : filteredInstitutions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                No institutions found matching criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your search terms, choosing "All Levels", or resetting your state filter.
              </p>
            </div>
            <button
              onClick={handleResetAll}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedInstitutions.map((inst) => {
              const bookmarked = isInWatchlist(inst.id);
              return (
                <div
                  key={inst.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image / Header strip */}
                    <div className="relative h-40 bg-slate-800 overflow-hidden">
                      <img
                        src={inst.coverImageUrl || '/src/assets/images/campus_faculty_building_1794428718479.jpg'}
                        alt={inst.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                      
                      {/* Watchlist toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(inst.id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-lg backdrop-blur-md transition-colors ${
                          bookmarked
                            ? 'bg-teal-600 text-white'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                        title={bookmarked ? 'Remove from Watchlist' : 'Save to Watchlist'}
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      {/* Rank tag and City */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-2 text-[11px] text-teal-300 font-medium mb-0.5">
                          <span>
                            {inst.state === 'Unspecified'
                              ? 'Nigeria (Location Pending)'
                              : inst.city && inst.city !== inst.state
                              ? `${inst.city}, ${inst.state}`
                              : inst.state}
                          </span>
                          <span>·</span>
                          <span>Est. {inst.establishmentYear}</span>
                        </div>
                        <h3 className="text-base font-bold leading-snug line-clamp-1">
                          {inst.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
                      <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-800 capitalize">{inst.ownership}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{EDUCATION_LEVEL_LABELS[inst.level] || inst.level}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-medium ${
                          inst.verificationStatus === 'verified'
                            ? 'text-teal-700'
                            : inst.verificationStatus === 'pending_verification'
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}>
                          {inst.verificationStatus === 'verified'
                            ? 'Verified'
                            : inst.verificationStatus === 'pending_verification'
                            ? 'Pending Review'
                            : inst.verificationStatus === 'flagged'
                            ? 'Flagged'
                            : 'Unverified'}
                        </span>
                        {inst.isHistorical && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-amber-800">Historical / Converted</span>
                          </>
                        )}
                      </div>

                      {inst.formerNames && inst.formerNames.length > 0 && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          Formerly: <span className="text-slate-700 font-medium">{inst.formerNames[0]}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {inst.description}
                      </p>

                      {inst.operationalStatusNote && (
                        <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 line-clamp-2">
                          {inst.operationalStatusNote}
                        </div>
                      )}

                      {/* Admission & Fees metrics */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>JAMB UTME Cut-Off:</span>
                          <strong className="text-slate-900 font-mono tabular-nums">
                            {inst.admissionInfo ? `${inst.admissionInfo.generalCutOffMark}+` : 'Not yet available'}
                          </strong>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Estimated Fees:</span>
                          <span className="text-slate-700 font-medium line-clamp-1 max-w-[170px] text-right">
                            {inst.schoolFeesRange ? inst.schoolFeesRange.split('(')[0] : 'Not yet available'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => openInstitutionProfile(inst.id)}
                      className="w-full py-2 px-3 text-xs font-semibold text-teal-700 hover:text-white bg-teal-50 hover:bg-teal-700 border border-teal-200 hover:border-teal-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Explore 14 Profile Sections</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Institution</th>
                    <th className="py-3 px-3">Sector & Ownership</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Established</th>
                    <th className="py-3 px-3">Cut-Off</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedInstitutions.map((inst) => {
                    const bookmarked = isInWatchlist(inst.id);
                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            onClick={() => openInstitutionProfile(inst.id)}
                            className="hover:text-teal-700 transition-colors text-left font-semibold"
                          >
                            {inst.name}
                          </button>
                          {(inst.acronym || inst.formerNames?.[0] || inst.isHistorical) && (
                            <span className="text-[11px] text-slate-400 block font-normal">
                              {[
                                inst.acronym || '',
                                inst.formerNames?.[0] ? `Formerly ${inst.formerNames[0]}` : '',
                                inst.isHistorical ? 'Historical / Converted' : '',
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div>{EDUCATION_LEVEL_LABELS[inst.level] || inst.level}</div>
                          <span className="text-[11px] text-slate-400 capitalize">{inst.ownership}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          <div>{inst.city}</div>
                          <span className="text-[11px] text-slate-400">
                            {inst.state === 'Unspecified'
                              ? 'Location pending'
                              : inst.state === 'FCT Abuja'
                              ? 'FCT Abuja'
                              : `${inst.state} State`}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                          {inst.establishmentYear}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-900">
                          {inst.admissionInfo ? `${inst.admissionInfo.generalCutOffMark}+` : 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-medium ${
                            inst.verificationStatus === 'verified'
                              ? 'text-teal-700'
                              : inst.verificationStatus === 'pending_verification'
                              ? 'text-amber-700'
                              : 'text-red-700'
                          }`}>
                            {inst.verificationStatus === 'verified'
                              ? 'Verified'
                              : inst.verificationStatus === 'pending_verification'
                              ? 'Pending'
                              : inst.verificationStatus === 'flagged'
                              ? 'Flagged'
                              : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => toggleWatchlist(inst.id)}
                            className="p-1.5 text-slate-400 hover:text-teal-700 transition-colors"
                            title={bookmarked ? 'Saved to Watchlist' : 'Save to Watchlist'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-teal-700 text-teal-700' : ''}`} />
                          </button>
                          <button
                            onClick={() => openInstitutionProfile(inst.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-700 hover:text-white rounded transition-colors"
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-600">
            <div>
              Showing{' '}
              <strong className="font-mono tabular-nums text-slate-900">
                {(safePage - 1) * itemsPerPage + 1}–{Math.min(safePage * itemsPerPage, filteredInstitutions.length)}
              </strong>{' '}
              of <strong className="font-mono tabular-nums text-slate-900">{filteredInstitutions.length}</strong> · Page{' '}
              <strong className="font-mono tabular-nums text-slate-900">{safePage}</strong> of{' '}
              <strong className="font-mono tabular-nums text-slate-900">{totalPages}</strong>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <button
                disabled={safePage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              {paginationItems.map((item) =>
                typeof item === 'string' ? (
                  <span key={item} className="px-2 text-slate-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`min-w-8 h-8 px-2 rounded-md font-mono tabular-nums font-medium transition-colors ${
                      safePage === item
                        ? 'bg-teal-700 text-white'
                        : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
