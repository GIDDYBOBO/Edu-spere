export interface StateInfo {
  name: string;
  code: string;
  capital: string;
  zone: 'South West' | 'South South' | 'South East' | 'North Central' | 'North West' | 'North East';
  majorLgas: string[];
}

export const NIGERIAN_STATES: StateInfo[] = [
  { name: 'Abia', code: 'AB', capital: 'Umuahia', zone: 'South East', majorLgas: ['Aba North', 'Aba South', 'Umuahia North', 'Ohafia'] },
  { name: 'Adamawa', code: 'AD', capital: 'Yola', zone: 'North East', majorLgas: ['Yola North', 'Yola South', 'Mubi North', 'Numan'] },
  { name: 'Akwa Ibom', code: 'AK', capital: 'Uyo', zone: 'South South', majorLgas: ['Uyo', 'Eket', 'Ikot Ekpene', 'Oron'] },
  { name: 'Anambra', code: 'AN', capital: 'Awka', zone: 'South East', majorLgas: ['Awka South', 'Onitsha North', 'Nnewi North', 'Aguata'] },
  { name: 'Bauchi', code: 'BA', capital: 'Bauchi', zone: 'North East', majorLgas: ['Bauchi', 'Katagum', 'Misau', 'Ningi'] },
  { name: 'Bayelsa', code: 'BY', capital: 'Yenagoa', zone: 'South South', majorLgas: ['Yenagoa', 'Sagbama', 'Ogbia', 'Brass'] },
  { name: 'Benue', code: 'BN', capital: 'Makurdi', zone: 'North Central', majorLgas: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala'] },
  { name: 'Borno', code: 'BO', capital: 'Maiduguri', zone: 'North East', majorLgas: ['Maiduguri', 'Jere', 'Biu', 'Bama'] },
  { name: 'Cross River', code: 'CR', capital: 'Calabar', zone: 'South South', majorLgas: ['Calabar Municipal', 'Calabar South', 'Ikom', 'Ogoja'] },
  { name: 'Delta', code: 'DE', capital: 'Asaba', zone: 'South South', majorLgas: ['Oshimili South (Asaba)', 'Warri South', 'Ughelli North', 'Sapele'] },
  { name: 'Ebonyi', code: 'EB', capital: 'Abakaliki', zone: 'South East', majorLgas: ['Abakaliki', 'Afikpo North', 'Ebonyi', 'Ezza North'] },
  { name: 'Edo', code: 'ED', capital: 'Benin City', zone: 'South South', majorLgas: ['Oredo (Benin City)', 'Ikpoba-Okha', 'Esan West (Ekpoma)', 'Etsako West'] },
  { name: 'Ekiti', code: 'EK', capital: 'Ado-Ekiti', zone: 'South West', majorLgas: ['Ado-Ekiti', 'Ikole', 'Ijero', 'Oye'] },
  { name: 'Enugu', code: 'EN', capital: 'Enugu', zone: 'South East', majorLgas: ['Enugu North', 'Enugu South', 'Nsukka', 'Udi'] },
  { name: 'FCT Abuja', code: 'FC', capital: 'Abuja', zone: 'North Central', majorLgas: ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje'] },
  { name: 'Gombe', code: 'GO', capital: 'Gombe', zone: 'North East', majorLgas: ['Gombe', 'Akko', 'Yamaltu/Deba', 'Kaltungo'] },
  { name: 'Imo', code: 'IM', capital: 'Owerri', zone: 'South East', majorLgas: ['Owerri Municipal', 'Owerri North', 'Orlu', 'Okigwe'] },
  { name: 'Jigawa', code: 'JI', capital: 'Dutse', zone: 'North West', majorLgas: ['Dutse', 'Hadejia', 'Birnin Kudu', 'Gumel'] },
  { name: 'Kaduna', code: 'KD', capital: 'Kaduna', zone: 'North West', majorLgas: ['Kaduna North', 'Kaduna South', 'Zaria', 'Jema\'a'] },
  { name: 'Kano', code: 'KN', capital: 'Kano', zone: 'North West', majorLgas: ['Kano Municipal', 'Nassarawa', 'Dala', 'Fagge', 'Gwale'] },
  { name: 'Katsina', code: 'KT', capital: 'Katsina', zone: 'North West', majorLgas: ['Katsina', 'Daura', 'Funtua', 'Malumfashi'] },
  { name: 'Kebbi', code: 'KB', capital: 'Birnin Kebbi', zone: 'North West', majorLgas: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru'] },
  { name: 'Kogi', code: 'KO', capital: 'Lokoja', zone: 'North Central', majorLgas: ['Lokoja', 'Okene', 'Idah', 'Kabba/Bunu'] },
  { name: 'Kwara', code: 'KW', capital: 'Ilorin', zone: 'North Central', majorLgas: ['Ilorin South', 'Ilorin West', 'Offa', 'Edu'] },
  { name: 'Lagos', code: 'LA', capital: 'Ikeja', zone: 'South West', majorLgas: ['Ikeja', 'Lagos Mainland', 'Lagos Island', 'Surulere', 'Eti-Osa', 'Ikorodu'] },
  { name: 'Nasarawa', code: 'NA', capital: 'Lafia', zone: 'North Central', majorLgas: ['Lafia', 'Keffi', 'Akwanga', 'Karu'] },
  { name: 'Niger', code: 'NI', capital: 'Minna', zone: 'North Central', majorLgas: ['Chanchaga (Minna)', 'Bida', 'Suleja', 'Kontagora'] },
  { name: 'Ogun', code: 'OG', capital: 'Abeokuta', zone: 'South West', majorLgas: ['Abeokuta South', 'Ado-Odo/Ota', 'Ijebu Ode', 'Sagamu'] },
  { name: 'Ondo', code: 'ON', capital: 'Akure', zone: 'South West', majorLgas: ['Akure South', 'Ondo West', 'Owo', 'Akoko North-East'] },
  { name: 'Osun', code: 'OS', capital: 'Osogbo', zone: 'South West', majorLgas: ['Osogbo', 'Ife Central', 'Ilesa East', 'Ede North'] },
  { name: 'Oyo', code: 'OY', capital: 'Ibadan', zone: 'South West', majorLgas: ['Ibadan North', 'Ibadan South-West', 'Ogbomosho North', 'Oyo East'] },
  { name: 'Plateau', code: 'PL', capital: 'Jos', zone: 'North Central', majorLgas: ['Jos North', 'Jos South', 'Pankshin', 'Barkin Ladi'] },
  { name: 'Rivers', code: 'RI', capital: 'Port Harcourt', zone: 'South South', majorLgas: ['Port Harcourt', 'Obio/Akpor', 'Eleme', 'Bonny'] },
  { name: 'Sokoto', code: 'SO', capital: 'Sokoto', zone: 'North West', majorLgas: ['Sokoto North', 'Sokoto South', 'Wamakko', 'Tambuwal'] },
  { name: 'Taraba', code: 'TA', capital: 'Jalingo', zone: 'North East', majorLgas: ['Jalingo', 'Wukari', 'Bali', 'Takum'] },
  { name: 'Yobe', code: 'YO', capital: 'Damaturu', zone: 'North East', majorLgas: ['Damaturu', 'Potiskum', 'Gashua', 'Geidam'] },
  { name: 'Zamfara', code: 'ZA', capital: 'Gusau', zone: 'North West', majorLgas: ['Gusau', 'Kaura Namoda', 'Anka', 'Talata Mafara'] },
];

export const EDUCATION_LEVEL_LABELS: Record<string, string> = {
  primary: 'Primary School',
  secondary: 'Secondary School',
  vocational: 'Technical & Vocational',
  polytechnic: 'Polytechnic',
  monotechnic: 'Monotechnic',
  college_of_education: 'College of Education',
  federal_university: 'Federal University',
  state_university: 'State University',
  private_university: 'Private University',
  specialised_institution: 'Specialised Institution',
};

export const INSTITUTION_CATEGORY_LABELS: Record<string, string> = {
  university: 'University',
  polytechnic: 'Polytechnic',
  college_of_education: 'College of Education',
  monotechnic: 'Monotechnic',
  technical_vocational: 'Technical & Vocational Institution',
  secondary_school: 'Secondary School',
  primary_school: 'Primary School',
  specialised_institution: 'Specialised Institution',
};

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_verification: 'Pending Verification',
  verified: 'Verified',
  rejected: 'Rejected',
  unverified: 'Unverified',
  flagged: 'Flagged',
};

export const PUBLICATION_STATUS_LABELS: Record<string, string> = {
  unpublished: 'Unpublished',
  published: 'Published',
  archived: 'Archived',
};
