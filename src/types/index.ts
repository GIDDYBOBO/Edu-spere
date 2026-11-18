export type UserRole =
  | 'super_admin'
  | 'institution_admin'
  | 'editor'
  | 'contributor'
  | 'student'
  | 'parent'
  | 'lecturer';

export type InstitutionCategory =
  | 'university'
  | 'polytechnic'
  | 'college_of_education'
  | 'monotechnic'
  | 'technical_vocational'
  | 'secondary_school'
  | 'primary_school'
  | 'specialised_institution';

export type InstitutionLevel =
  | 'primary'
  | 'secondary'
  | 'vocational'
  | 'polytechnic'
  | 'monotechnic'
  | 'college_of_education'
  | 'federal_university'
  | 'state_university'
  | 'private_university'
  | 'specialised_institution';

export type OwnershipType =
  | 'Federal'
  | 'State'
  | 'Private'
  | 'Missionary'
  | 'Community';

export type VerificationStatus =
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'rejected'
  | 'unverified'
  | 'flagged';

export type PublicationStatus =
  | 'unpublished'
  | 'published'
  | 'archived';

export interface Course {
  id: string;
  institutionId: string;
  name: string;
  code?: string;
  degreeType: string; // 'B.Sc.', 'B.Eng.', 'MBBS', 'HND', 'ND', 'NCE', 'SSCE'
  durationYears: number;
  accreditationStatus: string;
  cutOffMark?: number;
  utmeSubjects?: string[];
  oLevelRequirements?: string;
  directEntryRequirements?: string;
  careerOpportunities?: string;
}

export interface Department {
  id: string;
  name: string;
  headOfDepartment?: string;
  courses: Course[];
}

export interface Faculty {
  id: string;
  name: string;
  deanName?: string;
  departments: Department[];
}

export interface AdmissionInfo {
  academicSession: string;
  generalCutOffMark: number;
  postUtmeFeeNaira?: number;
  applicationDeadline?: string;
  postUtmeExamDate?: string;
  admissionPortalUrl?: string;
  directEntryInfo?: string;
  guidelines: string;
}

export interface Facility {
  id: string;
  name: string;
  category: 'Library' | 'Laboratory' | 'Sports' | 'Hostel' | 'ICT' | 'Medical' | 'Auditorium';
  description: string;
  verified: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: 'Student' | 'Alumnus' | 'Parent' | 'Lecturer';
  rating: number; // 1-5
  comment: string;
  date: string;
  academicYear?: string;
}

export interface SourceReference {
  name: string;
  url?: string;
  verificationDate?: string;
  publisher?: string;
}

export interface VerificationRecord {
  id: string;
  institutionId: string;
  status: VerificationStatus;
  reviewerName: string;
  reviewerEmail?: string;
  sourceUsed: string;
  notes?: string;
  changesSummary?: string;
  timestamp: string;
}

export interface DataReport {
  id: string;
  institutionId: string;
  institutionName: string;
  category: 'Cut-Off Mark' | 'Accreditation' | 'Fees Schedule' | 'Contact / Portal URL' | 'Faculty / Course' | 'Other';
  details: string;
  suggestedCorrection?: string;
  reportedByEmail: string;
  reportedByName: string;
  timestamp: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  adminNotes?: string;
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  commonName?: string;
  acronym: string;
  category: InstitutionCategory;
  level: InstitutionLevel;
  ownership: OwnershipType;
  state: string;
  lga: string;
  city: string;
  address: string;
  establishmentYear: number;
  motto: string;
  websiteUrl: string;
  email: string;
  phone: string;
  logoUrl?: string;
  coverImageUrl?: string;
  verificationStatus: VerificationStatus;
  publicationStatus: PublicationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verificationNotes?: string;
  publishedAt?: string;
  publishedBy?: string;
  publishedByName?: string;
  archivedAt?: string;
  archivedBy?: string;
  isArchived?: boolean;
  createdAt?: string;
  createdBy?: string;
  createdByName?: string;
  updatedBy?: string;
  updatedByName?: string;
  chancellorOrPrincipal?: string;
  studentPopulationRange?: string;
  academicStaffCount?: number;
  accreditationBody: string;
  accreditationStatus?: string;
  accreditationReference?: string;
  nationalRanking?: number;
  description: string;
  isFeatured?: boolean;
  schoolFeesRange?: string;
  sourceReference?: SourceReference;
  verificationHistory?: VerificationRecord[];
  formerNames?: string[];
  successorName?: string;
  isHistorical?: boolean;
  operationalStatusNote?: string;
  faculties?: Faculty[];
  admissionInfo?: AdmissionInfo;
  facilities?: Facility[];
  reviews?: Review[];
  lastUpdated: string;
}

export interface NewsArticle {
  id: string;
  institutionId?: string;
  institutionName?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'Admissions' | 'Academic Calendar' | 'Research' | 'Convocation' | 'Policy' | 'Scholarships';
  publishedAt: string;
  imageUrl?: string;
  readTime: string;
  isPublished: boolean;
}

export interface Scholarship {
  id: string;
  title: string;
  providerName: string;
  providerType: 'Federal Government' | 'State Government' | 'Corporate Foundation' | 'International Agency' | 'Alumni';
  educationLevels: string[];
  coverage: string;
  amountDescription?: string;
  eligibilityCriteria: string[];
  targetStates?: string[];
  deadline: string;
  applicationUrl: string;
  isVerified: boolean;
}

export interface Achievement {
  id: string;
  institutionId: string;
  institutionName: string;
  recipientName: string;
  recipientRole: 'Student' | 'Lecturer' | 'Researcher' | 'Institutional Team';
  title: string;
  awardBody: string;
  year: number;
  description: string;
  verificationStatus: VerificationStatus;
  field: string;
}

export interface AcademicResource {
  id: string;
  title: string;
  category: 'JAMB Syllabus' | 'Past Questions' | 'Post-UTME Guide' | 'Curriculum Benchmark' | 'Research Repository';
  educationLevel: string;
  targetSubject: string;
  fileFormat: string;
  downloadCount: number;
  verifiedBy: string;
}

export interface CommunityTopic {
  id: string;
  title: string;
  authorName: string;
  authorRole: UserRole;
  category: 'JAMB Prep' | 'Admission Advice' | 'Campus Life' | 'Scholarships' | 'Postgraduate Study';
  repliesCount: number;
  viewsCount: number;
  lastActivity: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorName?: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  stateOfOrigin?: string;
  institutionId?: string;
  savedInstitutionIds: string[];
}
