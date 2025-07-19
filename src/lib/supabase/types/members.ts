
import { Database } from './database.types';

// =============================================================================
// TIPOS RELACIONADOS A MEMBROS E PERFIS
// =============================================================================

export type UserProfile = Database['public']['Tables'] extends { profiles: any } 
  ? Database['public']['Tables']['profiles']['Row']
  : {
      id: string;
      email: string;
      name: string | null;
      avatar_url?: string | null;
      company_name?: string | null;
      industry?: string | null;
      role_id?: string | null;
      role?: string | null;
      onboarding_completed: boolean | null;
      onboarding_completed_at?: string | null;
      created_at: string;
      updated_at: string;
      user_roles?: {
        id: string;
        name: string;
        description?: string | null;
        permissions?: any;
      } | null;
    };

export type MemberConnection = Database['public']['Tables'] extends { member_connections: any } 
  ? Database['public']['Tables']['member_connections']['Row']
  : {
      id: string;
      requester_id: string;
      recipient_id: string;
      status: string;
      created_at: string;
      updated_at: string;
    };

export type NetworkingPreferences = Database['public']['Tables'] extends { networking_preferences: any }
  ? Database['public']['Tables']['networking_preferences']['Row']
  : {
      id: string;
      user_id: string;
      is_active: boolean;
      min_compatibility: number;
      preferred_industries: string[] | null;
      preferred_company_sizes: string[] | null;
      created_at: string;
      updated_at: string;
    };

