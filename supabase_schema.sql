-- ====================================================================
-- EDUSPHERE NIGERIA - STAGE 2 DATABASE & BACKEND SCHEMA
-- Target Database: PostgreSQL 15+ (Supabase)
-- Nationwide Institution Registry, Verification, Publication & Audit Schema
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'super_admin',
    'institution_admin',
    'editor',
    'contributor',
    'student',
    'parent',
    'lecturer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE institution_category AS ENUM (
    'university',
    'polytechnic',
    'college_of_education',
    'monotechnic',
    'technical_vocational',
    'secondary_school',
    'primary_school',
    'specialised_institution'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE institution_level AS ENUM (
    'primary',
    'secondary',
    'vocational',
    'polytechnic',
    'monotechnic',
    'college_of_education',
    'federal_university',
    'state_university',
    'private_university',
    'specialised_institution'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ownership_type AS ENUM (
    'Federal',
    'State',
    'Private',
    'Missionary',
    'Community'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM (
    'draft',
    'pending_verification',
    'verified',
    'rejected',
    'unverified',
    'flagged'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE publication_status AS ENUM (
    'unpublished',
    'published',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Supabase auth.users profile extension)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone_number TEXT,
  role user_role NOT NULL DEFAULT 'student',
  state_of_origin TEXT,
  bio TEXT,
  institution_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. INSTITUTIONS TABLE (Normalized Core Registry)
CREATE TABLE IF NOT EXISTS public.institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  common_name TEXT,
  acronym TEXT,
  category institution_category NOT NULL DEFAULT 'university',
  level institution_level NOT NULL,
  ownership ownership_type NOT NULL,
  state TEXT NOT NULL,
  lga TEXT,
  city TEXT NOT NULL,
  address TEXT,
  establishment_year INTEGER,
  motto TEXT,
  website_url TEXT,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  verification_status verification_status NOT NULL DEFAULT 'draft',
  publication_status publication_status NOT NULL DEFAULT 'unpublished',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  verified_by_name TEXT,
  verification_source TEXT,
  verification_notes TEXT,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES public.profiles(id),
  published_by_name TEXT,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_by_name TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_by_name TEXT,
  chancellor_or_principal TEXT,
  student_population_range TEXT,
  academic_staff_count INTEGER,
  accreditation_body TEXT DEFAULT 'Pending Regulatory Review',
  accreditation_status TEXT,
  accreditation_reference TEXT,
  national_ranking INTEGER,
  school_fees_range TEXT,
  source_reference_name TEXT,
  source_reference_url TEXT,
  former_names TEXT[],
  successor_name TEXT,
  is_historical BOOLEAN NOT NULL DEFAULT false,
  operational_status_note TEXT,
  description TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Safe migrations if running against an existing Stage 1 database
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS common_name TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS category institution_category NOT NULL DEFAULT 'university';
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS publication_status publication_status NOT NULL DEFAULT 'unpublished';
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS verified_by_name TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS verification_source TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS published_by_name TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS updated_by_name TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS accreditation_status TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS accreditation_reference TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS school_fees_range TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS source_reference_name TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS source_reference_url TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS former_names TEXT[];
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS successor_name TEXT;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS is_historical BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.institutions ADD COLUMN IF NOT EXISTS operational_status_note TEXT;

-- 5. INSTITUTION MEMBERS (Scoped Institution Administration)
CREATE TABLE IF NOT EXISTS public.institution_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  is_authorized BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(institution_id, profile_id)
);

-- 6. FACULTIES / COLLEGES
CREATE TABLE IF NOT EXISTS public.faculties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dean_name TEXT,
  description TEXT,
  established_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  head_of_department TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. COURSES & PROGRAMMES
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  degree_type TEXT NOT NULL,
  duration_years INTEGER NOT NULL DEFAULT 4,
  accreditation_status TEXT DEFAULT 'Pending Accreditation Verification',
  cut_off_mark INTEGER,
  utme_subjects TEXT[],
  o_level_requirements TEXT,
  direct_entry_requirements TEXT,
  career_opportunities TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ADMISSION REQUIREMENTS & CUT-OFFS
CREATE TABLE IF NOT EXISTS public.admission_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  academic_session TEXT NOT NULL,
  general_cut_off_mark INTEGER NOT NULL,
  post_utme_fee_naira NUMERIC(10,2),
  application_deadline DATE,
  post_utme_date DATE,
  admission_portal_url TEXT,
  direct_entry_info TEXT,
  special_waivers TEXT,
  guidelines TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. CAMPUS FACILITIES
CREATE TABLE IF NOT EXISTS public.campus_facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. INSTITUTION REVIEWS
CREATE TABLE IF NOT EXISTS public.institution_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  academic_year TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. NEWS & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. SCHOLARSHIPS & OPPORTUNITIES
CREATE TABLE IF NOT EXISTS public.scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL,
  education_level TEXT[] NOT NULL,
  coverage TEXT NOT NULL,
  amount_description TEXT,
  eligibility_criteria TEXT NOT NULL,
  target_states TEXT[],
  deadline DATE NOT NULL,
  application_url TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. ACADEMIC ACHIEVEMENTS & STUDENT RECOGNITION
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_role TEXT NOT NULL,
  title TEXT NOT NULL,
  award_body TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'verified',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. VERIFICATION RECORDS (Institutional Verification History)
CREATE TABLE IF NOT EXISTS public.verification_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewer_name TEXT,
  source_used TEXT,
  changes_summary TEXT,
  document_url TEXT,
  document_type TEXT,
  status verification_status NOT NULL DEFAULT 'pending_verification',
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.verification_records ADD COLUMN IF NOT EXISTS reviewer_name TEXT;
ALTER TABLE public.verification_records ADD COLUMN IF NOT EXISTS source_used TEXT;
ALTER TABLE public.verification_records ADD COLUMN IF NOT EXISTS changes_summary TEXT;

-- 16. SAVED INSTITUTIONS (User Watchlist)
CREATE TABLE IF NOT EXISTS public.saved_institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(profile_id, institution_id)
);

-- 17. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. AUDIT LOGS (Immutable Governance History — never store passwords or tokens)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id),
  actor_email TEXT,
  actor_name TEXT,
  actor_role user_role,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS actor_name TEXT;
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS details TEXT;

