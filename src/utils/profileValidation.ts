import { PublicProfile } from '@/hooks/networking/usePublicProfile';

export const isProfileComplete = (profile: PublicProfile | null | undefined): boolean => {
  if (!profile) return false;
  
  return !!(
    profile.name &&
    profile.current_position &&
    profile.company_name &&
    profile.professional_bio
  );
};

export const getProfileCompleteness = (profile: PublicProfile | null | undefined): number => {
  if (!profile) return 0;

  const fields = [
    'name',
    'current_position',
    'company_name',
    'professional_bio',
    'industry',
    'skills'
  ];

  const filled = fields.filter(field => {
    const value = profile[field as keyof PublicProfile];
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  }).length;

  return Math.round((filled / fields.length) * 100);
};

export const getMissingFields = (profile: PublicProfile | null | undefined): string[] => {
  if (!profile) return [];

  const fieldLabels: Record<string, string> = {
    name: 'Nome',
    current_position: 'Cargo atual',
    company_name: 'Empresa',
    professional_bio: 'Bio profissional',
    industry: 'Indústria',
    skills: 'Habilidades'
  };

  const missing: string[] = [];

  Object.entries(fieldLabels).forEach(([field, label]) => {
    const value = profile[field as keyof PublicProfile];
    if (Array.isArray(value)) {
      if (value.length === 0) missing.push(label);
    } else if (!value) {
      missing.push(label);
    }
  });

  return missing;
};
