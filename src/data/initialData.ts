import { Institution, NewsArticle, Scholarship, Achievement, AcademicResource, CommunityTopic } from '../types';
import { BATCH_INSTITUTIONS } from './registryBatches';

const CORE_BASELINE_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-ui',
    slug: 'university-of-ibadan',
    name: 'University of Ibadan',
    commonName: 'Premier University (UI)',
    acronym: 'UI',
    category: 'university',
    level: 'federal_university',
    ownership: 'Federal',
    state: 'Oyo',
    lga: 'Ibadan North',
    city: 'Ibadan',
    address: 'University Road, Agbowo, Ibadan, Oyo State',
    establishmentYear: 1948,
    motto: 'Recte Sapere Fons (To Think Straight is the Fount of Knowledge)',
    websiteUrl: 'https://ui.edu.ng',
    email: 'info@ui.edu.ng',
    phone: '+234 2 810 1100',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-15',
    verifiedAt: '2026-01-15T10:00:00Z',
    verifiedByName: 'EduSphere Verification Desk',
    publishedAt: '2026-01-15T10:30:00Z',
    publishedByName: 'EduSphere Editorial Board',
    chancellorOrPrincipal: 'Prof. Kayode O. Adebowale (Vice-Chancellor)',
    studentPopulationRange: '35,000 - 40,000',
    academicStaffCount: 1450,
    accreditationBody: 'National Universities Commission (NUC)',
    nationalRanking: 1,
    schoolFeesRange: '₦75,000 - ₦180,000 per session (Tuition-free Federal subsidy; municipal charges apply)',
    coverImageUrl: '/images/campus_faculty_building_1794428718479.jpg',
    description: 'Nigeria’s premier tertiary institution, founded in 1948 initially as University College Ibadan. Renowned for pioneering postgraduate research, medicine, arts, and foundational scientific inquiry in West Africa.',
    isFeatured: true,
    lastUpdated: '2026-02-10',
    sourceReference: {
      name: 'NUC & UI Senate Admissions Portal',
      url: 'https://admissions.ui.edu.ng',
      verificationDate: '2026-01-15',
      publisher: 'University of Ibadan Registry'
    },
    admissionInfo: {
      academicSession: '2025/2026',
      generalCutOffMark: 200,
      postUtmeFeeNaira: 2000,
      applicationDeadline: '2026-08-30',
      postUtmeExamDate: '2026-09-15',
      admissionPortalUrl: 'https://admissions.ui.edu.ng',
      directEntryInfo: 'Minimum of 2 A-Level passes, Upper Credit in ND from recognized polytechnics, or first degree with minimum second class lower.',
      guidelines: 'Candidates must score a minimum of 200 in the UTME and possess at least five (5) credit passes at SSCE (WAEC/NECO) including English Language and Mathematics in not more than two sittings.'
    },
    faculties: [
      {
        id: 'ui-fac-med',
        name: 'College of Medicine',
        deanName: 'Prof. Yinka Omigbodun',
        departments: [
          {
            id: 'ui-dept-mbbs',
            name: 'Medicine and Surgery',
            courses: [
              {
                id: 'ui-crs-mbbs',
                institutionId: 'inst-ui',
                name: 'Medicine and Surgery',
                code: 'MBBS',
                degreeType: 'MBBS',
                durationYears: 6,
                accreditationStatus: 'Full NUC & MDCN Accreditation',
                cutOffMark: 280,
                utmeSubjects: ['English', 'Biology', 'Chemistry', 'Physics'],
                oLevelRequirements: '5 Credits in English, Maths, Biology, Chemistry, Physics (1 sitting)',
                careerOpportunities: 'Clinical Practice, Global Health Research, Medical Academia, Health Policy'
              }
            ]
          },
          {
            id: 'ui-dept-pharm',
            name: 'Pharmacy & Therapeutics',
            courses: [
              {
                id: 'ui-crs-pharm',
                institutionId: 'inst-ui',
                name: 'Pharmacy',
                code: 'PHM',
                degreeType: 'Pharm.D',
                durationYears: 6,
                accreditationStatus: 'Full PCN Accreditation',
                cutOffMark: 260,
                utmeSubjects: ['English', 'Biology', 'Chemistry', 'Physics'],
                oLevelRequirements: '5 Credits at 1 sitting in science subjects'
              }
            ]
          }
        ]
      },
      {
        id: 'ui-fac-sci',
        name: 'Faculty of Science',
        deanName: 'Prof. G.O. Babalola',
        departments: [
          {
            id: 'ui-dept-csc',
            name: 'Computer Science',
            courses: [
              {
                id: 'ui-crs-csc',
                institutionId: 'inst-ui',
                name: 'Computer Science',
                code: 'CSC',
                degreeType: 'B.Sc.',
                durationYears: 4,
                accreditationStatus: 'Full NUC Accreditation',
                cutOffMark: 245,
                utmeSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                oLevelRequirements: '5 Credits including English, Mathematics, Physics and 2 other science subjects'
              }
            ]
          }
        ]
      }
    ],
    facilities: [
      { id: 'f-1', name: 'Kenneth Dike Library', category: 'Library', description: 'One of Tropical Africa’s richest academic research repositories with over 1.5 million bibliographic volumes and manuscripts.', verified: true },
      { id: 'f-2', name: 'University College Hospital (UCH) Clinical Labs', category: 'Laboratory', description: 'Premier clinical diagnostics and tertiary referral medical research center.', verified: true },
      { id: 'f-3', name: 'Awba Dam & Water Works Botanical Reserve', category: 'ICT', description: 'Ecological research reservoir and municipal hydrological testing facility.', verified: true }
    ],
    reviews: [
      { id: 'r-1', authorName: 'Dr. Chinedu Eze', authorRole: 'Alumnus', rating: 5, comment: 'Pinnacle of postgraduate research culture in Nigeria. Rigorous academic scrutiny and deep intellectual traditions.', date: '2026-01-20' },
      { id: 'r-2', authorName: 'Amina Bello', authorRole: 'Student', rating: 4, comment: 'Quiet, serene academic atmosphere. Kenneth Dike library is an incredible sanctuary for study.', date: '2026-02-04' }
    ]
  },
  {
    id: 'inst-unilag',
    slug: 'university-of-lagos',
    name: 'University of Lagos',
    commonName: 'UNILAG Akoka',
    acronym: 'UNILAG',
    category: 'university',
    level: 'federal_university',
    ownership: 'Federal',
    state: 'Lagos',
    lga: 'Lagos Mainland',
    city: 'Akoka, Yaba',
    address: 'University Road, Akoka, Yaba, Lagos State',
    establishmentYear: 1962,
    motto: 'In Deed and in Truth',
    websiteUrl: 'https://unilag.edu.ng',
    email: 'communicationunit@unilag.edu.ng',
    phone: '+234 1 280 2400',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-18',
    verifiedAt: '2026-01-18T14:30:00Z',
    verifiedByName: 'EduSphere Verification Desk',
    publishedAt: '2026-01-18T15:00:00Z',
    publishedByName: 'EduSphere Editorial Board',
    chancellorOrPrincipal: 'Prof. Folasade Ogunsola (Vice-Chancellor)',
    studentPopulationRange: '55,000 - 62,000',
    academicStaffCount: 1850,
    accreditationBody: 'National Universities Commission (NUC)',
    nationalRanking: 2,
    schoolFeesRange: '₦100,000 - ₦190,000 per session (Category-based municipal utility schedule)',
    coverImageUrl: '/images/hero_nigerian_campus_1794428717056.jpg',
    description: 'A metropolitan research powerhouse situated at the heart of Lagos commercial hub. Known as "The University of First Choice and the Nation\'s Pride", UNILAG leads in entrepreneurship, maritime law, fintech research, and media studies.',
    isFeatured: true,
    lastUpdated: '2026-02-14',
    admissionInfo: {
      academicSession: '2025/2026',
      generalCutOffMark: 200,
      postUtmeFeeNaira: 2000,
      applicationDeadline: '2026-08-25',
      postUtmeExamDate: '2026-09-08',
      admissionPortalUrl: 'https://admissions.unilag.edu.ng',
      directEntryInfo: 'Jupeb candidates require minimum 10-14 points depending on course cut-off.',
      guidelines: 'Candidates must have chosen UNILAG as their first choice institution and scored 200+ in the UTME. Candidates below 16 years of age by October 31st are ineligible.'
    },
    faculties: [
      {
        id: 'unilag-fac-eng',
        name: 'Faculty of Engineering',
        deanName: 'Prof. Obanishola Sadiq',
        departments: [
          {
            id: 'unilag-dept-elect',
            name: 'Electrical and Electronics Engineering',
            courses: [
              {
                id: 'unilag-crs-eee',
                institutionId: 'inst-unilag',
                name: 'Electrical and Electronics Engineering',
                code: 'EEE',
                degreeType: 'B.Sc.',
                durationYears: 5,
                accreditationStatus: 'Full NUC & COREN Accreditation',
                cutOffMark: 275,
                utmeSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry'],
                oLevelRequirements: '5 Credits in English, Maths, Physics, Chemistry, Further Maths or Technical Drawing'
              }
            ]
          },
          {
            id: 'unilag-dept-sys',
            name: 'Systems Engineering',
            courses: [
              {
                id: 'unilag-crs-sys',
                institutionId: 'inst-unilag',
                name: 'Systems Engineering',
                code: 'SYS',
                degreeType: 'B.Sc.',
                durationYears: 5,
                accreditationStatus: 'Full NUC & COREN Accreditation',
                cutOffMark: 265,
                utmeSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry']
              }
            ]
          }
        ]
      },
      {
        id: 'unilag-fac-law',
        name: 'Faculty of Law',
        deanName: 'Prof. Ige Bolodeoku',
        departments: [
          {
            id: 'unilag-dept-commlaw',
            name: 'Commercial and Industrial Law',
            courses: [
              {
                id: 'unilag-crs-law',
                institutionId: 'inst-unilag',
                name: 'Law',
                code: 'LAW',
                degreeType: 'LL.B',
                durationYears: 5,
                accreditationStatus: 'Council of Legal Education & NUC Accredited',
                cutOffMark: 282,
                utmeSubjects: ['English', 'Literature in English', 'CRK/IRS', 'Government']
              }
            ]
          }
        ]
      }
    ],
    facilities: [
      { id: 'f-u1', name: 'University of Lagos Main Library', category: 'Library', description: 'Central four-storey knowledge center overlooking the Lagos lagoon.', verified: true },
      { id: 'f-u2', name: 'UNILAG Artificial Intelligence & Robotics Lab', category: 'ICT', description: 'State-of-the-art computational lab funded by industry partners for autonomous systems and NLP.', verified: true }
    ],
    reviews: [
      { id: 'ru-1', authorName: 'Tunde Olawale', authorRole: 'Student', rating: 5, comment: 'The networking opportunities with Lagos industry executives and startup incubators are unmatched.', date: '2026-02-01' }
    ]
  },
  {
    id: 'inst-covenant',
    slug: 'covenant-university',
    name: 'Covenant University',
    commonName: 'Covenant (CU Ota)',
    acronym: 'CU',
    category: 'university',
    level: 'private_university',
    ownership: 'Private',
    state: 'Ogun',
    lga: 'Ado-Odo/Ota',
    city: 'Canaanland, Ota',
    address: 'KM 10 Idiroko Road, Canaanland, Ota, Ogun State',
    establishmentYear: 2002,
    motto: 'Raising a New Generation of Leaders',
    websiteUrl: 'https://covenantuniversity.edu.ng',
    email: 'registrar@covenantuniversity.edu.ng',
    phone: '+234 1 277 8800',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-22',
    verifiedAt: '2026-01-22T09:15:00Z',
    chancellorOrPrincipal: 'Dr. David Oyedepo (Chancellor)',
    studentPopulationRange: '9,000 - 12,000',
    academicStaffCount: 820,
    accreditationBody: 'National Universities Commission (NUC)',
    nationalRanking: 3,
    schoolFeesRange: '₦950,000 - ₦1,450,000 per session (Comprehensive inclusive package with accommodation)',
    coverImageUrl: '/images/hero_nigerian_campus_1794428717056.jpg',
    description: 'Premier private Christian institution renowned for uninterrupted academic calendars, world-class research citations in engineering and computer science, and pioneering leadership development curriculum.',
    isFeatured: true,
    lastUpdated: '2026-02-11',
    admissionInfo: {
      academicSession: '2025/2026',
      generalCutOffMark: 200,
      postUtmeFeeNaira: 7000,
      applicationDeadline: '2026-07-20',
      postUtmeExamDate: '2026-08-01',
      admissionPortalUrl: 'https://admportal.covenantuniversity.edu.ng',
      directEntryInfo: 'Direct entry into 200 Level available with verified JUPEB / Cambridge A-Levels.',
      guidelines: 'Candidates must complete the Covenant University Scholastic Aptitude Screening (CUSAS) and uphold ethical and spiritual development covenants.'
    },
    faculties: [
      {
        id: 'cu-fac-eng',
        name: 'College of Engineering',
        deanName: 'Prof. David Omole',
        departments: [
          {
            id: 'cu-dept-pet',
            name: 'Petroleum & Chemical Engineering',
            courses: [
              {
                id: 'cu-crs-che',
                institutionId: 'inst-covenant',
                name: 'Chemical Engineering',
                code: 'CHE',
                degreeType: 'B.Eng.',
                durationYears: 5,
                accreditationStatus: 'Full NUC & COREN Accreditation',
                cutOffMark: 220,
                utmeSubjects: ['English', 'Mathematics', 'Physics', 'Chemistry']
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'inst-abu',
    slug: 'ahmadu-bello-university',
    name: 'Ahmadu Bello University',
    commonName: 'ABU Zaria',
    acronym: 'ABU Zaria',
    category: 'university',
    level: 'federal_university',
    ownership: 'Federal',
    state: 'Kaduna',
    lga: 'Zaria',
    city: 'Samaru, Zaria',
    address: 'Sokoto Road, Samaru, Zaria, Kaduna State',
    establishmentYear: 1962,
    motto: 'Teaching, Learning, and Research for Humanity',
    websiteUrl: 'https://abu.edu.ng',
    email: 'info@abu.edu.ng',
    phone: '+234 69 550 581',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-10',
    verifiedAt: '2026-01-10T11:00:00Z',
    chancellorOrPrincipal: 'Prof. Kabiru Bala (Vice-Chancellor)',
    studentPopulationRange: '45,000 - 50,000',
    academicStaffCount: 1600,
    accreditationBody: 'National Universities Commission (NUC)',
    nationalRanking: 4,
    schoolFeesRange: '₦60,000 - ₦140,000 per session',
    coverImageUrl: '/images/library_students_abuja_1794428717988.jpg',
    description: 'The largest university in Sub-Saharan Africa by landmass and programme breadth, comprising 17 faculties and over 106 academic departments spanning agricultural research, veterinary medicine, nuclear science, and architecture.',
    isFeatured: true,
    lastUpdated: '2026-02-08',
    admissionInfo: {
      academicSession: '2025/2026',
      generalCutOffMark: 180,
      postUtmeFeeNaira: 2000,
      applicationDeadline: '2026-08-31',
      admissionPortalUrl: 'https://putme.abu.edu.ng',
      guidelines: 'Candidates must score 180+ in UTME (240+ for Medicine, Pharmacy, Law, Architecture).'
    }
  },
  {
    id: 'inst-lasu',
    slug: 'lagos-state-university',
    name: 'Lagos State University',
    commonName: 'LASU Ojo',
    acronym: 'LASU',
    category: 'university',
    level: 'state_university',
    ownership: 'State',
    state: 'Lagos',
    lga: 'Ojo',
    city: 'Ojo, Lagos',
    address: 'Badagry Expressway, Ojo, Lagos State',
    establishmentYear: 1983,
    motto: 'Per Discere Ad Astra (For learning to the stars)',
    websiteUrl: 'https://lasu.edu.ng',
    email: 'registrar@lasu.edu.ng',
    phone: '+234 1 854 7000',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-20',
    verifiedAt: '2026-01-20T12:00:00Z',
    chancellorOrPrincipal: 'Prof. Ibiyemi Olatunji-Bello (Vice-Chancellor)',
    studentPopulationRange: '30,000 - 38,000',
    academicStaffCount: 950,
    accreditationBody: 'National Universities Commission (NUC)',
    nationalRanking: 6,
    schoolFeesRange: '₦68,000 - ₦150,000 per session',
    coverImageUrl: '/images/campus_faculty_building_1794428718479.jpg',
    description: 'Top-tier state institution in Nigeria, celebrated for world-class faculty welfare, modern hybrid e-learning classrooms, and accredited professional faculties in medicine, communications, and transport studies.',
    isFeatured: false,
    lastUpdated: '2026-02-05',
    admissionInfo: {
      academicSession: '2025/2026',
      generalCutOffMark: 195,
      postUtmeFeeNaira: 2000,
      admissionPortalUrl: 'https://admissions.lasu.edu.ng',
      guidelines: 'LASU admission utilizes point-based screening combining UTME score and O-Level grades (A1=10, B2=9, etc.).'
    }
  },
  {
    id: 'inst-yabatech',
    slug: 'yaba-college-of-technology',
    name: 'Yaba College of Technology',
    commonName: 'Yaba Tech',
    acronym: 'YABATECH',
    category: 'polytechnic',
    level: 'polytechnic',
    ownership: 'Federal',
    state: 'Lagos',
    lga: 'Lagos Mainland',
    city: 'Yaba, Lagos',
    address: 'Herbert Macaulay Way, Yaba, Lagos State',
    establishmentYear: 1947,
    motto: 'First and Still the Best',
    websiteUrl: 'https://yabatech.edu.ng',
    email: 'info@yabatech.edu.ng',
    phone: '+234 1 280 2000',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-14',
    verifiedAt: '2026-01-14T08:00:00Z',
    chancellorOrPrincipal: 'Dr. Ibraheem Abdul (Rector)',
    studentPopulationRange: '22,000 - 26,000',
    academicStaffCount: 650,
    accreditationBody: 'National Board for Technical Education (NBTE)',
    nationalRanking: 1,
    schoolFeesRange: '₦38,000 - ₦75,000 per session',
    coverImageUrl: '/images/hero_nigerian_campus_1794428717056.jpg',
    description: 'Nigeria’s first higher educational institution, established in 1947. Renowned for technical craftsmanship, printing technology, industrial design, hospitality, and engineering diplomas.',
    isFeatured: true,
    lastUpdated: '2026-02-09',
    admissionInfo: {
      academicSession: '2025/2026',
      generalCutOffMark: 150,
      postUtmeFeeNaira: 2000,
      admissionPortalUrl: 'https://erp.yabatech.edu.ng',
      guidelines: 'Offers ND and HND programmes with NBTE accredited vocational and technological tracks.'
    }
  },
  {
    id: 'inst-futo',
    slug: 'federal-university-of-technology-owerri',
    name: 'Federal University of Technology, Owerri',
    commonName: 'FUTO',
    acronym: 'FUTO',
    category: 'university',
    level: 'federal_university',
    ownership: 'Federal',
    state: 'Imo',
    lga: 'Owerri West',
    city: 'Ihiagwa, Owerri',
    address: 'KM 10 Port Harcourt Road, Ihiagwa, Owerri, Imo State',
    establishmentYear: 1980,
    motto: 'Technology for Service',
    websiteUrl: 'https://futo.edu.ng',
    email: 'registrar@futo.edu.ng',
    phone: '+234 83 230 974',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-25',
    verifiedAt: '2026-01-25T10:00:00Z',
    chancellorOrPrincipal: 'Prof. Nnenna Oti (Vice-Chancellor)',
    studentPopulationRange: '25,000 - 28,000',
    academicStaffCount: 1100,
    accreditationBody: 'National Universities Commission (NUC)',
    nationalRanking: 7,
    schoolFeesRange: '₦65,000 - ₦130,000 per session',
    coverImageUrl: '/images/campus_faculty_building_1794428718479.jpg',
    description: 'The premier Federal University of Technology in Eastern Nigeria, renowned for oil & gas engineering, environmental technology, biomedical science, and agricultural innovation.',
    isFeatured: false,
    lastUpdated: '2026-02-01'
  },
  {
    id: 'inst-fcet',
    slug: 'federal-college-of-education-technical-akoka',
    name: 'Federal College of Education (Technical) Akoka',
    commonName: 'FCE(T) Akoka',
    acronym: 'FCET Akoka',
    category: 'college_of_education',
    level: 'college_of_education',
    ownership: 'Federal',
    state: 'Lagos',
    lga: 'Lagos Mainland',
    city: 'Akoka, Yaba',
    address: 'St. Finbarrs College Road, Akoka, Lagos State',
    establishmentYear: 1967,
    motto: 'Education for Self-Reliance',
    websiteUrl: 'https://fcetakoka.edu.ng',
    email: 'info@fcetakoka.edu.ng',
    phone: '+234 1 820 190',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-11',
    verifiedAt: '2026-01-11T16:00:00Z',
    chancellorOrPrincipal: 'Dr. Wahab Azeez (Provost)',
    studentPopulationRange: '8,000 - 10,000',
    accreditationBody: 'National Commission for Colleges of Education (NCCE)',
    schoolFeesRange: '₦32,000 - ₦60,000 per session',
    description: 'The oldest technical teachers training college in Nigeria, preparing educators in vocational, science, and technical education across secondary and technical schools.',
    lastUpdated: '2026-01-28'
  },
  {
    id: 'inst-kingscollege',
    slug: 'kings-college-lagos',
    name: 'King’s College, Lagos',
    commonName: 'King’s College',
    acronym: 'KC Lagos',
    category: 'secondary_school',
    level: 'secondary',
    ownership: 'Federal',
    state: 'Lagos',
    lga: 'Lagos Island',
    city: 'Lagos Island',
    address: '3 Catholic Mission Street, Lagos Island, Lagos State',
    establishmentYear: 1909,
    motto: 'Floreat Collegium (May the College Flourish)',
    websiteUrl: 'https://kingscollegelagos.sch.ng',
    email: 'info@kingscollegelagos.sch.ng',
    phone: '+234 1 263 2038',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-05',
    verifiedAt: '2026-01-05T09:00:00Z',
    chancellorOrPrincipal: 'Ali Andrew Agada (Principal)',
    studentPopulationRange: '3,000 - 3,500',
    accreditationBody: 'Federal Ministry of Education / WAEC / NECO',
    schoolFeesRange: '₦45,000 - ₦90,000 per term (Boarding subsidies apply)',
    coverImageUrl: '/images/campus_faculty_building_1794428718479.jpg',
    description: 'Nigeria’s premier Federal Unity boys college, founded in 1909. Alma mater to historic Nigerian statesmen, justices, scientists, and scholars.',
    lastUpdated: '2026-01-30'
  },
  {
    id: 'inst-loyola',
    slug: 'loyola-jesuit-college-abuja',
    name: 'Loyola Jesuit College',
    commonName: 'LJC Abuja',
    acronym: 'LJC',
    category: 'secondary_school',
    level: 'secondary',
    ownership: 'Private',
    state: 'FCT Abuja',
    lga: 'Bwari',
    city: 'Gidan Mangoro, Karu-Karshi',
    address: 'Karshi Road, Gidan Mangoro, FCT Abuja',
    establishmentYear: 1996,
    motto: 'Ad Majorem Dei Gloriam (For the Greater Glory of God)',
    websiteUrl: 'https://loyolajesuit.org',
    email: 'info@loyolajesuit.org',
    phone: '+234 9 780 7401',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-29',
    verifiedAt: '2026-01-29T10:00:00Z',
    studentPopulationRange: '600 - 700',
    accreditationBody: 'WAEC / NECO / Cambridge International',
    schoolFeesRange: 'Confidential / Full boarding fee schedule upon entrance assessment',
    description: 'Premier co-educational Jesuit boarding school renowned for consistently producing Nigeria’s highest WAEC and UTME aggregate scores nationwide.',
    lastUpdated: '2026-02-08'
  },
  {
    id: 'inst-nls',
    slug: 'nigerian-law-school',
    name: 'Nigerian Law School (Bwari Headquarters)',
    commonName: 'Nigerian Law School',
    acronym: 'NLS',
    category: 'specialised_institution',
    level: 'specialised_institution',
    ownership: 'Federal',
    state: 'FCT Abuja',
    lga: 'Bwari',
    city: 'Bwari, Abuja',
    address: 'Nigerian Law School Road, Bwari, FCT Abuja',
    establishmentYear: 1962,
    motto: 'For Knowledge and Justice',
    websiteUrl: 'https://lawschool.gov.ng',
    email: 'info@lawschool.gov.ng',
    phone: '+234 9 780 0012',
    verificationStatus: 'verified',
    publicationStatus: 'published',
    isArchived: false,
    createdAt: '2026-01-12',
    verifiedAt: '2026-01-12T11:00:00Z',
    chancellorOrPrincipal: 'Prof. Isa Hayatu Chiroma (Director-General)',
    studentPopulationRange: '6,000 - 7,500',
    accreditationBody: 'Council of Legal Education',
    schoolFeesRange: '₦296,000 per Bar Part II Vocational Session',
    description: 'Statutory professional vocational institution providing mandatory practical training for qualifying law graduates seeking admission to the Nigerian Bar.',
    lastUpdated: '2026-02-03'
  }
];

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export const INITIAL_INSTITUTIONS: Institution[] = (() => {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenNames = new Set<string>();
  const merged: Institution[] = [];

  for (const inst of [...CORE_BASELINE_INSTITUTIONS, ...BATCH_INSTITUTIONS]) {
    const normName = normalizeKey(inst.name);
    if (seenIds.has(inst.id) || seenSlugs.has(inst.slug) || seenNames.has(normName)) {
      continue;
    }
    seenIds.add(inst.id);
    seenSlugs.add(inst.slug);
    seenNames.add(normName);
    merged.push(inst);
  }
  return merged;
})();

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    institutionId: 'inst-unilag',
    institutionName: 'University of Lagos',
    title: 'UNILAG Senate Approves Dual-Degree Engineering Programme with Global Research Consortia',
    slug: 'unilag-senate-approves-dual-degree-engineering',
    summary: 'The University of Lagos Senate has formalized a collaborative dual-degree pathway allowing engineering students to conduct joint capstone dissertations.',
    content: 'At its 560th regular meeting, the Senate of the University of Lagos approved an expanded framework for undergraduate and postgraduate dual awards in systems engineering and clean energy technologies. The initiative includes reciprocal laboratory rotations and collaborative faculty teaching across renewable microgrid engineering.',
    category: 'Academic Calendar',
    publishedAt: '2026-02-12T09:00:00Z',
    imageUrl: '/images/campus_faculty_building_1794428718479.jpg',
    readTime: '3 min read',
    isPublished: true
  },
  {
    id: 'news-2',
    title: 'JAMB Announces Harmonized 2026/2027 Central Admissions Processing System (CAPS) Benchmarks',
    slug: 'jamb-caps-benchmarks-2026',
    summary: 'The Joint Admissions and Matriculation Board releases compliance directives for tertiary institution cut-off criteria across Federal, State, and Private universities.',
    content: 'The Registrar of JAMB, Prof. Is-haq Oloyede, reiterated that no tertiary institution is permitted to admit candidates outside the Central Admissions Processing System (CAPS). Institutions have submitted their baseline cut-off marks, with federal universities setting general thresholds between 180 and 200.',
    category: 'Admissions',
    publishedAt: '2026-02-10T14:30:00Z',
    imageUrl: '/images/library_students_abuja_1794428717988.jpg',
    readTime: '4 min read',
    isPublished: true
  },
  {
    id: 'news-3',
    institutionId: 'inst-ui',
    institutionName: 'University of Ibadan',
    title: 'University of Ibadan Research Consortium Secures $1.4M Grant for Tropical Epidemiology Modeling',
    slug: 'ui-research-consortium-grant-epidemiology',
    summary: 'Multidisciplinary research team at UI College of Medicine receives international grant to advance vector surveillance across the Niger Delta and Lake Chad basins.',
    content: 'Led by senior epidemiologists at the Kenneth Dike Institute, the grant will support 12 doctoral research fellows and deploy solar-powered field diagnostics in underserved rural health zones.',
    category: 'Research',
    publishedAt: '2026-02-07T11:15:00Z',
    imageUrl: '/images/nigerian_student_researcher_1794428719416.jpg',
    readTime: '5 min read',
    isPublished: true
  },
  {
    id: 'news-4',
    title: 'NUC Releases Phase-Two Guidelines for Transnational Education and Online Degree Accreditation',
    slug: 'nuc-transnational-education-guidelines',
    summary: 'National Universities Commission issues guidelines ensuring strict parity of esteem for digital learning and branch campuses across Nigerian states.',
    content: 'The regulatory document outlines rigorous standards for ICT infrastructure, instructor-to-student ratios, physical proctoring centers, and laboratory simulations for digital STEM degrees.',
    category: 'Policy',
    publishedAt: '2026-02-02T16:00:00Z',
    readTime: '4 min read',
    isPublished: true
  }
];

export const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'sch-1',
    title: 'Federal Government Bilateral Education Agreement (BEA) Awards',
    providerName: 'Federal Ministry of Education / Federal Scholarship Board',
    providerType: 'Federal Government',
    educationLevels: ['Undergraduate (100L)', 'Postgraduate (Masters & PhD)'],
    coverage: 'Full Tuition, Health Cover & Monthly Living Stipend',
    amountDescription: 'Fully funded tuition, international transport, and overseas maintenance allowances',
    eligibilityCriteria: [
      'Minimum of 5 Distinctions (As & Bs) in WAEC/NECO at one sitting including English and Mathematics',
      'For Postgraduate: Minimum of First Class or Second Class Upper honours degree',
      'Age limit: 17 - 20 years for Undergraduate; under 35 for Masters, under 40 for PhD',
      'Nigerian citizenship with valid National Identity Number (NIN)'
    ],
    targetStates: [], // All 36 states & FCT
    deadline: '2026-03-31',
    applicationUrl: 'https://education.gov.ng/fsb',
    isVerified: true
  },
  {
    id: 'sch-2',
    title: 'MTN Foundation Science & Technology Scholarship Scheme (Phase 14)',
    providerName: 'MTN Nigeria Foundation',
    providerType: 'Corporate Foundation',
    educationLevels: ['Undergraduate (300L/HND 1)'],
    coverage: 'Annual Academic Grant (₦300,000 per session until graduation)',
    amountDescription: '₦300,000 disbursed annually subject to maintaining CGPA threshold',
    eligibilityCriteria: [
      'Currently enrolled in 300 Level in a Federal or State university, or 200 Level in polytechnics',
      'Enrolled in Science, Technology, Engineering, Mathematics, or Blind Student disciplines',
      'Minimum CGPA of 3.5 out of 5.0 (or Second Class Upper equivalent)'
    ],
    deadline: '2026-04-15',
    applicationUrl: 'https://www.mtn.ng/scholarships',
    isVerified: true
  },
  {
    id: 'sch-3',
    title: 'NLNG Undergraduate Scholarship Scheme',
    providerName: 'Nigeria LNG Limited',
    providerType: 'Corporate Foundation',
    educationLevels: ['Undergraduate (100L)'],
    coverage: 'Educational Stipend (₦200,000 per session)',
    eligibilityCriteria: [
      'Admitted into 100 Level in any NUC-accredited Nigerian university',
      'Minimum of 5 credits in SSCE in one sitting',
      'Minimum UTME score of 200',
      'Not a beneficiary of any other corporate or institutional scholarship'
    ],
    deadline: '2026-05-10',
    applicationUrl: 'https://www.nigerialng.com/our-communities/scholarships',
    isVerified: true
  },
  {
    id: 'sch-4',
    title: 'Petroleum Technology Development Fund (PTDF) In-Country Scholarship Scheme',
    providerName: 'Petroleum Technology Development Fund',
    providerType: 'Federal Government',
    educationLevels: ['Undergraduate (200L)', 'M.Sc.', 'Ph.D.'],
    coverage: 'Tuition Fees, Laptop Grant & Accommodation Allowance',
    eligibilityCriteria: [
      'Undergraduate: Completed 100L with CGPA ≥ 3.5 in oil/gas, energy, or geological disciplines',
      'Possession of valid local government origin certificate',
      'Clear commitment to national energy transition research'
    ],
    deadline: '2026-04-30',
    applicationUrl: 'https://scholarship.ptdf.gov.ng',
    isVerified: true
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    institutionId: 'inst-unilag',
    institutionName: 'University of Lagos',
    recipientName: 'Kemi Adeyemi & Team EcoPower',
    recipientRole: 'Student',
    title: 'Grand Winner — Shell Eco-Marathon Africa Clean Urban Vehicle Design',
    awardBody: 'Shell Global Engineering Innovation Directorate',
    year: 2025,
    field: 'Mechanical & Automotive Engineering',
    description: 'Designed an energy-efficient ultra-light electric prototype utilizing recycled Nigerian agricultural composite fibers, achieving 380 km per kilowatt-hour.',
    verificationStatus: 'verified'
  },
  {
    id: 'ach-2',
    institutionId: 'inst-covenant',
    institutionName: 'Covenant University',
    recipientName: 'Prof. David Olusanya',
    recipientRole: 'Lecturer',
    title: 'Top 2% Most Cited Scientists Worldwide in Distributed Computing',
    awardBody: 'Stanford University & Elsevier Science Metrics',
    year: 2025,
    field: 'Computer Science & Distributed Systems',
    description: 'Published over 45 peer-reviewed works in algorithmic load balancing and decentralized fault tolerance in edge networks.',
    verificationStatus: 'verified'
  },
  {
    id: 'ach-3',
    institutionId: 'inst-ui',
    institutionName: 'University of Ibadan',
    recipientName: 'Dr. Fatima Umar',
    recipientRole: 'Researcher',
    title: 'L’Oréal-UNESCO For Women in Science Sub-Saharan Africa Fellow',
    awardBody: 'UNESCO & L’Oréal Corporate Foundation',
    year: 2025,
    field: 'Molecular Genetics & Crop Resilience',
    description: 'Breakthrough identification of drought-resistant alleles in indigenous Nigerian sorghum cultivars, published in Nature Plants.',
    verificationStatus: 'verified'
  }
];

export const INITIAL_RESOURCES: AcademicResource[] = [
  {
    id: 'res-1',
    title: 'Official JAMB 2026 Integrated Brochure & Syllabus (Unified Tertiary Matriculation Examination)',
    category: 'JAMB Syllabus',
    educationLevel: 'Tertiary Entrance',
    targetSubject: 'All Subjects (Sciences, Arts, Social Sciences, Commercial)',
    fileFormat: 'PDF (2.4 MB)',
    downloadCount: 14280,
    verifiedBy: 'Joint Admissions and Matriculation Board'
  },
  {
    id: 'res-2',
    title: 'NUC Core Curriculum and Minimum Academic Standards (CCMAS) Engineering Benchmark',
    category: 'Curriculum Benchmark',
    educationLevel: 'University Undergraduate',
    targetSubject: 'Engineering & Technology Disciplines',
    fileFormat: 'PDF (4.8 MB)',
    downloadCount: 5120,
    verifiedBy: 'National Universities Commission'
  },
  {
    id: 'res-3',
    title: 'Universal WAEC Senior Secondary School Examination Syllabi & Practical Marking Schemes',
    category: 'Past Questions',
    educationLevel: 'Senior Secondary (SS3)',
    targetSubject: 'Mathematics, English, Physics, Chemistry, Biology, Economics',
    fileFormat: 'PDF (3.1 MB)',
    downloadCount: 22100,
    verifiedBy: 'West African Examinations Council'
  }
];

export const INITIAL_COMMUNITY_TOPICS: CommunityTopic[] = [
  {
    id: 'top-1',
    title: 'How to calculate your aggregate score for UNILAG Post-UTME 2026/2027 screening',
    authorName: 'Ibrahim Danladi',
    authorRole: 'student',
    category: 'Admission Advice',
    repliesCount: 38,
    viewsCount: 1240,
    lastActivity: '12 minutes ago'
  },
  {
    id: 'top-2',
    title: 'Federal Scholarship Board (BEA) Russian & Hungarian bilateral interview preparation tips',
    authorName: 'Dr. Grace Okonkwo',
    authorRole: 'lecturer',
    category: 'Scholarships',
    repliesCount: 52,
    viewsCount: 2890,
    lastActivity: '1 hour ago'
  },
  {
    id: 'top-3',
    title: 'Navigating JAMB CAPS "Transfer Approval" without losing your primary course choice',
    authorName: 'Babatunde Alabi',
    authorRole: 'super_admin',
    category: 'JAMB Prep',
    repliesCount: 84,
    viewsCount: 4610,
    lastActivity: '3 hours ago'
  }
];
