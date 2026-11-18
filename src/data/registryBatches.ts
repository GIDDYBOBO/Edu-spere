import {
  Institution,
  InstitutionCategory,
  InstitutionLevel,
  OwnershipType,
  VerificationStatus,
} from '../types';

interface SeedTuple {
  name: string;
  city: string;
  state: string;
  commonName?: string;
  acronym?: string;
  formerNames?: string[];
  successorName?: string;
  isHistorical?: boolean;
  verificationStatus?: VerificationStatus;
  accreditationStatus?: string;
  operationalStatusNote?: string;
  descriptionExtra?: string;
  established?: number;
  category?: InstitutionCategory;
  level?: InstitutionLevel;
  ownership?: OwnershipType;
  accreditationBody?: string;
  sourceName?: string;
  sourceUrl?: string;
}

const REGISTRY_DATE = '2026-07-15';

function makeSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildRecord(
  prefix: string,
  item: SeedTuple,
  defaults: {
    category: InstitutionCategory;
    level: InstitutionLevel;
    ownership: OwnershipType;
    accreditationBody: string;
    sourceName: string;
    sourceUrl: string;
    descriptionPrefix: string;
  }
): Institution {
  const level = item.level ?? defaults.level;
  const category = item.category ?? defaults.category;
  const ownership = item.ownership ?? defaults.ownership;
  const verificationStatus = item.verificationStatus ?? 'verified';
  const slugBase = makeSlug(item.name);
  const slug = item.state && item.state !== 'Unspecified'
    ? slugBase
    : `${slugBase}-ng`;

  const descriptionParts = [
    `${item.name}${item.acronym ? ` (${item.acronym})` : ''} is a ${ownership.toLowerCase()} ${defaults.descriptionPrefix} located in ${
      item.city && item.city !== item.state ? `${item.city}, ` : ''
    }${item.state === 'Unspecified' ? 'Nigeria' : item.state === 'FCT Abuja' ? 'FCT Abuja' : `${item.state} State`}.`,
  ];
  if (item.descriptionExtra) {
    descriptionParts.push(item.descriptionExtra);
  }
  if (item.formerNames && item.formerNames.length > 0) {
    descriptionParts.push(`Formerly / also known as ${item.formerNames.join('; ')}.`);
  }
  if (item.successorName) {
    descriptionParts.push(`Historical / converted record; successor institution: ${item.successorName}.`);
  }
  if (item.operationalStatusNote) {
    descriptionParts.push(item.operationalStatusNote);
  }

  return {
    id: `${prefix}-${slugBase}`,
    slug: `${prefix}-${slug}`,
    name: item.name,
    commonName:
      item.commonName ||
      (item.formerNames?.[0] ? `${item.name} (formerly ${item.formerNames[0]})` : undefined),
    acronym: item.acronym || '',
    category,
    level,
    ownership,
    state: item.state,
    lga: item.city || item.state,
    city: item.city || item.state,
    address: item.city && item.state !== 'Unspecified' ? `${item.city}, ${item.state}` : 'Location details pending verification',
    establishmentYear: item.established || 2000,
    motto: '',
    websiteUrl: '',
    email: '',
    phone: '',
    verificationStatus,
    publicationStatus: 'published',
    isArchived: false,
    createdAt: REGISTRY_DATE,
    verifiedAt: verificationStatus === 'verified' ? `${REGISTRY_DATE}T09:00:00Z` : undefined,
    verifiedByName: verificationStatus === 'verified' ? 'EduSphere Statutory Registry Sync' : undefined,
    publishedAt: `${REGISTRY_DATE}T09:30:00Z`,
    publishedByName: 'EduSphere Editorial Board',
    accreditationBody: item.accreditationBody ?? defaults.accreditationBody,
    accreditationStatus:
      item.accreditationStatus ||
      (item.isHistorical
        ? 'Historical / Converted Record'
        : verificationStatus === 'verified'
        ? 'Listed in Statutory Directory'
        : 'Requires Separate Verification'),
    description: descriptionParts.join(' '),
    isFeatured: false,
    sourceReference: {
      name: item.sourceName ?? defaults.sourceName,
      url: item.sourceUrl ?? defaults.sourceUrl,
      verificationDate: verificationStatus === 'verified' ? REGISTRY_DATE : undefined,
    },
    formerNames: item.formerNames,
    successorName: item.successorName,
    isHistorical: Boolean(item.isHistorical),
    operationalStatusNote: item.operationalStatusNote,
    lastUpdated: REGISTRY_DATE,
  };
}

// ============================================================================
// BATCH 1 — FEDERAL UNIVERSITIES (Part 1B: NUC 30 June 2025 Bulletin, 31–72)
// ============================================================================
const NUC_JUNE_2025_OP_NOTE =
  'Listed in the NUC 30 June 2025 Bulletin; operational and active student admissions status requires separate confirmation.';

