import { supabase } from '../lib/supabase';
import {
  Institution,
  InstitutionCategory,
  InstitutionLevel,
  VerificationStatus,
  PublicationStatus,
  UserProfile,
  Course,
  AuditLog,
  Faculty,
  Facility,
  Review,
  VerificationRecord,
} from '../types';

export interface CompletenessReport {
  score: number;
  total: number;
  isComplete: boolean;
  missingFields: string[];
}

export function getInstitutionCompleteness(inst: Institution): CompletenessReport {
  const checks: { label: string; ok: boolean }[] = [
    { label: 'Official Name & Acronym', ok: Boolean(inst.name?.trim() && inst.acronym?.trim()) },
    { label: 'State, LGA & Physical Address', ok: Boolean(inst.state?.trim() && inst.lga?.trim() && inst.address?.trim()) },
    { label: 'Contact Email & Phone', ok: Boolean(inst.email?.trim() && inst.phone?.trim()) },
    { label: 'Official Website', ok: Boolean(inst.websiteUrl?.trim() && inst.websiteUrl !== 'https://') },
    { label: 'Accreditation & Source Reference', ok: Boolean(inst.accreditationBody?.trim() && inst.sourceReference?.name?.trim()) },
    { label: 'Faculties or Courses Catalogued', ok: Boolean(inst.faculties && inst.faculties.length > 0) },
    { label: 'Admissions / Cut-off Info', ok: Boolean(inst.admissionInfo?.guidelines?.trim()) },
  ];

  const missingFields = checks.filter((c) => !c.ok).map((c) => c.label);
  const score = checks.length - missingFields.length;
  return {
    score,
    total: checks.length,
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export interface RegulatoryAccreditationBadge {
  status: 'active' | 'expired' | 'pending';
  label: string;
  regulator: string;
  summary: string;
}

export function getRegulatoryAccreditationStatus(inst: Institution): RegulatoryAccreditationBadge {
  const body = inst.accreditationBody || '';
  const regulator = body.includes('NUC')
    ? 'NUC'
    : body.includes('NCCE')
    ? 'NCCE'
    : body.includes('NBTE')
    ? 'NBTE'
    : body.includes('NABTEB')
    ? 'NABTEB'
    : body.includes('WAEC') || body.includes('NECO')
    ? 'FME / WAEC / NECO'
    : body.trim() || 'Statutory';

  const accStatusLower = (inst.accreditationStatus || '').toLowerCase();
  const noteLower = (inst.operationalStatusNote || '').toLowerCase();

  if (
    accStatusLower.includes('expired') ||
    noteLower.includes('expired') ||
    inst.verificationStatus === 'rejected'
  ) {
    return {
      status: 'expired',
      label: 'Expired',
      regulator,
      summary:
        inst.operationalStatusNote ||
        `Latest ${regulator} regulatory data indicates expired accreditation or programme approval.`,
    };
  }

  if (inst.isHistorical) {
    return {
      status: 'expired',
      label: 'Expired (Converted)',
      regulator,
      summary: inst.successorName
        ? `Historical institution converted to ${inst.successorName}; prior ${regulator} charter superseded.`
        : `Historical / converted ${regulator} record; prior institutional charter superseded.`,
    };
  }

  if (
    inst.verificationStatus === 'verified' ||
    /\b(active|full|accredited|listed in statutory directory)\b/i.test(inst.accreditationStatus || '')
  ) {
    return {
      status: 'active',
      label: 'Active',
      regulator,
      summary: `Active accreditation / statutory standing per latest ${regulator} regulatory data.`,
    };
  }

  return {
    status: 'pending',
    label: inst.verificationStatus === 'flagged' ? 'Flagged / Under Review' : 'Pending Verification',
    regulator,
    summary:
      inst.operationalStatusNote ||
      `Current ${regulator} regulatory accreditation status requires separate verification.`,
  };
}

export function inferCategoryFromLevel(level: InstitutionLevel): InstitutionCategory {
  switch (level) {
    case 'federal_university':
    case 'state_university':
    case 'private_university':
      return 'university';
    case 'polytechnic':
      return 'polytechnic';
    case 'monotechnic':
      return 'monotechnic';
    case 'college_of_education':
      return 'college_of_education';
    case 'vocational':
      return 'technical_vocational';
    case 'secondary':
      return 'secondary_school';
    case 'primary':
      return 'primary_school';
    default:
      return 'specialised_institution';
  }
}

export function mapDbInstitution(
  r: any,
  relations?: {
    faculties?: any[];
    departments?: any[];
    courses?: any[];
    admissions?: any[];
    facilities?: any[];
    reviews?: any[];
    verificationRecords?: any[];
  }
): Institution {
  const instFaculties: Faculty[] = (relations?.faculties || [])
    .filter((f) => f.institution_id === r.id)
    .map((f) => {
      const facDepts = (relations?.departments || [])
        .filter((d) => d.faculty_id === f.id)
        .map((d) => ({
          id: d.id,
          name: d.name,
          headOfDepartment: d.head_of_department || undefined,
          courses: (relations?.courses || [])
            .filter((c) => c.department_id === d.id)
            .map((c) => ({
              id: c.id,
              institutionId: c.institution_id,
              name: c.name,
              code: c.code || undefined,
              degreeType: c.degree_type,
              durationYears: c.duration_years,
              accreditationStatus: c.accreditation_status || 'Pending Accreditation Verification',
              cutOffMark: c.cut_off_mark ?? undefined,
              utmeSubjects: c.utme_subjects || undefined,
              oLevelRequirements: c.o_level_requirements || undefined,
              directEntryRequirements: c.direct_entry_requirements || undefined,
              careerOpportunities: c.career_opportunities || undefined,
            })),
        }));
      return {
        id: f.id,
        name: f.name,
        deanName: f.dean_name || undefined,
        departments: facDepts,
      };
    });

  const admRow = (relations?.admissions || []).find((a) => a.institution_id === r.id);
  const instFacilities: Facility[] = (relations?.facilities || [])
    .filter((f) => f.institution_id === r.id)
    .map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      description: f.description,
      verified: Boolean(f.verified),
    }));

  const instReviews: Review[] = (relations?.reviews || [])
    .filter((rev) => rev.institution_id === r.id)
    .map((rev) => ({
      id: rev.id,
      authorName: rev.author_name,
      authorRole: rev.author_role,
      rating: rev.rating,
      comment: rev.comment,
      date: rev.created_at ? rev.created_at.split('T')[0] : '',
      academicYear: rev.academic_year || undefined,
    }));

  const verRecords: VerificationRecord[] = (relations?.verificationRecords || [])
    .filter((vr) => vr.institution_id === r.id)
    .map((vr) => ({
      id: vr.id,
      institutionId: vr.institution_id,
      status: vr.status,
      reviewerName: vr.reviewer_name || 'Administrator',
      sourceUsed: vr.source_used || 'Not specified',
      notes: vr.notes || undefined,
      changesSummary: vr.changes_summary || undefined,
      timestamp: vr.reviewed_at || vr.created_at || '',
    }));

  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    commonName: r.common_name || undefined,
    acronym: r.acronym || '',
    category: r.category || inferCategoryFromLevel(r.level),
    level: r.level,
    ownership: r.ownership,
    state: r.state,
    lga: r.lga || '',
    city: r.city,
    address: r.address || '',
    establishmentYear: r.establishment_year || 1960,
    motto: r.motto || '',
    websiteUrl: r.website_url || '',
    email: r.email || '',
    phone: r.phone || '',
    logoUrl: r.logo_url || undefined,
    coverImageUrl: r.cover_image_url || undefined,
    verificationStatus: r.verification_status || 'draft',
    publicationStatus: r.publication_status || (r.is_archived ? 'archived' : 'unpublished'),
    verifiedAt: r.verified_at || undefined,
    verifiedBy: r.verified_by || undefined,
    verifiedByName: r.verified_by_name || undefined,
    verificationNotes: r.verification_notes || undefined,
    publishedAt: r.published_at || undefined,
    publishedBy: r.published_by || undefined,
    publishedByName: r.published_by_name || undefined,
    archivedAt: r.archived_at || undefined,
    archivedBy: r.archived_by || undefined,
    isArchived: Boolean(r.is_archived),
    createdAt: r.created_at ? r.created_at.split('T')[0] : undefined,
    createdBy: r.created_by || undefined,
    createdByName: r.created_by_name || undefined,
    updatedBy: r.updated_by || undefined,
    updatedByName: r.updated_by_name || undefined,
    chancellorOrPrincipal: r.chancellor_or_principal || undefined,
    studentPopulationRange: r.student_population_range || undefined,
    academicStaffCount: r.academic_staff_count ?? undefined,
    accreditationBody: r.accreditation_body || 'Pending Regulatory Review',
    accreditationStatus: r.accreditation_status || undefined,
    accreditationReference: r.accreditation_reference || undefined,
    nationalRanking: r.national_ranking ?? undefined,
    schoolFeesRange: r.school_fees_range || undefined,
    description: r.description,
    isFeatured: Boolean(r.is_featured),
    sourceReference: r.source_reference_name || r.verification_source
      ? {
          name: r.source_reference_name || r.verification_source,
          url: r.source_reference_url || undefined,
          verificationDate: r.verified_at ? r.verified_at.split('T')[0] : undefined,
        }
      : undefined,
    formerNames: r.former_names || undefined,
    successorName: r.successor_name || undefined,
    isHistorical: Boolean(r.is_historical),
    operationalStatusNote: r.operational_status_note || undefined,
    verificationHistory: verRecords.length > 0 ? verRecords : undefined,
    faculties: instFaculties.length > 0 ? instFaculties : undefined,
    facilities: instFacilities.length > 0 ? instFacilities : undefined,
    reviews: instReviews.length > 0 ? instReviews : undefined,
    admissionInfo: admRow
      ? {
          academicSession: admRow.academic_session,
          generalCutOffMark: admRow.general_cut_off_mark,
          postUtmeFeeNaira: admRow.post_utme_fee_naira !== null && admRow.post_utme_fee_naira !== undefined
            ? Number(admRow.post_utme_fee_naira)
            : undefined,
          applicationDeadline: admRow.application_deadline || undefined,
          postUtmeExamDate: admRow.post_utme_date || undefined,
          admissionPortalUrl: admRow.admission_portal_url || undefined,
          directEntryInfo: admRow.direct_entry_info || undefined,
          guidelines: admRow.guidelines,
        }
      : undefined,
    lastUpdated: r.updated_at ? r.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export async function fetchInstitutionsFromSupabase(includeUnpublished: boolean): Promise<Institution[]> {
  const client = supabase;
  if (!client) {
    throw new Error('Supabase client is not configured.');
  }

  let query = client.from('institutions').select('*').order('updated_at', { ascending: false });
  if (!includeUnpublished) {
    query = query.eq('publication_status', 'published').eq('is_archived', false);
  }

  const { data: instRows, error: instErr } = await query;
  if (instErr) throw new Error(instErr.message);
  if (!instRows || instRows.length === 0) return [];

  const [facRes, deptRes, crsRes, admRes, faclRes, revRes, verRes] = await Promise.all([
    client.from('faculties').select('*'),
    client.from('departments').select('*'),
    client.from('courses').select('*'),
    client.from('admission_requirements').select('*'),
    client.from('campus_facilities').select('*'),
    client.from('institution_reviews').select('*'),
    includeUnpublished ? client.from('verification_records').select('*').order('created_at', { ascending: false }) : Promise.resolve({ data: [] as any[] }),
  ]);

  return instRows.map((row) =>
    mapDbInstitution(row, {
      faculties: facRes.data || [],
      departments: deptRes.data || [],
      courses: crsRes.data || [],
      admissions: admRes.data || [],
      facilities: faclRes.data || [],
      reviews: revRes.data || [],
      verificationRecords: verRes.data || [],
    })
  );
}

