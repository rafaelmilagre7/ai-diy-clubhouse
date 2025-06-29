
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
  // Campos para eventos recorrentes
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
  recurrence_day?: number;
  recurrence_count?: number;
  recurrence_end_date?: string;
  parent_event_id?: string;
}
