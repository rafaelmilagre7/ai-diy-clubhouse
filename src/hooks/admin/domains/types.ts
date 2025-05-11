
export interface TrustedDomain {
  id: string;
  domain: string;
  role_id: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string;
  role?: {
    name: string;
  };
}