export async function insertAuditLogToSupabase(entry: {
  actorId?: string;
  actorEmail: string;
  actorName: string;
  actorRole: UserProfile['role'];
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}): Promise<AuditLog | null> {
  const client = supabase;
  if (!client) return null;

  const { data, error } = await client
    .from('audit_logs')
    .insert({
      actor_id: entry.actorId && /^[0-9a-f-]{36}$/i.test(entry.actorId) ? entry.actorId : null,
      actor_email: entry.actorEmail,
      actor_name: entry.actorName,
      actor_role: entry.actorRole,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      details: entry.details,
    })
    .select('*')
    .single();

  if (error) {
    console.warn('Audit log insert notice:', error.message);
    return null;
  }

  return {
    id: data.id,
    actorEmail: data.actor_email || entry.actorEmail,
    actorName: data.actor_name || entry.actorName,
    actorRole: data.actor_role || entry.actorRole,
    action: data.action,
    entityType: data.entity_type,
    entityId: data.entity_id,
    details: data.details || entry.details,
    timestamp: data.created_at ? data.created_at.replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
}

export async function fetchAuditLogsFromSupabase(): Promise<AuditLog[]> {
  const client = supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data.map((row: any) => ({
    id: row.id,
    actorEmail: row.actor_email || 'system',
    actorName: row.actor_name || undefined,
    actorRole: row.actor_role || 'super_admin',
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details || '',
    timestamp: row.created_at ? row.created_at.replace('T', ' ').substring(0, 19) : '',
  }));
}

export async function createInstitutionInSupabase(
  inst: Omit<Institution, 'id' | 'slug' | 'lastUpdated'>,
  actor: UserProfile
): Promise<Institution> {
  const client = supabase;
  if (!client) throw new Error('Supabase client is not configured.');

  const slug = inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const initialVerification: VerificationStatus =
    inst.verificationStatus === 'pending_verification' ? 'pending_verification' : 'draft';

  const { data, error } = await client
    .from('institutions')
    .insert({
      slug,
      name: inst.name,
      common_name: inst.commonName || null,
      acronym: inst.acronym || null,
      category: inst.category,
      level: inst.level,
      ownership: inst.ownership,
      state: inst.state,
      lga: inst.lga || null,
      city: inst.city,
      address: inst.address || null,
      establishment_year: inst.establishmentYear,
      motto: inst.motto || null,
      website_url: inst.websiteUrl || null,
      email: inst.email || null,
      phone: inst.phone || null,
      logo_url: inst.logoUrl || null,
      cover_image_url: inst.coverImageUrl || null,
      chancellor_or_principal: inst.chancellorOrPrincipal || null,
      accreditation_body: inst.accreditationBody || 'Pending Regulatory Review',
      accreditation_status: inst.accreditationStatus || null,
      accreditation_reference: inst.accreditationReference || null,
      school_fees_range: inst.schoolFeesRange || null,
      source_reference_name: inst.sourceReference?.name || null,
      source_reference_url: inst.sourceReference?.url || null,
      former_names: inst.formerNames || null,
      successor_name: inst.successorName || null,
      is_historical: Boolean(inst.isHistorical),
      operational_status_note: inst.operationalStatusNote || null,
      description: inst.description,
      verification_status: initialVerification,
      publication_status: 'unpublished',
      is_archived: false,
      created_by: /^[0-9a-f-]{36}$/i.test(actor.id) ? actor.id : null,
      created_by_name: actor.fullName,
      updated_by: /^[0-9a-f-]{36}$/i.test(actor.id) ? actor.id : null,
      updated_by_name: actor.fullName,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Database rejected institution creation.');
  }

  return mapDbInstitution(data);
}

export async function updateInstitutionInSupabase(
  id: string,
  updates: Partial<Institution>,
  actor: UserProfile
): Promise<Institution> {
  const client = supabase;
  if (!client) throw new Error('Supabase client is not configured.');

  const payload: Record<string, any> = {
    updated_by: /^[0-9a-f-]{36}$/i.test(actor.id) ? actor.id : null,
    updated_by_name: actor.fullName,
  };

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.commonName !== undefined) payload.common_name = updates.commonName || null;
  if (updates.acronym !== undefined) payload.acronym = updates.acronym || null;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.level !== undefined) payload.level = updates.level;
  if (updates.ownership !== undefined) payload.ownership = updates.ownership;
  if (updates.state !== undefined) payload.state = updates.state;
  if (updates.lga !== undefined) payload.lga = updates.lga || null;
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.address !== undefined) payload.address = updates.address || null;
  if (updates.establishmentYear !== undefined) payload.establishment_year = updates.establishmentYear;
  if (updates.motto !== undefined) payload.motto = updates.motto || null;
  if (updates.websiteUrl !== undefined) payload.website_url = updates.websiteUrl || null;
  if (updates.email !== undefined) payload.email = updates.email || null;
  if (updates.phone !== undefined) payload.phone = updates.phone || null;
  if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl || null;
  if (updates.coverImageUrl !== undefined) payload.cover_image_url = updates.coverImageUrl || null;
  if (updates.chancellorOrPrincipal !== undefined) payload.chancellor_or_principal = updates.chancellorOrPrincipal || null;
  if (updates.studentPopulationRange !== undefined) payload.student_population_range = updates.studentPopulationRange || null;
  if (updates.accreditationBody !== undefined) payload.accreditation_body = updates.accreditationBody;
  if (updates.accreditationStatus !== undefined) payload.accreditation_status = updates.accreditationStatus || null;
  if (updates.accreditationReference !== undefined) payload.accreditation_reference = updates.accreditationReference || null;
  if (updates.schoolFeesRange !== undefined) payload.school_fees_range = updates.schoolFeesRange || null;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.sourceReference !== undefined) {
    payload.source_reference_name = updates.sourceReference?.name || null;
    payload.source_reference_url = updates.sourceReference?.url || null;
  }
  if (updates.formerNames !== undefined) payload.former_names = updates.formerNames || null;
  if (updates.successorName !== undefined) payload.successor_name = updates.successorName || null;
  if (updates.isHistorical !== undefined) payload.is_historical = Boolean(updates.isHistorical);
  if (updates.operationalStatusNote !== undefined) payload.operational_status_note = updates.operationalStatusNote || null;

  const { data, error } = await client
    .from('institutions')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Failed to update institution in PostgreSQL.');
  }

  if (updates.admissionInfo) {
    const { data: existingAdm } = await client
      .from('admission_requirements')
      .select('id')
      .eq('institution_id', id)
      .maybeSingle();

    const admPayload = {
      institution_id: id,
      academic_session: updates.admissionInfo.academicSession,
      general_cut_off_mark: updates.admissionInfo.generalCutOffMark,
      post_utme_fee_naira: updates.admissionInfo.postUtmeFeeNaira ?? null,
      application_deadline: updates.admissionInfo.applicationDeadline || null,
      direct_entry_info: updates.admissionInfo.directEntryInfo || null,
      admission_portal_url: updates.admissionInfo.admissionPortalUrl || null,
      guidelines: updates.admissionInfo.guidelines,
    };

    if (existingAdm?.id) {
      await client.from('admission_requirements').update(admPayload).eq('id', existingAdm.id);
    } else {
      await client.from('admission_requirements').insert(admPayload);
    }
  }

  return mapDbInstitution(data);
}