const FEDERAL_UNIVERSITIES_PART_1B: SeedTuple[] = [
  { name: 'Federal University, Wukari', city: 'Wukari', state: 'Taraba', acronym: 'FUWUKARI', established: 2011 },
  { name: 'Federal University, Dutsin-Ma', city: 'Dutsin-Ma', state: 'Katsina', acronym: 'FUDMA', established: 2011 },
  { name: 'Federal University, Dutse', city: 'Dutse', state: 'Jigawa', acronym: 'FUD', established: 2011 },
  { name: 'Alex Ekwueme Federal University, Ndufu-Alike', city: 'Ndufu-Alike', state: 'Ebonyi', acronym: 'AE-FUNAI', established: 2011 },
  { name: 'Federal University, Oye-Ekiti', city: 'Oye-Ekiti', state: 'Ekiti', acronym: 'FUOYE', established: 2011 },
  { name: 'Federal University, Otuoke', city: 'Otuoke', state: 'Bayelsa', acronym: 'FUOTUOKE', established: 2011 },
  { name: 'Nigeria Police Academy, Wudil', city: 'Wudil', state: 'Kano', acronym: 'POLAC', established: 2013 },
  { name: 'Federal University, Birnin-Kebbi', city: 'Birnin-Kebbi', state: 'Kebbi', acronym: 'FUBK', established: 2013 },
  { name: 'Federal University, Gusau', city: 'Gusau', state: 'Zamfara', acronym: 'FUGUS', established: 2013 },
  { name: 'Federal University, Gashua', city: 'Gashua', state: 'Yobe', acronym: 'FUGA', established: 2013 },
  { name: 'Nigeria Maritime University, Okerenkoko', city: 'Okerenkoko', state: 'Delta', acronym: 'NMU', established: 2018 },
  {
    name: 'Air Force Institute of Technology, Kaduna',
    city: 'Kaduna',
    state: 'Kaduna',
    acronym: 'AFIT',
    established: 2018,
    operationalStatusNote: 'Listed in both the NUC Federal Universities directory and the NBTE Polytechnics register.',
  },
  { name: 'Nigerian Army University, Biu', city: 'Biu', state: 'Borno', acronym: 'NAUB', established: 2018 },
  { name: 'Federal University of Health Sciences, Otukpo', city: 'Otukpo', state: 'Benue', acronym: 'FUHSO', established: 2020 },
  { name: 'Federal University of Agriculture, Zuru', city: 'Zuru', state: 'Kebbi', acronym: 'FUAZ', established: 2020 },
  { name: 'Federal University of Technology, Babura', city: 'Babura', state: 'Jigawa', acronym: 'FUTB', established: 2021 },
  { name: 'Federal University of Technology, Ikot Abasi', city: 'Ikot Abasi', state: 'Akwa Ibom', acronym: 'FUTIA', established: 2021 },
  { name: 'Federal University of Health Sciences, Azare', city: 'Azare', state: 'Bauchi', acronym: 'FUHSA', established: 2021 },
  { name: 'Federal University of Health Sciences, Ila Orangun', city: 'Ila-Orangun', state: 'Osun', acronym: 'FUHSI', established: 2021 },
  { name: 'King David Umahi University of Medical Sciences, Uburu', city: 'Uburu', state: 'Ebonyi', acronym: 'DUMS', established: 2021 },
  { name: 'Admiralty University, Ibusa', city: 'Ibusa', state: 'Delta', acronym: 'ADUN', established: 2017 },
  { name: 'Federal University of Transportation, Daura', city: 'Daura', state: 'Katsina', acronym: 'FUTD', established: 2023 },
  { name: 'African Aviation and Aerospace University, Abuja', city: 'Abuja', state: 'FCT Abuja', acronym: 'AAAU', established: 2023 },
  { name: 'National University of Science and Technology, Abuja', city: 'Abuja', state: 'FCT Abuja', acronym: 'NUST', established: 2023 },
  { name: 'Federal University of Agriculture, Bassam-Biri', city: 'Bassam-Biri', state: 'Bayelsa', acronym: 'FUABB', established: 2023 },
  { name: 'Federal University of Health Sciences, Kwale', city: 'Kwale', state: 'Delta', acronym: 'FUHSK', established: 2023 },
  { name: 'Federal University of Health Sciences, Katsina', city: 'Katsina', state: 'Katsina', acronym: 'FUHSKT', established: 2023 },
  { name: 'Federal University of Agriculture, Mubi', city: 'Mubi', state: 'Adamawa', acronym: 'FUAMUBI', established: 2023 },
  { name: 'Federal University of Education, Zaria', city: 'Zaria', state: 'Kaduna', acronym: 'FUEZ', formerNames: ['Federal College of Education, Zaria'], established: 2024 },
  { name: 'Alvan Ikoku Federal University of Education, Owerri', city: 'Owerri', state: 'Imo', acronym: 'AIFUE', formerNames: ['Alvan Ikoku Federal College of Education, Owerri'], established: 2023 },
  // 61–72 (NUC June 2025 Bulletin; operational status requires separate verification)
  { name: 'Federal University of Medicine and Medical Sciences, Abeokuta', city: 'Abeokuta', state: 'Ogun', acronym: 'FUMMSA', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Education, Kano', city: 'Kano', state: 'Kano', acronym: 'FUEK', formerNames: ['Federal College of Education, Kano'], established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Adeyemi University of Education, Ondo', city: 'Ondo', state: 'Ondo', acronym: 'AFUED', formerNames: ['Adeyemi College of Education, Ondo'], established: 2023, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Education, Pankshin', city: 'Pankshin', state: 'Plateau', acronym: 'FUEP', formerNames: ['Federal College of Education, Pankshin'], established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Education, Kontagora', city: 'Kontagora', state: 'Niger', acronym: 'FUEKTG', formerNames: ['Federal College of Education, Kontagora'], established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'University of Maritime Studies, Oron', city: 'Oron', state: 'Akwa Ibom', acronym: 'UMSO', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Allied Health Sciences, Enugu', city: 'Enugu', state: 'Enugu', acronym: 'FUAHSE', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Environment and Technology, Tai Town', city: 'Tai Town, Ogoniland', state: 'Rivers', acronym: 'FUET', established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Applied Sciences, Kachia', city: 'Kachia', state: 'Kaduna', acronym: 'FUASK', formerNames: ['Nok University, Kachia'], established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Tai Solarin Federal University of Education, Ijagun', city: 'Ijagun, Ijebu Ode', state: 'Ogun', acronym: 'TASFUED', formerNames: ['Tai Solarin University of Education (TASUED)'], established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Agriculture and Developmental Studies, Iragbiji', city: 'Iragbiji', state: 'Osun', acronym: 'FUADSI', established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
  { name: 'Federal University of Technology and Environmental Studies, Iyin-Ekiti', city: 'Iyin-Ekiti', state: 'Ekiti', acronym: 'FUTES', established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: NUC_JUNE_2025_OP_NOTE },
];

// ============================================================================
// BATCH 2 — STATE UNIVERSITIES (Part 2A & 2B: NUC State Directory 1–69)
// Note: Lagos State University (inst-lasu) is preserved in initialData.ts
// ============================================================================
const STATE_UNIV_2024_NOTE =
  'Displayed in the 2024–2026 NUC State Universities directory; operational and active admissions status requires separate confirmation.';

const STATE_UNIVERSITIES_BATCH: SeedTuple[] = [
  { name: 'Rivers State University', city: 'Port Harcourt', state: 'Rivers', acronym: 'RSU', formerNames: ['Rivers State University of Science and Technology (RSUST)'], established: 1980 },
  { name: 'Ambrose Alli University', city: 'Ekpoma', state: 'Edo', acronym: 'AAU', established: 1981 },
  { name: 'Abia State University', city: 'Uturu', state: 'Abia', acronym: 'ABSU', established: 1981 },
  { name: 'Ekiti State University', city: 'Ado-Ekiti', state: 'Ekiti', acronym: 'EKSU', formerNames: ['University of Ado-Ekiti'], established: 1982 },
  { name: 'Enugu State University of Science and Technology', city: 'Enugu', state: 'Enugu', acronym: 'ESUT', established: 1980 },
  { name: 'Olabisi Onabanjo University', city: 'Ago-Iwoye', state: 'Ogun', acronym: 'OOU', formerNames: ['Ogun State University'], established: 1982 },
  // #7 Lagos State University is in initialData.ts (inst-lasu)
  { name: 'Ladoke Akintola University of Technology', city: 'Ogbomoso', state: 'Oyo', acronym: 'LAUTECH', established: 1990 },
  { name: 'Rev. Fr. Moses Orshio Adasu University', city: 'Makurdi', state: 'Benue', acronym: 'MOAU', formerNames: ['Benue State University (BSU)'], established: 1992 },
  { name: 'Delta State University', city: 'Abraka', state: 'Delta', acronym: 'DELSU', established: 1992 },
  { name: 'Imo State University', city: 'Owerri', state: 'Imo', acronym: 'IMSU', established: 1992 },
  { name: 'Adekunle Ajasin University', city: 'Akungba-Akoko', state: 'Ondo', acronym: 'AAUA', established: 1999 },
  { name: 'Prince Abubakar Audu University', city: 'Anyigba', state: 'Kogi', acronym: 'PAAU', formerNames: ['Kogi State University'], established: 1999 },
  { name: 'Chukwuemeka Odumegwu Ojukwu University', city: 'Uli', state: 'Anambra', acronym: 'COOU', formerNames: ['Anambra State University'], established: 2000 },
  { name: 'Ebonyi State University', city: 'Abakaliki', state: 'Ebonyi', acronym: 'EBSU', established: 1999 },
  { name: 'Aliko Dangote University of Science and Technology', city: 'Wudil', state: 'Kano', acronym: 'ADUSTECH', formerNames: ['Kano University of Science and Technology (KUST)'], established: 2001 },
  { name: 'Niger Delta University', city: 'Wilberforce Island', state: 'Bayelsa', acronym: 'NDU', established: 2000 },
  { name: 'Adamawa State University', city: 'Mubi', state: 'Adamawa', acronym: 'ADSU', established: 2002 },
  { name: 'Nasarawa State University', city: 'Keffi', state: 'Nasarawa', acronym: 'NSUK', established: 2001 },
  { name: 'University of Cross River State', city: 'Calabar', state: 'Cross River', acronym: 'UNICROSS', formerNames: ['Cross River University of Technology (CRUTECH)'], established: 2002 },
  { name: 'Gombe State University', city: 'Gombe', state: 'Gombe', acronym: 'GSU', established: 2004 },
  { name: 'Kaduna State University', city: 'Kaduna', state: 'Kaduna', acronym: 'KASU', established: 2004 },
  { name: 'Ibrahim Badamasi Babangida University', city: 'Lapai', state: 'Niger', acronym: 'IBBU', established: 2005 },
  { name: 'Plateau State University', city: 'Bokkos', state: 'Plateau', acronym: 'PLASU', established: 2005 },
  { name: 'Yobe State University', city: 'Damaturu', state: 'Yobe', acronym: 'YSU', established: 2006 },
  { name: 'Kebbi State University of Science and Technology', city: 'Aliero', state: 'Kebbi', acronym: 'KSUSTA', established: 2006 },
  { name: 'Umaru Musa Yar\'Adua University', city: 'Katsina', state: 'Katsina', acronym: 'UMYU', established: 2006 },
  { name: 'Osun State University', city: 'Osogbo', state: 'Osun', acronym: 'UNIOSUN', established: 2006 },
  { name: 'Olusegun Agagu University of Science and Technology', city: 'Okitipupa', state: 'Ondo', acronym: 'OAUSTECH', formerNames: ['Ondo State University of Science and Technology (OSUSTECH)'], established: 2008 },
  { name: 'Taraba State University', city: 'Jalingo', state: 'Taraba', acronym: 'TSU', established: 2008 },
  { name: 'Kwara State University', city: 'Malete', state: 'Kwara', acronym: 'KWASU', established: 2009 },
  { name: 'Sokoto State University', city: 'Sokoto', state: 'Sokoto', acronym: 'SSU', established: 2009 },
  { name: 'Akwa Ibom State University', city: 'Ikot Akpaden', state: 'Akwa Ibom', acronym: 'AKSU', established: 2009 },
  { name: 'Ignatius Ajuru University of Education', city: 'Rumuolumeni, Port Harcourt', state: 'Rivers', acronym: 'IAUE', established: 2009 },
  { name: 'Sa\'adu Zungur University', city: 'Gadau', state: 'Bauchi', acronym: 'SAZU', formerNames: ['Bauchi State University'], established: 2011 },
  { name: 'Northwest University', city: 'Kano', state: 'Kano', acronym: 'NWU Kano', formerNames: ['Yusuf Maitama Sule University, Kano'], established: 2012 },
  { name: 'First Technical University', city: 'Ibadan', state: 'Oyo', acronym: 'Tech-U', established: 2012 },
  { name: 'Sule Lamido University', city: 'Kafin Hausa', state: 'Jigawa', acronym: 'SLU', established: 2013 },
  { name: 'University of Medical Sciences', city: 'Ondo City', state: 'Ondo', acronym: 'UNIMED', established: 2015 },
  { name: 'Edo State University', city: 'Uzairue', state: 'Edo', acronym: 'EDSU', established: 2016 },
  { name: 'Kingsley Ozumba Mbadiwe University', city: 'Ogboko', state: 'Imo', acronym: 'KOMU', established: 2016 },
  { name: 'University of Africa, Toru-Orua', city: 'Toru-Orua', state: 'Bayelsa', acronym: 'UAT', established: 2016 },
  { name: 'Kashim Ibrahim University', city: 'Maiduguri', state: 'Borno', acronym: 'KIU', formerNames: ['Borno State University (BOSU)'], established: 2016 },
  { name: 'Moshood Abiola University of Science and Technology', city: 'Abeokuta', state: 'Ogun', acronym: 'MAUSTECH', formerNames: ['Moshood Abiola Polytechnic (MAPOLY)'], established: 2017 },
  { name: 'Zamfara State University', city: 'Talata Mafara', state: 'Zamfara', acronym: 'ZAMSUT', established: 2018 },
  { name: 'Bayelsa Medical University', city: 'Yenagoa', state: 'Bayelsa', acronym: 'BMU', established: 2019 },
  { name: 'University of Agriculture and Environmental Sciences', city: 'Umuagwo', state: 'Imo', acronym: 'UAES', established: 2019 },
  { name: 'Confluence University of Science and Technology', city: 'Osara', state: 'Kogi', acronym: 'CUSTECH', established: 2020 },
  { name: 'Bamidele Olumilua University of Education, Science and Technology', city: 'Ikere-Ekiti', state: 'Ekiti', acronym: 'BOUESTI', established: 2020 },
  { name: 'University of Delta', city: 'Agbor', state: 'Delta', acronym: 'UNIDEL', established: 2021 },
  { name: 'Delta State University of Science and Technology', city: 'Ozoro', state: 'Delta', acronym: 'DSUST', formerNames: ['Delta State Polytechnic, Ozoro'], established: 2021 },
  { name: 'Dennis Osadebay University', city: 'Asaba', state: 'Delta', acronym: 'DOU', established: 2021 },
  { name: 'Lagos State University of Education', city: 'Ijanikin', state: 'Lagos', acronym: 'LASUED', established: 2022 },
  { name: 'Lagos State University of Science and Technology', city: 'Ikorodu', state: 'Lagos', acronym: 'LASUSTECH', established: 2022 },
  { name: 'Shehu Shagari University of Education', city: 'Sokoto', state: 'Sokoto', acronym: 'SSUES', established: 2022 },
  { name: 'State University of Medical and Applied Sciences', city: 'Igbo-Eno', state: 'Enugu', acronym: 'SUMAS', established: 2022 },
  { name: 'University of Ilesa', city: 'Ilesa', state: 'Osun', acronym: 'UNILESA', established: 2022 },
  { name: 'Emanuel Alayande University of Education', city: 'Oyo', state: 'Oyo', acronym: 'EAUED', established: 2022 },
  { name: 'Kogi State University, Kabba', city: 'Kabba', state: 'Kogi', acronym: 'KSUK', established: 2023 },
  { name: 'Abdulkadir Kure University', city: 'Minna', state: 'Niger', acronym: 'AKUM', established: 2023 },
  // Part 2B (61–69)
  { name: 'Kwara State University of Education', city: 'Ilorin', state: 'Kwara', acronym: 'KWASUED', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'Abdulsalam Abubakar University of Agriculture and Climate Action', city: 'Mokwa', state: 'Niger', acronym: 'AAUACA', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'Ebonyi State University of ICT, Science and Technology', city: 'Oferekpe', state: 'Ebonyi', acronym: 'EBSU-ICT', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'Cross River University of Education and Entrepreneurship', city: 'Akamkpa', state: 'Cross River', acronym: 'CRUEE', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'Benue State University of Agriculture, Science and Technology', city: 'Ihugh', state: 'Benue', acronym: 'BSUAST', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'University of Aeronautics and Aerospace Engineering', city: 'Ezza', state: 'Ebonyi', acronym: 'UAAE', established: 2024, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'University of Innovation, Science and Technology', city: 'Omuma', state: 'Imo', acronym: 'UIST', established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'Taraba State University of Tropical Agriculture, Science, Technology and Climate Action', city: 'Gembu', state: 'Taraba', acronym: 'TSUTASCA', established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
  { name: 'Jigawa State University of Medical and Allied Health Sciences', city: 'Majia', state: 'Jigawa', acronym: 'JSUMAHS', established: 2025, verificationStatus: 'pending_verification', operationalStatusNote: STATE_UNIV_2024_NOTE },
];

// ============================================================================
// BATCH 3 — PRIVATE UNIVERSITIES (Deduplicated across Part 3A–3D)
// Note: Covenant University (inst-covenant) is preserved in initialData.ts
// ============================================================================
const PRIVATE_UNIVERSITIES_BATCH: SeedTuple[] = [
  // Deduplicated Part 3A + 3B + 3C + 3D
  { name: 'Abdulrasaq Abubakar Toyin University', city: 'Ganmo', state: 'Kwara' },
  { name: 'Aletheia University', city: 'Ago-Iwoye', state: 'Ogun' },
  { name: 'Al-Hikmah University', city: 'Ilorin', state: 'Kwara' },
  { name: 'Al-Istiqama University', city: 'Sumaila', state: 'Kano' },
  { name: 'Al-Qalam University', city: 'Katsina', state: 'Katsina' },
  { name: 'Al-Bayan University', city: 'Ankpa', state: 'Kogi' },
  { name: 'Al-Muhibbah Open University', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Amadeus University', city: 'Amizi', state: 'Abia' },
  { name: 'Amaj University', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'American University of Nigeria', city: 'Yola', state: 'Adamawa', acronym: 'AUN' },
  { name: 'American Open University', city: 'Abeokuta', state: 'Ogun' },
  { name: 'Anchor University', city: 'Ayobo', state: 'Lagos' },
  { name: 'Arthur Jarvis University', city: 'Akpabuyo', state: 'Cross River' },
  { name: 'Atiba University', city: 'Oyo', state: 'Oyo' },
  { name: 'Augustine University', city: 'Ilara', state: 'Lagos' },
  { name: 'Ave Maria University', city: 'Piyanko', state: 'Nasarawa' },
  { name: 'Azman University', city: 'Kano', state: 'Kano' },
  { name: 'Azione Verde University', city: 'Amaigbo', state: 'Imo' },
  { name: 'Babcock University', city: 'Ilishan-Remo', state: 'Ogun', acronym: 'BU' },
  { name: 'Baze University', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Bells University of Technology', city: 'Ota', state: 'Ogun', acronym: 'BellsTech' },
  { name: 'Benson Idahosa University', city: 'Benin City', state: 'Edo', acronym: 'BIU' },
  { name: 'Bingham University', city: 'New Karu', state: 'Nasarawa' },
  { name: 'Bowen University', city: 'Iwo', state: 'Osun' },
  { name: 'British Canadian University', city: 'Obudu', state: 'Cross River' },
  { name: 'Bridget University Mbaise', city: 'Okirika-Nweke', state: 'Imo' },
  { name: 'Caleb University', city: 'Imota', state: 'Lagos' },
  { name: 'Canadian University of Nigeria', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Capital City University', city: 'Kano', state: 'Kano' },
  { name: 'Caritas University', city: 'Enugu', state: 'Enugu' },
  { name: 'Chrisland University', city: 'Abeokuta', state: 'Ogun' },
  { name: 'Christopher University', city: 'Mowe', state: 'Ogun' },
  { name: 'City University Abuja', city: 'Abuja', state: 'FCT Abuja', formerNames: ['City University'] },
  { name: 'Claretian University of Nigeria', city: 'Nekede', state: 'Imo' },
  { name: 'Clifford University', city: 'Owerrinta', state: 'Abia' },
  { name: 'Coal City University', city: 'Enugu', state: 'Enugu' },
  { name: 'Cosmopolitan University', city: 'Abuja', state: 'FCT Abuja' },
  // Covenant University is in initialData.ts (inst-covenant)
  { name: 'Crawford University', city: 'Igbesa', state: 'Ogun' },
  { name: 'Crescent University', city: 'Abeokuta', state: 'Ogun' },
  // Part 3B
  { name: 'Redeemer\'s University', city: 'Ede / Mowe', state: 'Osun', acronym: 'RUN', operationalStatusNote: 'Listed at Mowe in earlier NUC directory and permanently situated in Ede, Osun State.' },
  { name: 'McPherson University', city: 'Seriki Sotayo', state: 'Ogun' },
  { name: 'Southwestern University', city: 'Okun-Owa', state: 'Ogun' },
  { name: 'Hallmark University', city: 'Ijebu-Itele', state: 'Ogun' },
  { name: 'Mountain Top University', city: 'Makogi/Oba', state: 'Ogun', acronym: 'MTU' },
  { name: 'Trinity University', city: 'Laloko', state: 'Ogun' },
  { name: 'University of Fortune', city: 'Igbotako', state: 'Ondo' },
  { name: 'Achievers University', city: 'Owo', state: 'Ondo' },
  { name: 'Wesley University', city: 'Ondo', state: 'Ondo' },
  { name: 'Elizade University', city: 'Ilara-Mokin', state: 'Ondo' },
  { name: 'Sam Maris University', city: 'Supare-Akoko', state: 'Ondo' },
  { name: 'Mercy Medical University', city: 'Iwara, Iwo', state: 'Osun' },
  { name: 'Joseph Ayo Babalola University', city: 'Ikeji-Arakeji', state: 'Osun', acronym: 'JABU' },
  { name: 'Fountain University', city: 'Osogbo', state: 'Osun' },
  { name: 'Oduduwa University', city: 'Ipetumodu', state: 'Osun' },
  { name: 'Adeleke University', city: 'Ede', state: 'Osun' },
  { name: 'Kings University', city: 'Ode-Omu', state: 'Osun' },
  { name: 'Westland University', city: 'Iwo', state: 'Osun' },
  { name: 'Ajayi Crowther University', city: 'Oyo', state: 'Oyo', acronym: 'ACU' },
  { name: 'Lead City University', city: 'Ibadan', state: 'Oyo', acronym: 'LCU' },
  { name: 'Dominican University', city: 'Ibadan', state: 'Oyo' },
  { name: 'Kola Daisi University', city: 'Ibadan', state: 'Oyo', acronym: 'KDU' },
  { name: 'Precious Cornerstone University', city: 'Ibadan', state: 'Oyo', acronym: 'PCU' },
  { name: 'Dominion University', city: 'Ibadan', state: 'Oyo' },
  { name: 'West Midland Open University', city: 'Ibadan', state: 'Oyo' },
  { name: 'Karl-Kumm University', city: 'Vom', state: 'Plateau' },
  { name: 'ANAN University', city: 'Kwall', state: 'Plateau' },
  { name: 'Wigwe University', city: 'Isiokpo', state: 'Rivers' },
  { name: 'Rhema University', city: 'Obeama-Asa', state: 'Rivers' },
  { name: 'PAMO University of Medical Sciences', city: 'Port Harcourt', state: 'Rivers', acronym: 'PUMS' },
  { name: 'Iconic Open University', city: 'Sokoto', state: 'Sokoto' },
  { name: 'Saisa University of Medical Sciences and Technology', city: 'Sokoto', state: 'Sokoto' },
  { name: 'Northwest University, Sokoto', city: 'Sokoto', state: 'Sokoto', formerNames: ['Northwest University (Sokoto)'] },
  { name: 'Greenland University', city: 'Jalingo', state: 'Taraba' },
  { name: 'Kwararafa University', city: 'Wukari', state: 'Taraba' },
  { name: 'Huda University', city: 'Gusau', state: 'Zamfara' },
  {
    name: 'College of Petroleum and Energy Studies, Kaduna',
    city: 'Kaduna',
    state: 'Kaduna',
    verificationStatus: 'flagged',
    operationalStatusNote: 'Listed on the NUC university portal; ownership and non-conventional private university classification require verification.',
  },
  {
    name: 'Transatlantic University of Medicine and Health Sciences',
    city: 'Umuchukwu',
    state: 'Anambra',
    verificationStatus: 'flagged',
    operationalStatusNote: 'Listed as private in NUC portal; current approval and operational status require confirmation.',
  },
  // Part 3C & 3D remaining unique entries
  { name: 'Kevin Eze University', city: 'Mgbowo', state: 'Enugu' },
  { name: 'Renaissance University', city: 'Enugu', state: 'Enugu' },
  { name: 'Godfrey Okoye University', city: 'Ugwuomu-Nike', state: 'Enugu', acronym: 'GOUNI' },
  { name: 'Miva Open University', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Prime University', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'African School of Economics', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Eranova University', city: 'Mabushi, Abuja', state: 'FCT Abuja' },
  { name: 'Leadership University', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Ummah University of Nigeria', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Veritas University', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'African University of Science and Technology', city: 'Abuja', state: 'FCT Abuja', acronym: 'AUST' },
  { name: 'Nile University of Nigeria', city: 'Abuja', state: 'FCT Abuja', acronym: 'NILE' },
  { name: 'Philomath University', city: 'Kuje, Abuja', state: 'FCT Abuja' },
  { name: 'European University of Nigeria', city: 'Duboyi, Abuja', state: 'FCT Abuja' },
  { name: 'Jewel University', city: 'Gombe', state: 'Gombe' },
  { name: 'North Eastern University', city: 'Gombe', state: 'Gombe' },
  { name: 'Maria Assumpta University', city: 'Owerri', state: 'Imo' },
  { name: 'Unique Open University', city: 'Ojo', state: 'Lagos' },
  { name: 'Regnum Medical University', city: 'Anthony', state: 'Lagos' },
  { name: 'Pan-Atlantic University', city: 'Lekki', state: 'Lagos', acronym: 'PAU' },
  { name: 'Eko University of Medical Sciences', city: 'Ijanikin', state: 'Lagos', acronym: 'EkoUNIMED' },
  { name: 'Maranatha University', city: 'Lekki', state: 'Lagos' },
  { name: 'James Hope University', city: 'Lekki', state: 'Lagos' },
  { name: 'Mewar University', city: 'Masaka', state: 'Nasarawa' },
  { name: 'Phoenix University', city: 'Agwada', state: 'Nasarawa' },
  { name: 'El-Amin University', city: 'Minna', state: 'Niger' },
  { name: 'JEFAP University', city: 'Suleja', state: 'Niger' },
  {
    name: 'Sani Bello University',
    city: 'Kontagora',
    state: 'Niger',
    verificationStatus: 'pending_verification',
    operationalStatusNote: 'Provisional license announced by NUC in July 2026; operational readiness pending verification.',
  },
  { name: 'Edusoko University', city: 'Bida', state: 'Niger' },
  { name: 'Newgate University', city: 'Minna', state: 'Niger' },
  { name: 'Vision University', city: 'Ikogbo', state: 'Ogun' },
  { name: 'Gerar University of Medical Sciences', city: 'Imope-Ijebu', state: 'Ogun' },
  { name: 'New City University', city: 'Ayetoro', state: 'Ogun' },
  { name: 'Monarch University', city: 'Iyesi-Ota', state: 'Ogun' },
  { name: 'Abdulfattah Durojaiye University', city: 'Abeokuta', state: 'Ogun' },
  { name: 'Millennium Crest University', city: 'Ikare-Akoko', state: 'Ondo' },
  { name: 'Minaret University', city: 'Ikirun', state: 'Osun' },
  { name: 'Owolabi University', city: 'Oke-Ila Orangun', state: 'Osun' },
  { name: 'University of Mkar', city: 'Mkar', state: 'Benue' },
  { name: 'Al-Ansar University', city: 'Maiduguri', state: 'Borno' },
  { name: 'The Duke Medical University', city: 'Calabar', state: 'Cross River' },
  { name: 'Pearl University', city: 'Calabar', state: 'Cross River' },
  { name: 'Havilla University', city: 'Nde-Ikom', state: 'Cross River' },
  { name: 'Novena University', city: 'Ogume', state: 'Delta' },
  { name: 'Western Delta University', city: 'Oghara', state: 'Delta' },
  { name: 'Michael and Cecilia Ibru University', city: 'Owhode', state: 'Delta' },
  { name: 'Edwin Clark University', city: 'Kiagbodo', state: 'Delta' },
  { name: 'Margaret Lawrence University', city: 'Galilee', state: 'Delta' },
  { name: 'Sports University', city: 'Idumuje-Ugboko', state: 'Delta' },
  { name: 'Evangel University', city: 'Akaeze', state: 'Ebonyi' },
  { name: 'Jimoh Babalola University', city: 'Ilorin', state: 'Kwara' },
  { name: 'Euston University', city: 'Abakaliki', state: 'Ebonyi' },
  { name: 'Adeche Momoh University', city: 'Igarra', state: 'Edo' },
  { name: 'Godday Erewa University', city: 'Sapele', state: 'Delta' },
  { name: 'High Flyers University', city: 'Ikere-Ekiti', state: 'Ekiti' },
  {
    name: 'Omega University',
    city: 'Kaduna',
    state: 'Kaduna',
    verificationStatus: 'pending_verification',
    operationalStatusNote: 'Provisional license announced by NUC in July 2026; operational readiness pending verification.',
  },
];

// ============================================================================
// BATCH 4 — POLYTECHNICS (Deduplicated Federal, State, Private + Historical)
// Note: Yaba College of Technology (inst-yabatech) is preserved in initialData.ts
// ============================================================================
const NBTE_EXPIRED_APPROVAL_NOTE =
  'NBTE public register currently displays expired programme approval status; this does not establish institutional closure and requires confirmation.';

const FEDERAL_POLYTECHNICS_BATCH: SeedTuple[] = [
  // Air Force Institute of Technology is in FEDERAL_UNIVERSITIES_PART_1B with dual NBTE/NUC note
  { name: 'Akanu Ibiam Federal Polytechnic', city: 'Unwana', state: 'Ebonyi' },
  { name: 'Auchi Polytechnic', city: 'Auchi', state: 'Edo' },
  { name: 'Federal Polytechnic, Ado-Ekiti', city: 'Ado-Ekiti', state: 'Ekiti' },
  { name: 'Federal Polytechnic, Bauchi', city: 'Bauchi', state: 'Bauchi' },
  { name: 'Federal Polytechnic, Bida', city: 'Bida', state: 'Niger' },
  { name: 'Federal Polytechnic, Daura', city: 'Daura', state: 'Katsina' },
  { name: 'Federal Polytechnic, Damaturu', city: 'Damaturu', state: 'Yobe' },
  { name: 'Federal Polytechnic, Ede', city: 'Ede', state: 'Osun' },
  { name: 'Federal Polytechnic, Ekowe', city: 'Ekowe', state: 'Bayelsa' },
  { name: 'Federal Polytechnic, Idah', city: 'Idah', state: 'Kogi' },
  { name: 'Federal Polytechnic, Ilaro', city: 'Ilaro', state: 'Ogun' },
  { name: 'Federal Polytechnic, Kabo', city: 'Kabo', state: 'Kano' },
  { name: 'Federal Polytechnic, Kaltungo', city: 'Kaltungo', state: 'Gombe' },
  { name: 'Federal Polytechnic, Kaura Namoda', city: 'Kaura Namoda', state: 'Zamfara' },
  { name: 'Federal Polytechnic, Mubi', city: 'Mubi', state: 'Adamawa' },
  { name: 'Federal Polytechnic, Nasarawa', city: 'Nasarawa', state: 'Nasarawa' },
  { name: 'Federal Polytechnic, Nekede', city: 'Nekede, Owerri', state: 'Imo' },
  { name: 'Federal Polytechnic, Oko', city: 'Oko', state: 'Anambra' },
  { name: 'Federal Polytechnic, Offa', city: 'Offa', state: 'Kwara' },
  { name: 'Federal Polytechnic, Ohodo', city: 'Ohodo', state: 'Enugu' },
  { name: 'Federal Polytechnic, Orogun', city: 'Orogun', state: 'Delta' },
  { name: 'Federal Polytechnic, Ukana', city: 'Ukana', state: 'Akwa Ibom' },
  { name: 'Federal Polytechnic, Bali', city: 'Bali', state: 'Taraba' },
  { name: 'Federal Polytechnic, Monguno', city: 'Monguno', state: 'Borno' },
  { name: 'Federal Polytechnic, Ugep', city: 'Ugep', state: 'Cross River' },
  { name: 'Federal Polytechnic, Isu', city: 'Isu', state: 'Imo' },
  { name: 'Federal Polytechnic, Ayede', city: 'Ayede', state: 'Oyo' },
  { name: 'Federal Polytechnic, Ile-Oluji', city: 'Ile-Oluji', state: 'Ondo' },
  { name: 'Federal Polytechnic of Oil and Gas, Bonny', city: 'Bonny', state: 'Rivers', formerNames: ['Federal Polytechnic, Bonny'] },
  { name: 'Federal Polytechnic, Ngodo-Isuochi', city: 'Ngodo-Isuochi', state: 'Abia' },
  { name: 'Federal Polytechnic, Nyak, Shendam', city: 'Nyak, Shendam', state: 'Plateau' },
  { name: 'Federal Polytechnic, Wannune', city: 'Wannune', state: 'Benue' },
  // Ownership corrections moved cleanly into Federal Polytechnics
  {
    name: 'Kaduna Polytechnic',
    city: 'Kaduna',
    state: 'Kaduna',
    acronym: 'KADPOLY',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'Confirmed Federal ownership under NBTE register; also listed by NCCE as a Polytechnic offering NCE programmes.',
  },
  { name: 'Hussaini Adamu Federal Polytechnic', city: 'Kazaure', state: 'Jigawa', operationalStatusNote: 'Confirmed Federal ownership under NBTE register.' },
  {
    name: 'Waziri Umaru Federal Polytechnic',
    city: 'Birnin Kebbi',
    state: 'Kebbi',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'NBTE Federal Polytechnic offering ND, HND, and NCCE-recognised NCE programmes.',
  },
];

const STATE_POLYTECHNICS_BATCH: SeedTuple[] = [
  { name: 'Abdu Gusau Polytechnic', city: 'Talata Mafara', state: 'Zamfara' },
  { name: 'Abia State Polytechnic', city: 'Aba', state: 'Abia' },
  { name: 'Abraham Adesanya Polytechnic', city: 'Ijebu-Igbo', state: 'Ogun' },
  { name: 'Abubakar Tatari Ali Polytechnic', city: 'Bauchi', state: 'Bauchi', acronym: 'ATAP' },
  { name: 'Adamawa State Polytechnic', city: 'Yola', state: 'Adamawa' },
  { name: 'Adeseun Ogundoyin Polytechnic', city: 'Eruwa', state: 'Oyo' },
  { name: 'Akawe Torkula Polytechnic', city: 'Makurdi', state: 'Benue' },
  {
    name: 'Akwa Ibom State College of Arts and Science',
    city: 'Nung Ukim',
    state: 'Akwa Ibom',
    verificationStatus: 'pending_verification',
    operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE,
  },
  { name: 'Akwa Ibom State Polytechnic', city: 'Ikot Osurua', state: 'Akwa Ibom' },
  { name: 'Anambra State Polytechnic', city: 'Mgbakwu', state: 'Anambra' },
  { name: 'Bayelsa State Polytechnic', city: 'Aleibiri', state: 'Bayelsa' },
  {
    name: 'Benue State Polytechnic',
    city: 'Ugbokolo',
    state: 'Benue',
    verificationStatus: 'flagged',
    operationalStatusNote: 'Location flagged: NBTE register displays Edo State in one record, inconsistent with its campus at Ugbokolo, Benue State.',
  },
  { name: 'Binyaminu Usman Polytechnic', city: 'Hadejia', state: 'Jigawa' },
  { name: 'Delta State Polytechnic, Ogwashi-Uku', city: 'Ogwashi-Uku', state: 'Delta' },
  { name: 'Delta State Polytechnic, Otefe-Oghara', city: 'Otefe-Oghara', state: 'Delta' },
  { name: 'Edo State Polytechnic', city: 'Usen', state: 'Edo' },
  { name: 'Ekiti State Polytechnic', city: 'Isan-Ekiti', state: 'Ekiti' },
  { name: 'Enugu State Polytechnic', city: 'Iwollo', state: 'Enugu' },
  { name: 'Imo State Polytechnic', city: 'Omuma', state: 'Imo' },
  { name: 'Jigawa State Polytechnic', city: 'Dutse', state: 'Jigawa' },
  {
    name: 'Kano State Polytechnic',
    city: 'Kano',
    state: 'Kano',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'Also listed by NCCE as a Polytechnic offering NCE programmes.',
  },
  { name: 'Katsina Institute of Technology and Management', city: 'Katsina', state: 'Katsina' },
  { name: 'Kogi State Polytechnic', city: 'Lokoja', state: 'Kogi' },
  { name: 'Kwara State Polytechnic', city: 'Ilorin', state: 'Kwara' },
  { name: 'Niger State Polytechnic', city: 'Zungeru', state: 'Niger' },
  { name: 'D.S. Adegbenro ICT Polytechnic', city: 'Itori-Ewekoro', state: 'Ogun' },
  { name: 'Ogun State Institute of Technology', city: 'Igbesa', state: 'Ogun' },
  { name: 'Osun State College of Technology', city: 'Esa-Oke', state: 'Osun', acronym: 'OSCOTECH' },
  { name: 'Osun State Polytechnic', city: 'Iree', state: 'Osun', acronym: 'OSPOLY' },
  {
    name: 'Plateau State Polytechnic',
    city: 'Barkin-Ladi',
    state: 'Plateau',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'Also listed by NCCE as a Polytechnic offering NCE programmes.',
  },
  { name: 'Port Harcourt Polytechnic', city: 'Port Harcourt', state: 'Rivers' },
  { name: 'Umaru Ali Shinkafi Polytechnic', city: 'Sokoto', state: 'Sokoto' },
  { name: 'Taraba State Polytechnic', city: 'Suntai', state: 'Taraba' },
  { name: 'College of Agriculture, Science and Technology, Gujba', city: 'Gujba', state: 'Yobe', operationalStatusNote: 'Classified by NBTE under the State Polytechnic category.' },
  { name: 'College of Agriculture, Science and Technology, Lafia', city: 'Lafia', state: 'Nasarawa', operationalStatusNote: 'Classified by NBTE under the State Polytechnic category.' },
  { name: 'Cross River Institute of Technology and Management', city: 'Ugep', state: 'Cross River' },
  { name: 'Gombe State Polytechnic', city: 'Bajoga', state: 'Gombe' },
  {
    name: 'Hassan Usman Katsina Polytechnic',
    city: 'Katsina',
    state: 'Katsina',
    acronym: 'HUKPOLY',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'Also listed by NCCE as a Polytechnic offering NCE programmes.',
  },
  { name: 'Isa Mustapha Agwai Polytechnic', city: 'Lafia', state: 'Nasarawa', formerNames: ['Nasarawa State Polytechnic'] },
  {
    name: 'Kebbi State Polytechnic',
    city: 'Dakingari',
    state: 'Kebbi',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'Also listed by NCCE as a Polytechnic offering NCE programmes.',
  },
  { name: 'Mai-Idris Alooma Polytechnic', city: 'Geidam', state: 'Yobe' },
  {
    name: 'Nuhu Bamalli Polytechnic',
    city: 'Zaria',
    state: 'Kaduna',
    acronym: 'NUBAPOLY',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'Also listed by NCCE as a Polytechnic offering NCE programmes.',
  },
  {
    name: 'Ramat Polytechnic',
    city: 'Maiduguri',
    state: 'Borno',
    accreditationBody: 'National Board for Technical Education (NBTE) / NCCE (NCE Programmes)',
    operationalStatusNote: 'Also listed by NCCE as a Polytechnic offering NCE programmes.',
  },
  { name: 'The Oke-Ogun Polytechnic', city: 'Saki', state: 'Oyo', acronym: 'TOPS' },
  { name: 'The Polytechnic, Ibadan', city: 'Ibadan', state: 'Oyo', acronym: 'POLYIBADAN' },
  { name: 'The Polytechnic, Iresi', city: 'Iresi', state: 'Osun' },
];

const PRIVATE_POLYTECHNICS_BATCH: SeedTuple[] = [
  { name: 'Ajayi Polytechnic', city: 'Ara-Ekiti', state: 'Ekiti' },
  { name: 'Al-Hikma Polytechnic', city: 'Karu', state: 'Nasarawa' },
  { name: 'Allover Central Polytechnic', city: 'Sango-Ota', state: 'Ogun' },
  { name: 'Ashi Polytechnic', city: 'Anyiin', state: 'Benue' },
  { name: 'Bellarks Polytechnic', city: 'Kwale', state: 'Delta' },
  { name: 'Best Solution Polytechnic', city: 'Akure', state: 'Ondo' },
  { name: 'Bolmor Polytechnic', city: 'Ibadan', state: 'Oyo' },
  { name: 'Citi Polytechnic', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Crown Polytechnic', city: 'Ado-Ekiti', state: 'Ekiti' },
  { name: 'Dorben Polytechnic', city: 'Bwari, Abuja', state: 'FCT Abuja' },
  { name: 'Eastern Polytechnic', city: 'Port Harcourt', state: 'Rivers' },
  { name: 'Fidei Polytechnic', city: 'Gboko', state: 'Benue' },
  { name: 'Foundation Polytechnic', city: 'Ikot Idem, Ikot Ekpene', state: 'Akwa Ibom' },
  { name: 'Grace Polytechnic', city: 'Surulere', state: 'Lagos' },
  { name: 'Heritage Polytechnic', city: 'Eket', state: 'Akwa Ibom' },
  { name: 'Lens Polytechnic', city: 'Offa', state: 'Kwara' },
  { name: 'Lighthouse Polytechnic', city: 'Abudu', state: 'Edo' },
  { name: 'Marist Polytechnic', city: 'Emene', state: 'Enugu' },
  { name: 'NACABS Polytechnic', city: 'Akwanga', state: 'Nasarawa' },
  // Part 4D continued (with explicit NBTE active vs expired approval status)
  { name: 'Brainfill Polytechnic', city: 'Ikot-Ekpene', state: 'Akwa Ibom', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'Coastal Polytechnic', city: 'Badagry', state: 'Lagos', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'Ekiti City Polytechnic', city: 'Umuooke', state: 'Ekiti', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Enville Polytechnic', city: 'Lagos', state: 'Lagos' },
  { name: 'First City Polytechnic', city: 'Abeokuta', state: 'Ogun' },
  { name: 'Gloryland Polytechnic', city: 'Ankpa', state: 'Kogi' },
  { name: 'Grundtvig Polytechnic', city: 'Oba', state: 'Anambra', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'Inspire Polytechnic', city: 'Lagos', state: 'Lagos', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'Kalac Crystal Polytechnic', city: 'Lekki', state: 'Lagos', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Lagos City Polytechnic', city: 'Ikeja', state: 'Lagos', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Montgomery Polytechnic', city: 'Ado-Ekiti', state: 'Ekiti' },
  { name: 'Paramount Polytechnic', city: 'Ejigbo', state: 'Lagos', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Renaissance Modern Polytechnic', city: 'Mbaukwu', state: 'Anambra', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Ronik Polytechnic', city: 'Ejigbo', state: 'Lagos', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'St. Mary Polytechnic', city: 'Kwamba, Suleja', state: 'Niger' },
  { name: 'Sure Foundation Polytechnic', city: 'Ikot-Akai', state: 'Akwa Ibom', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'Teedek Polytechnic', city: 'Ilogbo-Ekiti', state: 'Ekiti', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Temple Gate Polytechnic', city: 'Aba', state: 'Abia', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Timeon Kairos Polytechnic', city: 'Lagos', state: 'Lagos' },
  { name: 'Trinity Polytechnic', city: 'Uyo', state: 'Akwa Ibom', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'Ultra Excellence Polytechnic', city: 'Uyo', state: 'Akwa Ibom', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Uma Ukpai Polytechnic', city: 'Ohafia', state: 'Abia', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
  { name: 'Uyo City Polytechnic', city: 'Uyo', state: 'Akwa Ibom', operationalStatusNote: 'NBTE register shows active programme approval.' },
  { name: 'Valley View Polytechnic', city: 'Ohafia', state: 'Abia', verificationStatus: 'pending_verification', operationalStatusNote: NBTE_EXPIRED_APPROVAL_NOTE },
];

const HISTORICAL_POLYTECHNICS_BATCH: SeedTuple[] = [
  {
    name: 'Moshood Abiola Polytechnic',
    city: 'Abeokuta',
    state: 'Ogun',
    acronym: 'MAPOLY',
    ownership: 'State',
    isHistorical: true,
    successorName: 'Moshood Abiola University of Science and Technology (MAUSTECH)',
    operationalStatusNote: 'Historical / converted polytechnic record; successor is Moshood Abiola University of Science and Technology.',
  },
  {
    name: 'Delta State Polytechnic, Ozoro',
    city: 'Ozoro',
    state: 'Delta',
    ownership: 'State',
    isHistorical: true,
    successorName: 'Delta State University of Science and Technology (DSUST)',
    operationalStatusNote: 'Historical / converted polytechnic record; successor is Delta State University of Science and Technology.',
  },
  {
    name: 'Bayelsa State College of Arts and Science',
    city: 'Elebele',
    state: 'Bayelsa',
    ownership: 'State',
    isHistorical: true,
    verificationStatus: 'pending_verification',
    operationalStatusNote: 'Historical NBTE institution record requiring institutional succession and current status verification.',
  },
];

// ============================================================================
// BATCH 5 — COLLEGES OF EDUCATION (Federal, State, Private + Specialised NCE)
// Note: Federal College of Education (Technical) Akoka (inst-fcet) is in initialData.ts
// ============================================================================
const FEDERAL_COE_BATCH: SeedTuple[] = [
  { name: 'Adeyemi College of Education', city: 'Ondo', state: 'Ondo', operationalStatusNote: 'Retained alongside its NUC listing as Adeyemi University of Education, Ondo during transition.' },
  { name: 'Alvan Ikoku Federal College of Education', city: 'Owerri', state: 'Imo', operationalStatusNote: 'Retained alongside its NUC listing as Alvan Ikoku Federal University of Education.' },
  { name: 'Federal College of Education, Abeokuta', city: 'Abeokuta', state: 'Ogun', acronym: 'FCE Abeokuta' },
  { name: 'Federal College of Education, Eha-Amufu', city: 'Eha-Amufu', state: 'Enugu' },
  { name: 'Federal College of Education, Jama\'are', city: 'Jama\'are', state: 'Bauchi' },
  { name: 'Federal College of Education, Odugbo', city: 'Odugbo, Apa', state: 'Benue' },
  { name: 'Federal College of Education (Technical), Isu', city: 'Isu', state: 'Ebonyi', formerNames: ['Federal College of Education, Isu'] },
  { name: 'Federal College of Education (Technical), Ekiadolor', city: 'Ekiadolor', state: 'Edo' },
  { name: 'Federal College of Education, Kano', city: 'Kano', state: 'Kano', operationalStatusNote: 'Retained alongside its NUC transition listing as Federal University of Education, Kano.' },
  { name: 'Federal College of Education, Katsina', city: 'Katsina', state: 'Katsina' },
  { name: 'Federal College of Education, Kontagora', city: 'Kontagora', state: 'Niger', operationalStatusNote: 'Retained alongside its NUC transition listing as Federal University of Education, Kontagora.' },
  { name: 'Federal College of Education, Obudu', city: 'Obudu', state: 'Cross River' },
  { name: 'Federal College of Education, Okene', city: 'Okene', state: 'Kogi' },
  { name: 'Federal College of Education, Ididep', city: 'Ididep', state: 'Akwa Ibom' },
  { name: 'Federal College of Education, Iwo', city: 'Iwo', state: 'Osun' },
  { name: 'Federal College of Education, Pankshin', city: 'Pankshin', state: 'Plateau', operationalStatusNote: 'Retained alongside its NUC transition listing as Federal University of Education, Pankshin.' },
  { name: 'Federal College of Education, Gidan Madi', city: 'Gidan Madi', state: 'Sokoto' },
  { name: 'Federal College of Education, Yola', city: 'Yola', state: 'Adamawa' },
  { name: 'Federal College of Education, Zaria', city: 'Zaria', state: 'Kaduna', operationalStatusNote: 'Retained alongside its NUC transition listing as Federal University of Education, Zaria.' },
  // inst-fcet (FCE Technical Akoka) is in initialData.ts
  { name: 'Federal College of Education (Technical), Asaba', city: 'Asaba', state: 'Delta' },
  { name: 'Federal College of Education (Technical), Bichi', city: 'Bichi', state: 'Kano' },
  { name: 'Federal College of Education (Technical), Gombe', city: 'Gombe', state: 'Gombe' },
  { name: 'Federal College of Education (Technical), Gusau', city: 'Gusau', state: 'Zamfara' },
  { name: 'Federal College of Education (Technical), Omoku', city: 'Omoku', state: 'Rivers' },
  { name: 'Federal College of Education (Technical), Potiskum', city: 'Potiskum', state: 'Yobe' },
  { name: 'Federal College of Education (Technical), Umunze', city: 'Umunze', state: 'Anambra' },
  { name: 'Federal College of Education (Special), Oyo', city: 'Oyo', state: 'Oyo', acronym: 'FCES Oyo' },
  { name: 'FCT College of Education, Zuba', city: 'Zuba', state: 'FCT Abuja', operationalStatusNote: 'Federally owned institution under NCCE classification.' },
  { name: 'Federal College of Education (Technical), Yauri', city: 'Yauri', state: 'Kebbi' },
  { name: 'Federal College of Education (Technical), Keana', city: 'Keana', state: 'Nasarawa' },
  { name: 'Federal College of Education, Ofeme-Ohuhu', city: 'Ofeme-Ohuhu', state: 'Abia' },
  { name: 'Federal College of Education, Ilawe-Ekiti', city: 'Ilawe-Ekiti', state: 'Ekiti' },
  // Specialised Federal NCE-awarding institutions (kept distinct from conventional FCEs)
  {
    name: 'Nigerian Army School of Education, Ilorin',
    city: 'Ilorin',
    state: 'Kwara',
    commonName: 'Nigerian Army College of Education (NACOE), Ilorin',
    acronym: 'NASE / NACOE',
    formerNames: ['Nigerian Army College of Education (NACOE)'],
    category: 'specialised_institution',
    level: 'specialised_institution',
    operationalStatusNote: 'Specialised federal military education institution listed in NCCE NTI/Other NCE-Awarding Institutions and JAMB NCE directories.',
  },
  {
    name: 'National Institute for Nigerian Languages, Aba',
    city: 'Aba',
    state: 'Abia',
    acronym: 'NINLAN',
    category: 'specialised_institution',
    level: 'specialised_institution',
    operationalStatusNote: 'Specialised federal NCE-awarding language institute listed in NCCE Other NCE-Awarding Institutions and JAMB NCE directories.',
  },
];

const STATE_COE_BATCH: SeedTuple[] = [
  { name: 'A.D. Rufa\'i College of Education, Legal and General Studies', city: 'Misau', state: 'Bauchi' },
  { name: 'Adamu Augie College of Education', city: 'Argungu', state: 'Kebbi' },
  { name: 'Aminu Sale College of Education', city: 'Azare', state: 'Bauchi' },
  { name: 'Akwa Ibom State College of Education', city: 'Afaha Nsit', state: 'Akwa Ibom' },
  { name: 'Benjamin Uwajumogu State College of Education', city: 'Ihitte Uboma', state: 'Imo' },
  { name: 'College of Education (Technical), Dass', city: 'Dass', state: 'Bauchi' },
  { name: 'College of Education, Akwanga', city: 'Akwanga', state: 'Nasarawa' },
  { name: 'College of Education and Legal Studies, Nguru', city: 'Nguru', state: 'Yobe' },
  { name: 'College of Education, Ilorin', city: 'Ilorin', state: 'Kwara' },
  { name: 'College of Education, Oju', city: 'Oju', state: 'Benue' },
  { name: 'College of Education, Oro', city: 'Oro', state: 'Kwara' },
  { name: 'College of Education, Arochukwu', city: 'Arochukwu', state: 'Abia' },
  { name: 'College of Education, Billiri', city: 'Billiri', state: 'Gombe' },
  { name: 'College of Education, Gindiri', city: 'Gindiri', state: 'Plateau' },
  { name: 'College of Education, Hong', city: 'Hong', state: 'Adamawa' },
  { name: 'College of Education, Ikere-Ekiti', city: 'Ikere-Ekiti', state: 'Ekiti' },
  { name: 'College of Education, Ila-Orangun', city: 'Ila-Orangun', state: 'Osun' },
  { name: 'College of Education, Katsina-Ala', city: 'Katsina-Ala', state: 'Benue' },
  { name: 'College of Education, Waka Biu', city: 'Waka Biu', state: 'Borno' },
  { name: 'College of Education, Warri', city: 'Warri', state: 'Delta' },
  { name: 'College of Education, Zing', city: 'Zing', state: 'Taraba' },
  { name: 'Cross River State College of Education', city: 'Akamkpa', state: 'Cross River' },
  { name: 'Delta State College of Education', city: 'Mosogar', state: 'Delta' },
  { name: 'Ebonyi State College of Education (Technical)', city: 'Ikwo', state: 'Ebonyi' },
  { name: 'Edo State College of Education', city: 'Igueben', state: 'Edo' },
  { name: 'Gombe State College of Education', city: 'Nafada', state: 'Gombe' },
  { name: 'Isaac Jasper Boro College of Education', city: 'Sagbama', state: 'Bayelsa' },
  { name: 'Jigawa State College of Education and Legal Studies', city: 'Ringim', state: 'Jigawa' },
  { name: 'Jigawa State College of Education', city: 'Gumel', state: 'Jigawa' },
  { name: 'Kaduna State College of Education', city: 'Gidan-Waya, Kafanchan', state: 'Kaduna' },
  { name: 'Kano State College of Education and Preliminary Studies', city: 'Kano', state: 'Kano', acronym: 'KASCEPTS' },
  { name: 'Kashim Ibrahim College of Education', city: 'Maiduguri', state: 'Borno' },
  { name: 'Kogi State College of Education, Ankpa', city: 'Ankpa', state: 'Kogi' },
  { name: 'Kogi State College of Education, Kabba', city: 'Kabba', state: 'Kogi' },
  { name: 'Kwara State College of Education (Technical), Lafiagi', city: 'Lafiagi', state: 'Kwara' },
  { name: 'Sa\'adatu Rimi College of Education', city: 'Kumbotso', state: 'Kano' },
  { name: 'Shehu Shagari College of Education', city: 'Sokoto', state: 'Sokoto' },
  { name: 'Sikiru Adetona College of Education, Science and Technology', city: 'Omu-Ajose', state: 'Ogun' },
  { name: 'Umar Ibn Ibrahim El-Kanemi College of Education, Science and Technology', city: 'Bama', state: 'Borno' },
  { name: 'Umar Suleiman College of Education', city: 'Gashua', state: 'Yobe' },
  { name: 'Yusuf Bala Usman College of Education and Legal Studies', city: 'Daura', state: 'Katsina' },
  { name: 'Yusuf Maitama Sule College of Education and Legal Studies', city: 'Gwarzo', state: 'Kano' },
  { name: 'Zamfara State College of Education', city: 'Maru', state: 'Zamfara' },
];

const PRIVATE_COE_BATCH: SeedTuple[] = [
  { name: 'Abdullahi Maikano College of Education', city: 'Wase', state: 'Plateau' },
  { name: 'Abubakar Garba Zagada-Zagada College of Education', city: 'Bajoga', state: 'Gombe' },
  { name: 'Adamu Garkuwa College of Education', city: 'Toro', state: 'Bauchi' },
  { name: 'Al-Fajr College of Education', city: 'Kano', state: 'Kano', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; street address and active admissions require verification.' },
  { name: 'Al-Ibadan College of Education', city: 'Ibadan', state: 'Oyo' },
  { name: 'Al-Iman College of Education', city: 'Plateau', state: 'Plateau', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Al-Madinah College of Education', city: 'Osogbo', state: 'Osun' },
  { name: 'Al-Mustafa College of Education', city: 'Kano', state: 'Kano', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact campus location requires verification.' },
  { name: 'Al-Ummah College of Education', city: 'Osun', state: 'Osun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact campus location requires verification.' },
  { name: 'Ameenuddeen College of Education', city: 'Kano', state: 'Kano' },
  { name: 'Aminu Kano College of Education', city: 'Kano', state: 'Kano' },
  { name: 'Angel Crown College of Education', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Annur College of Education', city: 'Kano', state: 'Kano' },
  { name: 'Ansar-Ud-Deen College of Education', city: 'Isolo', state: 'Lagos' },
  { name: 'Apa College of Education', city: 'Aido', state: 'Benue' },
  { name: 'Al-Hikma College of Education', city: 'Ankpa', state: 'Kogi' },
  { name: 'Archbishop Alexander Ibezim College of Education', city: 'Anambra', state: 'Anambra', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Assanusiya College of Education', city: 'Ode-Omu', state: 'Osun' },
  { name: 'Awori District College of Education', city: 'Ogun', state: 'Ogun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact campus address requires verification.' },
  { name: 'Bayo Tijani College of Education', city: 'Lagos', state: 'Lagos' },
  { name: 'Best Legacy College of Education', city: 'Ogbomoso', state: 'Oyo' },
  { name: 'Bethel College of Education', city: 'Ijare', state: 'Ondo' },
  { name: 'Biga College of Education', city: 'Sokoto', state: 'Sokoto' },
  { name: 'Bogoro College of Education', city: 'Bogoro', state: 'Bauchi' },
  { name: 'Bright College of Education', city: 'Kachia', state: 'Kaduna' },
  { name: 'Calvin Foundation College of Education', city: 'Benue', state: 'Benue', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Christian Chukwuma Onoh College of Education', city: 'Enugu', state: 'Enugu' },
  { name: 'Christian College of Education', city: 'Gombe', state: 'Gombe' },
  { name: 'City College of Education, Mararaba', city: 'Mararaba', state: 'FCT Abuja' },
  { name: 'Climax College of Education', city: 'Bauchi', state: 'Bauchi' },
  { name: 'Coastline College of Education', city: 'Ondo', state: 'Ondo', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact campus location requires verification.' },
  { name: 'Cokwills College of Education', city: 'Lagos', state: 'Lagos' },
  { name: 'College of Education and Entrepreneurship Studies, Lessel', city: 'Lessel', state: 'Benue' },
  { name: 'College of Education Ilemona', city: 'Ilemona', state: 'Kwara' },
  { name: 'College of Education Kura', city: 'Kura', state: 'Kano' },
  { name: 'College of Education, Darazo', city: 'Darazo', state: 'Bauchi' },
  { name: 'College of Education, Dutsen Tanshi', city: 'Dutsen Tanshi', state: 'Bauchi' },
  { name: 'College of Education, Moro, Ife-North', city: 'Moro, Ife-North', state: 'Osun' },
  { name: 'Community College of Education', city: 'Kano', state: 'Kano' },
  { name: 'Corner Stone College of Education', city: 'Ikeja', state: 'Lagos' },
  { name: 'Corona College of Education', city: 'Lekki', state: 'Lagos' },
  { name: 'Covenant College of Education', city: 'Abia', state: 'Abia', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Crescent Pearls Technical College of Education', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Crestfield College of Education', city: 'Osun', state: 'Osun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Dala College of Education', city: 'Kano', state: 'Kano' },
  { name: 'Danyaya College of Education', city: 'Ningi', state: 'Bauchi' },
  { name: 'Dee-Perfect Class College of Education', city: 'Ifon-Osun', state: 'Osun' },
  { name: 'Delar College of Education', city: 'Ibadan', state: 'Oyo' },
  { name: 'Diamond College of Education', city: 'Aba', state: 'Abia' },
  { name: 'Doviana College of Education', city: 'Gboko', state: 'Benue' },
  { name: 'Eagle Mountain College of Education', city: 'Aboh Mbaise', state: 'Imo' },
  { name: 'Ebenezer College of Education', city: 'Amangwu', state: 'Ebonyi' },
  { name: 'ECWA College of Education, Igbaja', city: 'Igbaja', state: 'Kwara' },
  { name: 'ECWA College of Education, Bayara', city: 'Bayara', state: 'Bauchi' },
  { name: 'ECWA College of Education, Jos', city: 'Jos', state: 'Plateau' },
  { name: 'Edexcel College of Education', city: 'Benue', state: 'Benue', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Elder Oyama Memorial College of Education', city: 'Ofat', state: 'Cross River' },
  { name: 'Elibest College of Education', city: 'Ondo', state: 'Ondo', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Elizabeth Memorial College of Education', city: 'Nsukka', state: 'Enugu' },
  { name: 'Emamor College of Education', city: 'Rivers', state: 'Rivers', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Emirate College of Education', city: 'Bauchi', state: 'Bauchi' },
  { name: 'Emmanuel Ebije Ikwue College of Education', city: 'Benue', state: 'Benue', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Good Shepherd College of Education', city: 'Ogun', state: 'Ogun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Grace City College of Education', city: 'Kwara', state: 'Kwara', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Grace College of Education', city: 'Osun', state: 'Osun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Hamzainab College of Education', city: 'Osogbo', state: 'Osun' },
  { name: 'Harvard Wilson College of Education', city: 'Aba', state: 'Abia' },
  { name: 'Hill College of Education', city: 'Gwanje, Akwanga', state: 'Nasarawa' },
  { name: 'His Grace College of Education', city: 'Ilorin', state: 'Kwara' },
  { name: 'Kazaure College of Education', city: 'Kazaure', state: 'Jigawa' },
  { name: 'Kogi East College of Education', city: 'Kogi', state: 'Kogi', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Kwaine College of Education', city: 'Gombe', state: 'Gombe' },
  { name: 'Kwararafa College of Education', city: 'Otukpo', state: 'Benue' },
  { name: 'Lakeview College of Education', city: 'Jalingo', state: 'Taraba' },
  { name: 'Lasting Glory College of Education', city: 'Erunmu-Egbeda', state: 'Oyo' },
  { name: 'Lessel College of Education', city: 'Gboko', state: 'Benue' },
  { name: 'Lifegate College of Education', city: 'Asa', state: 'Kwara' },
  { name: 'Maryam Idris Umar College of Education Limited', city: 'Kano', state: 'Kano' },
  { name: 'MCF College of Education', city: 'Agbarha-Otor', state: 'Delta' },
  { name: 'Meadow Hall College of Education', city: 'Lagos', state: 'Lagos' },
  { name: 'Metro College of Education', city: 'Adogi-Lafia', state: 'Nasarawa' },
  { name: 'Moje College of Education', city: 'Erin-Ile', state: 'Kwara' },
  { name: 'Muftau Olanihun College of Education', city: 'Ibadan', state: 'Oyo' },
  { name: 'Muhyideen College of Education', city: 'Ilorin', state: 'Kwara' },
  { name: 'Peacock College of Education', city: 'Jalingo', state: 'Taraba' },
  { name: 'Peter Oyeleye Fasua College of Education', city: 'Ondo', state: 'Ondo', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Petriot College of Education', city: 'Oyo', state: 'Oyo', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Piaget College of Education', city: 'Abeokuta', state: 'Ogun' },
  { name: 'Pineville College of Education', city: 'Oyo', state: 'Oyo', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Premier College of Education', city: 'Osun', state: 'Osun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Pristine College of Education', city: 'Imo', state: 'Imo', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Providence International College of Education', city: 'Ibadan', state: 'Oyo' },
  { name: 'Raphat College of Education', city: 'Osun', state: 'Osun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Royal City College of Education', city: 'Iyesi-Ota', state: 'Ogun' },
  { name: 'Royal College of Education, Ikeja', city: 'Ikeja', state: 'Lagos' },
  { name: 'Royal College of Education, Ogun', city: 'Ogun', state: 'Ogun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'S. Light College of Education', city: 'Kano', state: 'Kano' },
  { name: 'Sam Ale College of Education', city: 'Abuja', state: 'FCT Abuja' },
  { name: 'Sarkin Yama Community College of Education', city: 'Bauchi', state: 'Bauchi' },
  { name: 'Sharifat Institute of Professional and Islamic Legal Studies', city: 'Kwara', state: 'Kwara' },
  { name: 'Sinai College of Education and Entrepreneurship Studies', city: 'Gboko', state: 'Benue' },
  { name: 'St. Augustine College of Education', city: 'Akoka', state: 'Lagos' },
  { name: 'St. Frances Assisi College of Education', city: 'Zaria', state: 'Kaduna' },
  { name: 'St. Paul\'s College of Education', city: 'Nnewi', state: 'Anambra' },
  { name: 'Steady Flow College of Education', city: 'Ikom', state: 'Cross River' },
  { name: 'Talent Finders College of Education', city: 'Ilala', state: 'Kwara' },
  { name: 'Tamic College of Education', city: 'Lagos', state: 'Lagos' },
  { name: 'TCNN College of Education', city: 'Bukuru', state: 'Plateau' },
  { name: 'The College of Education, Iseyin', city: 'Iseyin', state: 'Oyo' },
  { name: 'The College of Education, Nsukka', city: 'Nsukka', state: 'Enugu' },
  { name: 'The Heritage College of Education', city: 'Not specified', state: 'Unspecified', verificationStatus: 'pending_verification', operationalStatusNote: 'Listed in NCCE Private Colleges register without specific state/campus address; location verification pending.' },
  { name: 'Top Sprout College of Education', city: 'Ilorin', state: 'Kwara' },
  { name: 'Top-Most College of Education', city: 'Ipaja-Agbado', state: 'Lagos' },
  { name: 'Turath College of Education', city: 'Kano', state: 'Kano' },
  { name: 'Uli College of Education', city: 'Uli', state: 'Anambra' },
  { name: 'Umar Bun Khatab College of Education', city: 'Tudun Nupawa', state: 'Kaduna' },
  { name: 'Unity College of Education', city: 'Aukpa Adoka', state: 'Benue' },
  { name: 'Upland College of Education, Science and Technology', city: 'Ondo', state: 'Ondo', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Victory Belt College of Education', city: 'Iyale', state: 'Kogi' },
  { name: 'Waterside College of Education', city: 'Ogun', state: 'Ogun', verificationStatus: 'pending_verification', operationalStatusNote: 'State-level NCCE entry; exact town/address requires verification.' },
  { name: 'Yewa Central College of Education', city: 'Ayetoro', state: 'Ogun' },
];

// Part 5D: Other NCE-Awarding Institutions (NCCE NTI & Other NCE category)
// Note: NINLAN Aba and NASE/NACOE Ilorin are linked in FEDERAL_COE_BATCH above without duplication.
const OTHER_NCE_INSTITUTIONS_BATCH: SeedTuple[] = [
  {
    name: 'Ameer Shehu Idris College of Advanced Studies',
    city: 'Zaria',
    state: 'Kaduna',
    ownership: 'State',
    category: 'college_of_education',
    level: 'college_of_education',
    operationalStatusNote: 'Listed under NCCE NTI and Other NCE-Awarding Institutions.',
  },
  {
    name: 'Aminu Kano College of Islamic and Legal Studies',
    city: 'Kano',
    state: 'Kano',
    acronym: 'AKCILS',
    ownership: 'State',
    category: 'college_of_education',
    level: 'college_of_education',
    operationalStatusNote: 'Listed under NCCE NTI and Other NCE-Awarding Institutions.',
  },
  {
    name: 'Bauchi Institute for Arabic and Islamic Studies',
    city: 'Bauchi',
    state: 'Bauchi',
    ownership: 'Private',
    category: 'college_of_education',
    level: 'college_of_education',
    verificationStatus: 'pending_verification',
    operationalStatusNote: 'Listed under NCCE NTI and Other NCE-Awarding Institutions; ownership classification requires confirmation.',
  },
  {
    name: 'Institute of Ecumenical Education (Thinkers Corner)',
    city: 'Enugu',
    state: 'Enugu',
    ownership: 'Missionary',
    category: 'college_of_education',
    level: 'college_of_education',
    operationalStatusNote: 'Listed under NCCE NTI and Other NCE-Awarding Institutions.',
  },
  {
    name: 'Muhammad Goni College of Legal, Islamic and Educational Studies',
    city: 'Maiduguri',
    state: 'Borno',
    acronym: 'MOGOLIS',
    ownership: 'State',
    category: 'college_of_education',
    level: 'college_of_education',
    operationalStatusNote: 'Listed under NCCE NTI and Other NCE-Awarding Institutions.',
  },
  {
    name: 'National Teachers Institute (NTI)',
    city: 'Kaduna',
    state: 'Kaduna',
    acronym: 'NTI',
    ownership: 'Federal',
    category: 'specialised_institution',
    level: 'specialised_institution',
    operationalStatusNote: 'Federal distance-learning teacher training institute listed under NCCE NTI and Other NCE-Awarding Institutions.',
  },
  {
    name: 'Zaria Institute of Information Technology',
    city: 'Zaria',
    state: 'Kaduna',
    ownership: 'Private',
    category: 'specialised_institution',
    level: 'specialised_institution',
    operationalStatusNote: 'Listed under NCCE NTI and Other NCE-Awarding Institutions.',
  },
];

// ============================================================================
// BATCH 6 — CONSOLIDATED FEDERAL SECONDARY SCHOOLS IN NIGERIA
// Note: King's College, Lagos (inst-kingscollege) is preserved in initialData.ts
// ============================================================================
const FEDERAL_UNITY_COLLEGES_BATCH: SeedTuple[] = [
  // South East
  { name: 'Federal Government Girls\' College, Umuahia', city: 'Umuahia', state: 'Abia', acronym: 'FGGC Umuahia', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Ohafia', city: 'Ohafia', state: 'Abia', acronym: 'FGC Ohafia', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government College, Nise', city: 'Nise', state: 'Anambra', acronym: 'FGC Nise', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Onitsha', city: 'Onitsha', state: 'Anambra', acronym: 'FGGC Onitsha', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Enugu', city: 'Enugu', state: 'Enugu', acronym: 'FGC Enugu', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Lejja', city: 'Lejja', state: 'Enugu', acronym: 'FGGC Lejja', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Okigwe', city: 'Okigwe', state: 'Imo', acronym: 'FGC Okigwe', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Owerri', city: 'Owerri', state: 'Imo', acronym: 'FGGC Owerri', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Okposi', city: 'Okposi', state: 'Ebonyi', acronym: 'FGC Okposi', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Ezzamgbo', city: 'Ezzamgbo', state: 'Ebonyi', acronym: 'FGGC Ezzamgbo', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  // South South
  { name: 'Federal Government College, Ikot Ekpene', city: 'Ikot Ekpene', state: 'Akwa Ibom', acronym: 'FGC Ikot Ekpene', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Ikot Obio-Itong', city: 'Ikot Obio-Itong', state: 'Akwa Ibom', acronym: 'FGGC Ikot Obio-Itong', formerNames: ['Federal Government Girls\' College, Ikot Obio Itong'], descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Ikom', city: 'Ikom', state: 'Cross River', acronym: 'FGC Ikom', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Calabar', city: 'Calabar', state: 'Cross River', acronym: 'FGGC Calabar', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Warri', city: 'Warri', state: 'Delta', acronym: 'FGC Warri', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Ibusa', city: 'Ibusa', state: 'Delta', acronym: 'FGGC Ibusa', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Ibillo', city: 'Ibillo', state: 'Edo', acronym: 'FGC Ibillo', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Benin', city: 'Benin City', state: 'Edo', acronym: 'FGGC Benin', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Port Harcourt', city: 'Port Harcourt', state: 'Rivers', acronym: 'FGC Port Harcourt', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Abuloma', city: 'Abuloma', state: 'Rivers', acronym: 'FGGC Abuloma', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Odi', city: 'Odi', state: 'Bayelsa', acronym: 'FGC Odi', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Imiringi', city: 'Imiringi', state: 'Bayelsa', acronym: 'FGGC Imiringi', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  // South West (King's College Lagos is inst-kingscollege in initialData.ts)
  { name: 'Federal Government College, Lagos', city: 'Ijanikin, Lagos', state: 'Lagos', acronym: 'FGC Lagos', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Queen\'s College, Lagos', city: 'Yaba, Lagos', state: 'Lagos', acronym: 'QC Lagos', descriptionExtra: 'School Type: Federal Government Girls\' College / Queen\'s College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Odogbolu', city: 'Odogbolu', state: 'Ogun', acronym: 'FGC Odogbolu', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Sagamu', city: 'Sagamu', state: 'Ogun', acronym: 'FGGC Sagamu', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Idoani', city: 'Idoani', state: 'Ondo', acronym: 'FGC Idoani', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Akure', city: 'Akure', state: 'Ondo', acronym: 'FGGC Akure', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Ikirun', city: 'Ikirun', state: 'Osun', acronym: 'FGC Ikirun', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Ipetumodu', city: 'Ipetumodu', state: 'Osun', acronym: 'FGGC Ipetumodu', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Ogbomoso', city: 'Ogbomoso', state: 'Oyo', acronym: 'FGC Ogbomoso', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Oyo', city: 'Oyo', state: 'Oyo', acronym: 'FGGC Oyo', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Ikole-Ekiti', city: 'Ikole-Ekiti', state: 'Ekiti', acronym: 'FGC Ikole-Ekiti', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Efon-Alaye', city: 'Efon-Alaye', state: 'Ekiti', acronym: 'FGGC Efon-Alaye', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  // North East
  { name: 'Federal Government College, Ganye', city: 'Ganye', state: 'Adamawa', acronym: 'FGC Ganye', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Yola', city: 'Yola', state: 'Adamawa', acronym: 'FGGC Yola', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Azare', city: 'Azare', state: 'Bauchi', acronym: 'FGC Azare', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Bauchi', city: 'Bauchi', state: 'Bauchi', acronym: 'FGGC Bauchi', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Maiduguri', city: 'Maiduguri', state: 'Borno', acronym: 'FGC Maiduguri', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Monguno', city: 'Monguno', state: 'Borno', acronym: 'FGGC Monguno', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Wukari', city: 'Wukari', state: 'Taraba', acronym: 'FGC Wukari', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Jalingo', city: 'Jalingo', state: 'Taraba', acronym: 'FGGC Jalingo', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Buni-Yadi', city: 'Buni-Yadi', state: 'Yobe', acronym: 'FGC Buni-Yadi', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Potiskum', city: 'Potiskum', state: 'Yobe', acronym: 'FGGC Potiskum', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Billiri', city: 'Billiri', state: 'Gombe', acronym: 'FGC Billiri', formerNames: ['Federal Government College, Biliri'], descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Bajoga', city: 'Bajoga', state: 'Gombe', acronym: 'FGGC Bajoga', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  // North Central
  { name: 'Federal Government College, Vandeikya', city: 'Vandeikya', state: 'Benue', acronym: 'FGC Vandeikya', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Gboko', city: 'Gboko', state: 'Benue', acronym: 'FGGC Gboko', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Otobi', city: 'Otobi', state: 'Benue', acronym: 'FGC Otobi', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government College, Ugwolawo', city: 'Ugwolawo', state: 'Kogi', acronym: 'FGC Ugwolawo', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Kabba', city: 'Kabba', state: 'Kogi', acronym: 'FGGC Kabba', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Ilorin', city: 'Ilorin', state: 'Kwara', acronym: 'FGC Ilorin', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Omu-Aran', city: 'Omu-Aran', state: 'Kwara', acronym: 'FGGC Omu-Aran', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Minna', city: 'Minna', state: 'Niger', acronym: 'FGC Minna', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Bida', city: 'Bida', state: 'Niger', acronym: 'FGGC Bida', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, New-Bussa', city: 'New-Bussa', state: 'Niger', acronym: 'FGC New-Bussa', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government College, Jos', city: 'Jos', state: 'Plateau', acronym: 'FGC Jos', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Langtang', city: 'Langtang', state: 'Plateau', acronym: 'FGGC Langtang', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Kwali', city: 'Kwali', state: 'FCT Abuja', acronym: 'FGC Kwali', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Bwari', city: 'Bwari', state: 'FCT Abuja', acronym: 'FGGC Bwari', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government Girls\' College, Abaji', city: 'Abaji', state: 'FCT Abuja', acronym: 'FGGC Abaji', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government Boys\' College, Garki', city: 'Garki, Abuja', state: 'FCT Abuja', acronym: 'FGBC Garki', descriptionExtra: 'School Type: Federal Government Boys\' College · Gender Policy: Boys only.' },
  { name: 'Federal Government College, Rubochi', city: 'Rubochi', state: 'FCT Abuja', acronym: 'FGC Rubochi', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government College, Keffi', city: 'Keffi', state: 'Nasarawa', acronym: 'FGC Keffi', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Keana', city: 'Keana', state: 'Nasarawa', acronym: 'FGGC Keana', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  // North West
  { name: 'Federal Government College, Kiyawa', city: 'Kiyawa', state: 'Jigawa', acronym: 'FGC Kiyawa', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Kazaure', city: 'Kazaure', state: 'Jigawa', acronym: 'FGGC Kazaure', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Kaduna', city: 'Kaduna', state: 'Kaduna', acronym: 'FGC Kaduna', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Zaria', city: 'Zaria', state: 'Kaduna', acronym: 'FGGC Zaria', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Kano', city: 'Kano', state: 'Kano', acronym: 'FGC Kano', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Minjibir', city: 'Minjibir', state: 'Kano', acronym: 'FGGC Minjibir', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Daura', city: 'Daura', state: 'Katsina', acronym: 'FGC Daura', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Bakori', city: 'Bakori', state: 'Katsina', acronym: 'FGGC Bakori', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Birnin-Yauri', city: 'Birnin-Yauri', state: 'Kebbi', acronym: 'FGC Birnin-Yauri', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Gwandu', city: 'Gwandu', state: 'Kebbi', acronym: 'FGGC Gwandu', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Sokoto', city: 'Sokoto', state: 'Sokoto', acronym: 'FGC Sokoto', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Government Girls\' College, Tambuwal', city: 'Tambuwal', state: 'Sokoto', acronym: 'FGGC Tambuwal', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government Girls\' College, Gusau', city: 'Gusau', state: 'Zamfara', acronym: 'FGGC Gusau', descriptionExtra: 'School Type: Federal Government Girls\' College · Gender Policy: Girls only.' },
  { name: 'Federal Government College, Anka', city: 'Anka', state: 'Zamfara', acronym: 'FGC Anka', descriptionExtra: 'School Type: Federal Government College · Gender Policy: Boys and girls (Co-educational).' },
];

// B. Federal Science and Technical Colleges (NABTEB Official Register #81–101)
const FEDERAL_STC_NABTEB_BATCH: SeedTuple[] = [
  { name: 'Federal Science and Technical College, Ohanso', city: 'Ohanso', state: 'Abia', acronym: 'FSTC Ohanso', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational). Listed in NABTEB register and Federal Ministry Unity Spotlight.' },
  { name: 'Federal Science and Technical College, Orozo', city: 'Orozo', state: 'FCT Abuja', acronym: 'FSTC Orozo', descriptionExtra: 'School Type: Federal Science and Technical College. Listed in NABTEB register.' },
  { name: 'Federal Science and Technical College, Michika', city: 'Michika', state: 'Adamawa', acronym: 'FSTC Michika', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational). Listed in NABTEB register and Unity College listings.' },
  {
    name: 'Federal Science and Technical College, Ofot, Uyo',
    city: 'Ofot, Uyo',
    state: 'Akwa Ibom',
    acronym: 'FSTC Uyo',
    formerNames: ['Federal Science and Technical College, Uyo'],
    descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Girls (as specified in Federal Ministry directory). Listed in NABTEB register.',
  },
  { name: 'Federal Science and Technical College, Awka', city: 'Awka', state: 'Anambra', acronym: 'FSTC Awka', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Science and Technical College, Tungbo', city: 'Tungbo', state: 'Bayelsa', acronym: 'FSTC Tungbo', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Science and Technical College, Otukpo', city: 'Otukpo', state: 'Benue', acronym: 'FSTC Otukpo', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Science and Technical College, Lassa', city: 'Lassa', state: 'Borno', acronym: 'FSTC Lassa', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Science and Technical College, Uromi', city: 'Uromi', state: 'Edo', acronym: 'FSTC Uromi', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Science and Technical College, Usi-Ekiti', city: 'Usi-Ekiti', state: 'Ekiti', acronym: 'FSTC Usi-Ekiti', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Kafanchan', city: 'Kafanchan', state: 'Kaduna', acronym: 'FSTC Kafanchan', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Katsina', city: 'Katsina', state: 'Katsina', acronym: 'FSTC Katsina', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Zuru', city: 'Zuru', state: 'Kebbi', acronym: 'FSTC Zuru', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Yaba', city: 'Yaba, Lagos', state: 'Lagos', acronym: 'FSTC Yaba', descriptionExtra: 'School Type: Federal Science and Technical College. Listed in NABTEB register and Unity College listings.' },
  { name: 'Federal Science and Technical College, Doma', city: 'Doma', state: 'Nasarawa', acronym: 'FSTC Doma', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  {
    name: 'Federal Science and Technical College, Shiroro',
    city: 'Kuta-Shiroro',
    state: 'Niger',
    acronym: 'FSTC Shiroro',
    formerNames: ['Federal Science and Technical College, Kuta-Shiroro'],
    descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Ijebu Mushin', city: 'Ijebu Mushin', state: 'Ogun', acronym: 'FSTC Ijebu Mushin', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Ikare-Akoko', city: 'Ikare-Akoko', state: 'Ondo', acronym: 'FSTC Ikare-Akoko', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Ilesha', city: 'Ilesha', state: 'Osun', acronym: 'FSTC Ilesha', descriptionExtra: 'School Type: Federal Science and Technical College.' },
  { name: 'Federal Science and Technical College, Ahoada', city: 'Ahoada', state: 'Rivers', acronym: 'FSTC Ahoada', descriptionExtra: 'School Type: Federal Science and Technical College · Gender Policy: Boys and girls (Co-educational).' },
  { name: 'Federal Science and Technical College, Jalingo', city: 'Jalingo', state: 'Taraba', acronym: 'FSTC Jalingo', descriptionExtra: 'School Type: Federal Science and Technical College.' },
];

// C. Other Federal Specialist Secondary Institutions (#102–106)
const OTHER_FEDERAL_SECONDARY_BATCH: SeedTuple[] = [
  {
    name: 'Federal Government Academy, Suleja',
    city: 'Suleja',
    state: 'Niger',
    acronym: 'FGA Suleja',
    descriptionExtra: 'School Type: Federal Government Academy · Gender Policy: Boys and girls (Co-educational). National centre for gifted and talented secondary students.',
  },
  {
    name: 'Federal Science College, Ogoja',
    city: 'Ogoja',
    state: 'Cross River',
    acronym: 'FSC Ogoja',
    descriptionExtra: 'School Type: Federal Science College · Gender Policy: Boys and girls (Co-educational). Specialist federal science college distinct from FSTCs.',
  },
  {
    name: 'Federal Government Boys\' College, Apo',
    city: 'Apo, Abuja',
    state: 'FCT Abuja',
    acronym: 'FGBC Apo',
    verificationStatus: 'pending_verification',
    operationalStatusNote: 'Listed in additional federal secondary listings; administrative distinction relative to FGBC Garki requires confirmation.',
    descriptionExtra: 'School Type: Federal Government Boys\' College · Gender Policy: Boys only.',
  },
  {
    name: 'Federal Government College, Ijanikin',
    city: 'Ijanikin, Lagos',
    state: 'Lagos',
    acronym: 'FGC Ijanikin',
    verificationStatus: 'pending_verification',
    operationalStatusNote: 'Listed separately in additional federal secondary listings; verify whether this represents the same campus as Federal Government College, Lagos (Ijanikin).',
    descriptionExtra: 'School Type: Federal Government College.',
  },
  {
    name: 'Federal Science College, Sokoto',
    city: 'Sokoto',
    state: 'Sokoto',
    acronym: 'FSC Sokoto',
    verificationStatus: 'pending_verification',
    operationalStatusNote: 'Listed in additional federal specialist secondary listings; current administrative classification requires verification.',
    descriptionExtra: 'School Type: Federal Science College.',
  },
];

// D. Older, Additional & Historical Federal Technical School Verification Records
// Note: FSTC Ohanso, FSTC Uyo (Ofot), and FSTC Kuta-Shiroro are linked on the active NABTEB entries above.
const FSTC_VERIFICATION_NOTE =
  'Preserved verification record from earlier federal / 2025 NECO NCEE registers not appearing in the 2026 NECO admissions guide or current NABTEB FSTC list; absence from an admissions guide does not establish institutional closure.';

const FSTC_VERIFICATION_BATCH: SeedTuple[] = [
  { name: 'Federal Science and Technical College, Misau', city: 'Misau', state: 'Bauchi', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Amuzu', city: 'Amuzu', state: 'Ebonyi', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Oguta', city: 'Oguta', state: 'Imo', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Otobi', city: 'Otobi', state: 'Benue', verificationStatus: 'pending_verification', operationalStatusNote: `${FSTC_VERIFICATION_NOTE} Verify relationship to Federal Government College, Otobi.` },
  { name: 'Federal Science and Technical College, Gashua', city: 'Gashua', state: 'Yobe', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Ganduje', city: 'Ganduje', state: 'Kano', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Dayi', city: 'Dayi', state: 'Katsina', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Wurno', city: 'Wurno', state: 'Sokoto', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Mallam Madori-Birniwa', city: 'Mallam Madori-Birniwa', state: 'Jigawa', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Ogugu', city: 'Ogugu', state: 'Kogi', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Gwarana', city: 'Gwarana', state: 'Kwara', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Igangan', city: 'Igangan', state: 'Oyo', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Science and Technical College, Garki', city: 'Garki, Abuja', state: 'FCT Abuja', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
  { name: 'Federal Technical College, Zambuk', city: 'Zambuk', state: 'Gombe', verificationStatus: 'pending_verification', operationalStatusNote: FSTC_VERIFICATION_NOTE },
];

export const BATCH_INSTITUTIONS: Institution[] = [
  ...FEDERAL_UNIVERSITIES_PART_1B.map((item) =>
    buildRecord('fed-uni', item, {
      category: 'university',
      level: 'federal_university',
      ownership: 'Federal',
      accreditationBody: 'National Universities Commission (NUC)',
      sourceName: 'NUC June 2025 Bulletin & Federal Universities Directory',
      sourceUrl: 'https://www.nuc.edu.ng/nigerian-univerisities/federal-univeristies/',
      descriptionPrefix: 'federal university',
    })
  ),
  ...STATE_UNIVERSITIES_BATCH.map((item) =>
    buildRecord('sta-uni', item, {
      category: 'university',
      level: 'state_university',
      ownership: 'State',
      accreditationBody: 'National Universities Commission (NUC)',
      sourceName: 'NUC State Universities Official Directory',
      sourceUrl: 'https://enuc.nuc.edu.ng/nus',
      descriptionPrefix: 'state-owned university',
    })
  ),
  ...PRIVATE_UNIVERSITIES_BATCH.map((item) =>
    buildRecord('prv-uni', item, {
      category: 'university',
      level: 'private_university',
      ownership: 'Private',
      accreditationBody: 'National Universities Commission (NUC)',
      sourceName: 'NUC Private Universities & Nigerian University System Portal',
      sourceUrl: 'https://www.nuc.edu.ng/nigerian-univerisities/private-univeristies/',
      descriptionPrefix: 'NUC-listed private university',
    })
  ),
  ...FEDERAL_POLYTECHNICS_BATCH.map((item) =>
    buildRecord('fed-poly', item, {
      category: 'polytechnic',
      level: 'polytechnic',
      ownership: 'Federal',
      accreditationBody: 'National Board for Technical Education (NBTE)',
      sourceName: 'NBTE Public Institutions Register',
      sourceUrl: 'https://www.digitalnbte.nbte.gov.ng/Public/Institutions?type=polytechnic',
      descriptionPrefix: 'federal polytechnic',
    })
  ),
  ...STATE_POLYTECHNICS_BATCH.map((item) =>
    buildRecord('sta-poly', item, {
      category: 'polytechnic',
      level: 'polytechnic',
      ownership: 'State',
      accreditationBody: 'National Board for Technical Education (NBTE)',
      sourceName: 'NBTE Public Institutions Register',
      sourceUrl: 'https://www.digitalnbte.nbte.gov.ng/Public/Institutions?type=polytechnic',
      descriptionPrefix: 'state polytechnic',
    })
  ),
  ...PRIVATE_POLYTECHNICS_BATCH.map((item) =>
    buildRecord('prv-poly', item, {
      category: 'polytechnic',
      level: 'polytechnic',
      ownership: 'Private',
      accreditationBody: 'National Board for Technical Education (NBTE)',
      sourceName: 'NBTE Public Institutions Register',
      sourceUrl: 'https://www.digitalnbte.nbte.gov.ng/Public/Institutions?type=polytechnic',
      descriptionPrefix: 'private polytechnic',
    })
  ),
  ...HISTORICAL_POLYTECHNICS_BATCH.map((item) =>
    buildRecord('hist-poly', item, {
      category: 'polytechnic',
      level: 'polytechnic',
      ownership: 'State',
      accreditationBody: 'National Board for Technical Education (NBTE)',
      sourceName: 'NBTE Historical & Converted Institutions Archive',
      sourceUrl: 'https://www.nbte.gov.ng/nbte/directory',
      descriptionPrefix: 'historical / converted polytechnic',
    })
  ),
  ...FEDERAL_COE_BATCH.map((item) =>
    buildRecord('fed-coe', item, {
      category: 'college_of_education',
      level: 'college_of_education',
      ownership: 'Federal',
      accreditationBody: 'National Commission for Colleges of Education (NCCE)',
      sourceName: 'NCCE Accredited Colleges & JAMB NCE Directory',
      sourceUrl: 'https://www.ncce.gov.ng/AccreditedColleges',
      descriptionPrefix: 'federal college of education',
    })
  ),
  ...STATE_COE_BATCH.map((item) =>
    buildRecord('sta-coe', item, {
      category: 'college_of_education',
      level: 'college_of_education',
      ownership: 'State',
      accreditationBody: 'National Commission for Colleges of Education (NCCE)',
      sourceName: 'NCCE Accredited Colleges Register',
      sourceUrl: 'https://www.ncce.gov.ng/AccreditedColleges/Index',
      descriptionPrefix: 'state college of education',
    })
  ),
  ...PRIVATE_COE_BATCH.map((item) =>
    buildRecord('prv-coe', item, {
      category: 'college_of_education',
      level: 'college_of_education',
      ownership: 'Private',
      accreditationBody: 'National Commission for Colleges of Education (NCCE)',
      sourceName: 'NCCE Accredited Colleges Register',
      sourceUrl: 'https://www.ncce.gov.ng/AccreditedColleges/Index',
      descriptionPrefix: 'private college of education',
    })
  ),
  ...OTHER_NCE_INSTITUTIONS_BATCH.map((item) =>
    buildRecord('oth-nce', item, {
      category: 'college_of_education',
      level: 'college_of_education',
      ownership: 'State',
      accreditationBody: 'National Commission for Colleges of Education (NCCE)',
      sourceName: 'NCCE NTI & Other NCE-Awarding Institutions Directory',
      sourceUrl: 'https://www.ncce.gov.ng/AccreditedColleges',
      descriptionPrefix: 'NCE-awarding institution',
    })
  ),
  ...FEDERAL_UNITY_COLLEGES_BATCH.map((item) =>
    buildRecord('fed-sec', item, {
      category: 'secondary_school',
      level: 'secondary',
      ownership: 'Federal',
      accreditationBody: 'Federal Ministry of Education / WAEC / NECO',
      sourceName: 'NECO 2026 NCEE Federal Unity Colleges Admissions Guide',
      sourceUrl: 'https://neco.gov.ng',
      descriptionPrefix: 'Federal Unity College / federal secondary school',
    })
  ),
  ...FEDERAL_STC_NABTEB_BATCH.map((item) =>
    buildRecord('fed-fstc', item, {
      category: 'technical_vocational',
      level: 'vocational',
      ownership: 'Federal',
      accreditationBody: 'NABTEB / Federal Ministry of Education',
      sourceName: 'NABTEB Federal Science & Technical Colleges Register',
      sourceUrl: 'https://nabteb.gov.ng',
      descriptionPrefix: 'Federal Science and Technical College',
    })
  ),
  ...OTHER_FEDERAL_SECONDARY_BATCH.map((item) =>
    buildRecord('fed-spec-sec', item, {
      category: 'secondary_school',
      level: 'secondary',
      ownership: 'Federal',
      accreditationBody: 'Federal Ministry of Education / WAEC / NECO',
      sourceName: 'Federal Ministry of Education Unity Spotlight & Federal Listings',
      sourceUrl: 'https://education.gov.ng',
      descriptionPrefix: 'specialist federal secondary institution',
    })
  ),
  ...FSTC_VERIFICATION_BATCH.map((item) =>
    buildRecord('hist-fstc', item, {
      category: 'technical_vocational',
      level: 'vocational',
      ownership: 'Federal',
      accreditationBody: 'NABTEB / Federal Ministry of Education',
      sourceName: '2025 NECO NCEE & Earlier Federal School Registers',
      sourceUrl: 'https://neco.gov.ng',
      descriptionPrefix: 'federal technical/science verification record',
    })
  ),
];
