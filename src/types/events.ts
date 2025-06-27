
export type Event = {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  location_link?: string | null;
  physical_location?: string | null;
  cover_image_url?: string | null;
  is_recurring?: boolean | null;
  recurrence_pattern?: string | null;
  recurrence_interval?: number | null;
  recurrence_day?: number | null;
  recurrence_count?: number | null;
  recurrence_end_date?: string | null;
  parent_event_id?: string | null;
  created_by: string;
  created_at: string;
};

export type EventFormData = {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location_link?: string;
  physical_location?: string;
  cover_image_url?: string;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
  recurrence_day?: number;
  recurrence_count?: number;
  recurrence_end_date?: string;
};
