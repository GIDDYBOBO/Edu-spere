import React from 'react';
import { useApp } from '../context/AppContext';
import { NIGERIAN_STATES } from '../data/nigerianStates';
import {
  Search,
  School,
  Award,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Bookmark,
  Calendar,
  Building2,
  CheckCircle2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    publicInstitutions,
    news,
    scholarships,
    achievements,
    openInstitutionProfile,
    setCurrentTab,
    searchQuery,
    setSearchQuery,
    filterLevel,
    setFilterLevel,
    filterState,
    setFilterState,
    toggleWatchlist,
    isInWatchlist,
  } = useApp();

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentTab('schools');
  };

  const handleCategoryClick = (level: string) => {
    setFilterLevel(level);
    setCurrentTab('schools');
  };

  const featuredInstitutions = publicInstitutions.slice(0, 3);
  const featuredNews = news.slice(0, 3);
  const featuredScholarships = scholarships.slice(0, 3);
  const featuredAchievements = achievements.slice(0, 3);

  // Statistics (truthful active published registry counts)
  const totalInstitutions = publicInstitutions.length;
  const verifiedCount = publicInstitutions.filter((i) => i.verificationStatus === 'verified').length;
  const statesCoveredCount = new Set(
    publicInstitutions.map((i) => i.state).filter((s) => s && s !== 'Unspecified')
  ).size;
  const opportunitiesCount = scholarships.length;
  const achievementsCount = achievements.length;

  const fedUniCount = publicInstitutions.filter((i) => i.level === 'federal_university').length;
  const stateUniCount = publicInstitutions.filter((i) => i.level === 'state_university').length;
  const privUniCount = publicInstitutions.filter((i) => i.level === 'private_university').length;
  const polyCount = publicInstitutions.filter(
    (i) => i.level === 'polytechnic' || i.level === 'monotechnic'
  ).length;
  const coeCount = publicInstitutions.filter((i) => i.level === 'college_of_education').length;
  const secondaryCount = publicInstitutions.filter(
    (i) => i.level === 'secondary' || i.level === 'vocational'
  ).length;

  const categories = [
    {
      title: 'Federal Universities',
      level: 'federal_university',
      count: `${fedUniCount} Catalogued`,
      desc: 'Subsidized tertiary research universities established by the Federal Government of Nigeria.',
      icon: School,
    },
    {
      title: 'State Universities',
      level: 'state_university',
      count: `${stateUniCount} Catalogued`,
      desc: 'Autonomous state-funded institutions dedicated to regional industrial and educational development.',
      icon: Building2,
    },
    {
      title: 'Private Universities',
      level: 'private_university',
      count: `${privUniCount} Catalogued`,
      desc: 'NUC-licensed private institutions offering uninterrupted calendars and cutting-edge facilities.',
      icon: Sparkles,
    },
    {
      title: 'Polytechnics & Monotechnics',
      level: 'polytechnic',
      count: `${polyCount} Catalogued`,
      desc: 'Hands-on technical, vocational, and technological diploma programs (ND & HND).',
      icon: GraduationCap,
    },
    {
      title: 'Colleges of Education',
      level: 'college_of_education',
      count: `${coeCount} Catalogued`,
      desc: 'Foundational teacher-training and pedagogical diploma institutions awarding the NCE.',
      icon: BookOpen,
    },
    {
      title: 'Secondary & Unity Colleges',
      level: 'secondary',
      count: `${secondaryCount} Catalogued`,
      desc: 'Federal Unity Colleges, FSTCs, and premier secondary schools preparing students for WAEC, NECO, NABTEB & UTME.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        {/* Campus Imagery Overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="/src/assets/images/hero_nigerian_campus_1794428717056.jpg"
            alt="Prestigious Nigerian University Campus"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl">
            {/* Supertitle */}
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-3">
              <span>National Education Intelligence</span>
              <span className="text-slate-600">·</span>
              <span>All 36 States & FCT Abuja</span>
            </div>

            {/* Headline from brief */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-tight mb-5">
              Discover. Compare. Learn. Recognise.
            </h1>

            {/* Supporting text from brief */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
              Your gateway to discovering Nigerian schools, academic opportunities, educational achievements and the people shaping the future of education.
            </p>

            {/* Search and Filter Box */}
            <div className="bg-slate-900/90 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-slate-700/80 shadow-2xl">
              <form onSubmit={handleHeroSearch} className="flex flex-col md:flex-row gap-3">
                
                {/* Search Text Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search institution name, acronym (e.g. UNILAG, UI), or course..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Level Selector */}
                <div className="md:w-48">
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Education Levels</option>
                    <option value="federal_university">Federal University</option>
                    <option value="state_university">State University</option>
                    <option value="private_university">Private University</option>
                    <option value="polytechnic">Polytechnic</option>
                    <option value="college_of_education">College of Education</option>
                    <option value="secondary">Secondary School</option>
                    <option value="specialised_institution">Specialised Institution</option>
                  </select>
                </div>

                {/* State Selector */}
                <div className="md:w-44">
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All 36 States & FCT</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.zone.replace('South', 'S.').replace('North', 'N.')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Find Schools</span>
                </button>
              </form>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span className="text-slate-500">Popular inquiries:</span>
                <button
                  onClick={() => {
                    setSearchQuery('UNILAG');
                    setCurrentTab('schools');
                  }}
                  className="text-slate-300 hover:text-teal-300 transition-colors"
                >
                  UNILAG
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => {
                    setSearchQuery('University of Ibadan');
                    setCurrentTab('schools');
                  }}
                  className="text-slate-300 hover:text-teal-300 transition-colors"
                >
                  University of Ibadan
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => {
                    setSearchQuery('Covenant');
                    setCurrentTab('schools');
                  }}
                  className="text-slate-300 hover:text-teal-300 transition-colors"
                >
                  Covenant University
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => {
                    setSearchQuery('YABATECH');
                    setCurrentTab('schools');
                  }}
                  className="text-slate-300 hover:text-teal-300 transition-colors"
                >
                  Yaba Tech
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => {
                    setCurrentTab('admissions');
                  }}
                  className="text-teal-400 hover:underline"
                >
                  JAMB Cut-Offs 2026 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDUCATION STATISTICS STRIP (Truthful & Labelled Demonstration Baseline) */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              National Education Index Baseline
            </h3>
            <span className="text-[11px] text-slate-400">
              Figures represent verified database records + demonstration sample sets
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-2 md:pt-0">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {totalInstitutions}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Listed Institutions</div>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {statesCoveredCount} / 37
              </div>
              <div className="text-xs text-slate-500 mt-0.5">States Represented (36 + FCT Supported)</div>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <div className="text-2xl font-bold text-teal-700 tabular-nums">
                {verifiedCount}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Verified Institutions</div>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {opportunitiesCount}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Active Opportunities</div>
            </div>
            <div className="pt-2 md:pt-0 md:pl-6">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {achievementsCount}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Recorded Honors</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EDUCATION CATEGORIES */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Explore by Institutional Sector
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Browse higher education, technical colleges, and foundational academies across Nigeria.
            </p>
          </div>
          <button
            onClick={() => {
              setFilterLevel('all');
              setCurrentTab('schools');
            }}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View All Sectors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.level}
                onClick={() => handleCategoryClick(cat.level)}
                className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-medium">
                  <span>Explore Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED INSTITUTIONS */}
      <section className="py-12 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
                Verified Excellence
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Featured Institutions
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Accredited universities and colleges with verified academic faculties and admission guidelines.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('schools')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>Explore All {totalInstitutions} Schools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredInstitutions.map((inst) => {
              const bookmarked = isInWatchlist(inst.id);
              return (
                <div
                  key={inst.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header Image */}
                    <div className="relative h-44 bg-slate-800 overflow-hidden">
                      <img
                        src={inst.coverImageUrl || '/src/assets/images/campus_faculty_building_1794428718479.jpg'}
                        alt={inst.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Top Action Bookmark */}
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

                      {/* Title on image */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-2 text-[11px] text-teal-300 font-medium mb-1">
                          <span>
                            {inst.city}, {inst.state === 'FCT Abuja' ? 'FCT Abuja' : `${inst.state} State`}
                          </span>
                          <span>·</span>
                          <span>Est. {inst.establishmentYear}</span>
                        </div>
                        <h3 className="text-base font-bold leading-snug line-clamp-1">
                          {inst.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
                      <div className="flex items-center flex-wrap gap-x-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-700 capitalize">{inst.ownership}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{inst.level.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`flex items-center gap-1 font-medium ${
                          inst.verificationStatus === 'verified' ? 'text-teal-700' : 'text-amber-700'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{inst.verificationStatus === 'verified' ? 'Verified Status' : 'Pending Review'}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {inst.description}
                      </p>

                      {inst.admissionInfo && (
                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs">
                          <div className="flex justify-between items-center text-slate-600">
                            <span>UTME Cut-Off:</span>
                            <strong className="text-slate-900 font-mono tabular-nums">
                              {inst.admissionInfo.generalCutOffMark}+
                            </strong>
                          </div>
                          <div className="flex justify-between items-center text-slate-600 mt-1">
                            <span>Session:</span>
                            <span className="text-slate-700">{inst.admissionInfo.academicSession}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Link */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => openInstitutionProfile(inst.id)}
                      className="w-full py-2 px-3 text-xs font-semibold text-teal-700 hover:text-white bg-teal-50 hover:bg-teal-700 border border-teal-200 hover:border-teal-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Complete Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. LATEST EDUCATION NEWS & ADMISSIONS */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1 & 2: Editorial News */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
                  Journalism & Regulatory Circulars
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Education News & Insights
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('news')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {featuredNews.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setCurrentTab('news')}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer flex flex-col sm:flex-row gap-4 items-start"
                >
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full sm:w-36 h-28 object-cover rounded-lg shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 space-y-1.5">
                    {/* Zero-Pill Unboxed Metadata */}
                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
                      <span className="font-medium text-teal-700">{article.category}</span>
                      <span aria-hidden="true">·</span>
                      {article.institutionName && (
                        <>
                          <span>{article.institutionName}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 hover:text-teal-700 transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {article.summary}
                    </p>

                    <div className="pt-1 text-xs font-medium text-teal-700 flex items-center gap-1">
                      <span>Read Full Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Admissions & JAMB Fast Track */}
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
                Central Admissions (CAPS)
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Admissions & JAMB Desk
              </h2>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 border border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                  2026/2027 Guidelines
                </span>
                <h4 className="text-base font-bold">
                  Harmonized JAMB Cut-Off Benchmarks
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Compare general institutional minimums across Federal, State, and Private universities.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                {publicInstitutions
                  .filter((i) => i.admissionInfo)
                  .slice(0, 4)
                  .map((i) => (
                    <div
                      key={i.id}
                      onClick={() => openInstitutionProfile(i.id)}
                      className="flex justify-between items-center py-1 border-b border-slate-800/80 cursor-pointer hover:text-teal-300 transition-colors"
                    >
                      <span className="text-slate-300">{i.name}</span>
                      <span className="font-mono text-teal-400 tabular-nums">
                        {i.admissionInfo?.generalCutOffMark} Cut-Off
                      </span>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setCurrentTab('admissions')}
                className="w-full py-2 px-3 text-xs font-semibold text-center text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View All Cut-Offs & Guidance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Helper Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                Are you an Institution Registrar?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Publish your official academic calendar, post-UTME screening dates, and departmental quotas.
              </p>
              <button
                onClick={() => setCurrentTab('admin')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
              >
                <span>Access Institution Admin Portal</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 6. SCHOLARSHIPS AND OPPORTUNITIES */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
                Funding & Grants
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Scholarships & Educational Opportunities
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Verified funding opportunities from the Federal Government, multinational corporations, and foundations.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('scholarships')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>Explore All Scholarships</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredScholarships.map((sch) => (
              <div
                key={sch.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{sch.providerType}</span>
                    <span className="flex items-center gap-1 text-amber-700 font-mono tabular-nums">
                      <Clock className="w-3 h-3" />
                      <span>Closes {sch.deadline}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {sch.title}
                  </h3>

                  <div className="text-xs text-teal-800 font-medium">
                    {sch.coverage}
                  </div>

                  <ul className="text-xs text-slate-600 space-y-1 pt-1 list-disc list-inside">
                    {sch.eligibilityCriteria.slice(0, 2).map((crit, idx) => (
                      <li key={idx} className="line-clamp-1">{crit}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {sch.providerName}
                  </span>
                  <button
                    onClick={() => setCurrentTab('scholarships')}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. STUDENT EXCELLENCE & HONORS SPOTLIGHT */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">
                Academic Accolades
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Student & Researcher Excellence
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Celebrating outstanding Nigerian minds, global Olympiad winners, and world-class researchers.
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('students')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 mt-2 sm:mt-0"
            >
              <span>View All Honors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAchievements.map((ach) => (
              <div
                key={ach.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="text-teal-400 font-medium">{ach.institutionName}</span>
                  <span className="font-mono tabular-nums">{ach.year}</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{ach.recipientName}</h4>
                    <span className="text-xs text-slate-400">{ach.recipientRole} · {ach.field}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>{ach.title}</strong> — {ach.description}
                </p>

                <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Conferred by: {ach.awardBody}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. INSTITUTION REGISTRATION CALLOUT */}
      <section className="py-12 bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Does your institution have unlisted programs or new accreditation?
            </h3>
            <p className="text-xs sm:text-sm text-teal-100">
              Submit your school charter, NUC/NBTE/NCCE verification certificate, and official admission cut-offs directly to the registry.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('admin')}
            className="px-6 py-3 bg-white text-teal-900 font-semibold text-xs sm:text-sm rounded-lg hover:bg-teal-50 transition-colors shrink-0 shadow-lg"
          >
            Open Registrar Portal
          </button>
        </div>
      </section>

    </div>
  );
};
