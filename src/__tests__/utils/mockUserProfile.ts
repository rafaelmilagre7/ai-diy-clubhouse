
import { UserProfile } from '@/lib/supabase';

export const createMockUserProfile = (overrides: Partial<UserProfile> = {}): UserProfile => {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role_id: 'test-role-id',
    user_roles: {
      id: 'test-role-id', 
      name: 'member'
    },
    avatar_url: null,
    company_name: 'Test Company',
    industry: 'Technology',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    phone: null,
    instagram: null,
    linkedin: null,
    state: null,
    city: null,
    company_website: null,
    company_size: null,
    annual_revenue: null,
    ai_knowledge_level: null,
    nps_score: null,
    weekly_availability: null,
    networking_interests: null,
    phone_country_code: null,
    role: null,
    onboarding_completed: true,
    onboarding_completed_at: '2024-01-01T00:00:00Z',
    referrals_count: 0,
    successful_referrals_count: 0,
    business_challenges: null,
    ...overrides,
  };
};
