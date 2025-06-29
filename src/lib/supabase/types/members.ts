
import { Database } from './database.types';

// =============================================================================
// TIPOS DO SISTEMA DE MEMBROS
// =============================================================================

export type Tool = Database['public']['Tables'] extends { tools: any }
  ? Database['public']['Tables']['tools']['Row']
  : {
      id: string;
      name: string;
      description: string;
      link: string;
      image_url?: string;
      category: string;
      is_premium: boolean;
      created_at: string;
      updated_at: string;
    };

export type Event = Database['public']['Tables'] extends { events: any }
  ? Database['public']['Tables']['events']['Row']
  : {
      id: string;
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      location_link?: string;
      physical_location?: string;
      cover_image_url?: string;
      is_recurring: boolean;
      recurrence_pattern?: string;
      created_by: string;
      created_at: string;
    };

export type Benefit = Tool;