export async function verifyInstitutionInSupabase(
  id: string,
  status: VerificationStatus,
  sourceUsed: string,
  notes: string,
  actor: UserProfile
): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('Supabase client is not configured.');

  const nowIso = new Date().toISOString();
  const isVerified = status === 'verified';
  const actorUuid = /^[0-9a-f-]{36}$/i.test(actor.id) ? actor.id : null;

  const { error } = await client
    .from('institutions')
    .update({
      verification_status: status,
      verified_at: isVerified ? nowIso : null,
      verified_by: isVerified ? actorUuid : null,
      verified_by_name: isVerified ? actor.fullName : null,
      verification_source: sourceUsed || null,
      verification_notes: notes || null,
      source_reference_name: sourceUsed || undefined,
      updated_by: actorUuid,
      updated_by_name: actor.fullName,
    })
    .eq('id', id);

  if (error) throw new Error(error.message);

  await client.from('verification_records').insert({
    institution_id: id,
    reviewed_by: actorUuid,
    reviewer_name: actor.fullName,
    source_used: sourceUsed,
    status,
    notes,
    reviewed_at: nowIso,
  });
}

export async function setPublicationStatusInSupabase(
  id: string,
  pubStatus: PublicationStatus,
  actor: UserProfile
): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('Supabase client is not configured.');

  const nowIso = new Date().toISOString();
  const actorUuid = /^[0-9a-f-]{36}$/i.test(actor.id) ? actor.id : null;

  const updateFields: Record<string, any> = {
    publication_status: pubStatus,
    is_archived: pubStatus === 'archived',
    updated_by: actorUuid,
    updated_by_name: actor.fullName,
  };

  if (pubStatus === 'published') {
    updateFields.published_at = nowIso;
    updateFields.published_by = actorUuid;
    updateFields.published_by_name = actor.fullName;
  } else if (pubStatus === 'archived') {
    updateFields.archived_at = nowIso;
    updateFields.archived_by = actorUuid;
  } else {
    updateFields.archived_at = null;
  }

  const { error } = await client.from('institutions').update(updateFields).eq('id', id);
  if (error) throw new Error(error.message);
}

