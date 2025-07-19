
import { Database } from './database.types';

// =============================================================================
// TIPOS ADMINISTRATIVOS
// =============================================================================

export type UserRole = Database['public']['Tables'] extends { user_roles: any } 
  ? Database['public']['Tables']['user_roles']['Row']
  : {
      id: string;
      name: string;
      description?: string;
      permissions?: any;
      is_system?: boolean;
      created_at: string;
      updated_at: string;
    };

export type Profile = Database['public']['Tables'] extends { profiles: any } 
  ? Database['public']['Tables']['profiles']['Row']
  : {
      id: string;
      email: string;
      name: string | null;
      avatar_url: string | null;
      company_name: string | null;
      industry: string | null;
      role_id: string | null;
      role: string | null;
      created_at: string;
      updated_at: string;
    };

export type Invite = Database['public']['Tables'] extends { invites: any } 
  ? Database['public']['Tables']['invites']['Row'] 
  : {
      id: string;
      email: string;
      token: string;
      role_id: string;
      created_by: string;
      expires_at: string;
      used_at: string | null;
      notes: string | null;
      created_at: string;
    };

export type Analytics = Database['public']['Tables'] extends { analytics: any }
  ? Database['public']['Tables']['analytics']['Row']
  : {
      id: string;
      user_id: string;
      event_type: string;
      solution_id?: string;
      module_id?: string;
      event_data?: any;
      created_at: string;
    };
