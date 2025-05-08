
export interface Event {
  id: string;
  title: string;
  description?: string; // Tornando opcional para corresponder ao tipo Supabase
  start_time: string;
  end_time: string;
  location_link?: string;
  physical_location?: string;
  cover_image_url?: string;
  created_at: string;
  created_by: string;
}
