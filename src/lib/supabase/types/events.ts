
import { Database } from './database.types';

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export type EventAccessControl = Database['public']['Tables']['event_access_control']['Row'];
export type EventAccessControlInsert = Database['public']['Tables']['event_access_control']['Insert'];
export type EventAccessControlUpdate = Database['public']['Tables']['event_access_control']['Update'];
