
export interface Event {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string | null;
  is_online: boolean;
  meeting_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  max_participants: number | null;
  cover_image_url: string | null;
}

export interface EventAccessControl {
  id: string;
  event_id: string;
  role_id: string;
  created_at: string;
}
