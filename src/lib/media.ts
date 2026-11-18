import campusFacultyBuildingImg from '../assets/images/campus_faculty_building_1794428718479.jpg';
import heroNigerianCampusImg from '../assets/images/hero_nigerian_campus_1794428717056.jpg';
import libraryStudentsAbujaImg from '../assets/images/library_students_abuja_1794428717988.jpg';
import nigerianStudentResearcherImg from '../assets/images/nigerian_student_researcher_1794428719416.jpg';

export const MEDIA_ASSETS = {
  campusBuilding: campusFacultyBuildingImg,
  heroCampus: heroNigerianCampusImg,
  libraryStudents: libraryStudentsAbujaImg,
  studentResearcher: nigerianStudentResearcherImg,
} as const;

const LEGACY_FILENAME_MAP: Record<string, string> = {
  'campus_faculty_building_1794428718479.jpg': campusFacultyBuildingImg,
  'hero_nigerian_campus_1794428717056.jpg': heroNigerianCampusImg,
  'library_students_abuja_1794428717988.jpg': libraryStudentsAbujaImg,
  'nigerian_student_researcher_1794428719416.jpg': nigerianStudentResearcherImg,
};

/**
 * Resolves image URLs for both dev and production Vite builds.
 * Remaps any legacy unbundled `/src/assets/images/...` paths (including records
 * already persisted in localStorage or Supabase) to Vite-bundled asset URLs.
 */
export function resolveImageUrl(
  url?: string | null,
  fallback: string = MEDIA_ASSETS.campusBuilding
): string {
  const trimmed = (url || '').trim();
  if (!trimmed) {
    return fallback;
  }

  for (const [filename, bundledUrl] of Object.entries(LEGACY_FILENAME_MAP)) {
    if (trimmed === filename || trimmed.endsWith(`/${filename}`)) {
      return bundledUrl;
    }
  }

  return trimmed;
}