export async function addCourseInSupabase(
  institutionId: string,
  facultyName: string,
  departmentName: string,
  course: Omit<Course, 'id' | 'institutionId'>
): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('Supabase client is not configured.');

  let { data: fac } = await client
    .from('faculties')
    .select('id')
    .eq('institution_id', institutionId)
    .ilike('name', facultyName.trim())
    .maybeSingle();

  if (!fac) {
    const { data: createdFac, error: facErr } = await client
      .from('faculties')
      .insert({ institution_id: institutionId, name: facultyName.trim() })
      .select('id')
      .single();
    if (facErr || !createdFac) throw new Error(facErr?.message || 'Failed creating faculty.');
    fac = createdFac;
  }

  let { data: dept } = await client
    .from('departments')
    .select('id')
    .eq('institution_id', institutionId)
    .eq('faculty_id', fac.id)
    .ilike('name', departmentName.trim())
    .maybeSingle();

  if (!dept) {
    const { data: createdDept, error: deptErr } = await client
      .from('departments')
      .insert({ institution_id: institutionId, faculty_id: fac.id, name: departmentName.trim() })
      .select('id')
      .single();
    if (deptErr || !createdDept) throw new Error(deptErr?.message || 'Failed creating department.');
    dept = createdDept;
  }

  const { error: crsErr } = await client.from('courses').insert({
    institution_id: institutionId,
    department_id: dept.id,
    name: course.name,
    code: course.code || null,
    degree_type: course.degreeType,
    duration_years: course.durationYears,
    accreditation_status: course.accreditationStatus,
    cut_off_mark: course.cutOffMark ?? null,
    o_level_requirements: course.oLevelRequirements || null,
  });
  if (crsErr) throw new Error(crsErr.message);
}
