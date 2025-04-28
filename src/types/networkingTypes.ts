
export interface NetworkProfile {
  user_id: string;
  profile_name: string | null;
  profile_avatar: string | null;
  profile_company: string | null;
  professional_info?: {
    current_position?: string;
  };
  personal_info?: {
    email?: string;
    phone?: string;
  };
  experience_personalization?: {
    interests?: string[];
    skills_to_share?: string[];
  };
}

export interface CompatibilityResult {
  score: number;
  reason: string;
  strengths: string[];
  topics: string[];
}

export interface NetworkMatch {
  id: string;
  matched_user_id: string;
  matched_user_name: string;
  matched_user_avatar: string;
  matched_user_company: string;
  matched_user_position: string;
  matched_user_email: string;
  matched_user_phone?: string;
  compatibility_score: number;
  match_reason: string;
  match_strengths: string[];
  suggested_topics: string[];
  status: string;
}

