
export interface Event {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location_link?: string;
  physical_location?: string;
  cover_image_url?: string;
  created_at: string;
  created_by: string;
}