-- 19. DATA ACCURACY REPORTS (Public Corrections Queue)
CREATE TABLE IF NOT EXISTS public.data_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT NOT NULL,
  suggested_correction TEXT,
  reported_by_email TEXT NOT NULL,
  reported_by_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE & SEARCH
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_institutions_category ON public.institutions(category);
CREATE INDEX IF NOT EXISTS idx_institutions_level ON public.institutions(level);
CREATE INDEX IF NOT EXISTS idx_institutions_state ON public.institutions(state);
CREATE INDEX IF NOT EXISTS idx_institutions_ownership ON public.institutions(ownership);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(verification_status);
CREATE INDEX IF NOT EXISTS idx_institutions_pub_status ON public.institutions(publication_status, is_archived);
CREATE INDEX IF NOT EXISTS idx_institutions_updated ON public.institutions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_inst_id ON public.courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_news_published ON public.news_articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_saved_profile ON public.saved_institutions(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_inst ON public.verification_records(institution_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_institutions_name_trgm ON public.institutions USING gin (name gin_trgm_ops);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & SECURITY HARDENING
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_reports ENABLE ROW LEVEL SECURITY;

-- Prevent institution_admin from self-verifying or self-publishing at the DB layer
CREATE OR REPLACE FUNCTION public.enforce_institution_governance()
RETURNS TRIGGER AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  IF v_role IS DISTINCT FROM 'super_admin' THEN
    IF NEW.verification_status IN ('verified', 'rejected') AND NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
      RAISE EXCEPTION 'Only Super Administrators can verify or reject institution records.';
    END IF;
    IF NEW.publication_status IS DISTINCT FROM OLD.publication_status THEN
      RAISE EXCEPTION 'Only Super Administrators can publish, unpublish, or archive institutions.';
    END IF;
    IF NEW.is_archived IS DISTINCT FROM OLD.is_archived THEN
      RAISE EXCEPTION 'Only Super Administrators can archive or restore institutions.';
    END IF;
  END IF;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_institution_governance ON public.institutions;
CREATE TRIGGER trg_enforce_institution_governance
  BEFORE UPDATE ON public.institutions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_institution_governance();

-- 1. PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. INSTITUTIONS POLICIES (Strict public published visibility, scoped admin write)
DROP POLICY IF EXISTS "Public institutions are viewable by everyone" ON public.institutions;
CREATE POLICY "Public can view only published non-archived institutions"
  ON public.institutions FOR SELECT USING (
    (publication_status = 'published' AND is_archived = false)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = institutions.id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

DROP POLICY IF EXISTS "Super admins can insert/update/delete any institution" ON public.institutions;
CREATE POLICY "Super admins have full governance over institutions"
  ON public.institutions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "Institution admins can update their assigned institution" ON public.institutions;
CREATE POLICY "Institution admins can update their assigned institution"
  ON public.institutions FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = institutions.id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

-- 3. FACULTIES, DEPARTMENTS, COURSES, FACILITIES, REVIEWS & ADMISSIONS POLICIES
DROP POLICY IF EXISTS "Public can view faculties" ON public.faculties;
CREATE POLICY "Public can view faculties of published institutions"
  ON public.faculties FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.institutions i
      WHERE i.id = faculties.institution_id AND i.publication_status = 'published' AND i.is_archived = false
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'institution_admin'))
  );

DROP POLICY IF EXISTS "Admins can manage faculties" ON public.faculties;
CREATE POLICY "Admins can manage faculties"
  ON public.faculties FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = faculties.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

DROP POLICY IF EXISTS "Public can view departments" ON public.departments;
CREATE POLICY "Public can view departments"
  ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = departments.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

DROP POLICY IF EXISTS "Public can view courses" ON public.courses;
CREATE POLICY "Public can view courses"
  ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins and institution admins can modify courses" ON public.courses;
CREATE POLICY "Super admins and institution admins can modify courses"
  ON public.courses FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = courses.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

DROP POLICY IF EXISTS "Public can view admission requirements" ON public.admission_requirements;
CREATE POLICY "Public can view admission requirements"
  ON public.admission_requirements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage admission requirements" ON public.admission_requirements;
CREATE POLICY "Admins can manage admission requirements"
  ON public.admission_requirements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = admission_requirements.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

CREATE POLICY "Public can view campus facilities"
  ON public.campus_facilities FOR SELECT USING (true);

CREATE POLICY "Admins can manage campus facilities"
  ON public.campus_facilities FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = campus_facilities.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

CREATE POLICY "Public can view institution reviews"
  ON public.institution_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit reviews"
  ON public.institution_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 4. NEWS, SCHOLARSHIPS & ACHIEVEMENTS POLICIES
DROP POLICY IF EXISTS "Public can read published news" ON public.news_articles;
CREATE POLICY "Public can read published news"
  ON public.news_articles FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Staff can manage news" ON public.news_articles;
CREATE POLICY "Staff can manage news"
  ON public.news_articles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'editor')) OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = news_articles.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

DROP POLICY IF EXISTS "Public can view verified scholarships" ON public.scholarships;
CREATE POLICY "Public can view verified scholarships"
  ON public.scholarships FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff can manage scholarships" ON public.scholarships;
CREATE POLICY "Staff can manage scholarships"
  ON public.scholarships FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'editor'))
  );

DROP POLICY IF EXISTS "Public can view achievements" ON public.achievements;
CREATE POLICY "Public can view achievements"
  ON public.achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage achievements" ON public.achievements;
CREATE POLICY "Admins can manage achievements"
  ON public.achievements FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 5. VERIFICATION RECORDS POLICIES
CREATE POLICY "Admins can view verification records"
  ON public.verification_records FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = verification_records.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

CREATE POLICY "Super admins can insert verification records"
  ON public.verification_records FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.institution_members
      WHERE institution_id = verification_records.institution_id AND profile_id = auth.uid() AND is_authorized = true
    )
  );

-- 6. SAVED INSTITUTIONS (Watchlist) POLICIES
DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.saved_institutions;
CREATE POLICY "Users can manage their own watchlist"
  ON public.saved_institutions FOR ALL USING (auth.uid() = profile_id);

-- 7. AUDIT LOG & DATA REPORTS POLICIES (Strict access)
DROP POLICY IF EXISTS "Only super admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Only super admins can view audit logs"
  ON public.audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Authorized staff can append their own audit events"
  ON public.audit_logs FOR INSERT WITH CHECK (
    actor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'institution_admin', 'editor'))
  );

DROP POLICY IF EXISTS "Anyone can submit data reports" ON public.data_reports;
CREATE POLICY "Anyone can submit data reports"
  ON public.data_reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can review and update data reports" ON public.data_reports;
CREATE POLICY "Staff can review and update data reports"
  ON public.data_reports FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'editor'))
  );
