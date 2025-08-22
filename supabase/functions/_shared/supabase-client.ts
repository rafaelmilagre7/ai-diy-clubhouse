import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

// Singleton para reutilização de conexões Supabase nas Edge Functions
class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private serviceClient: SupabaseClient | null = null;
  private anonClient: SupabaseClient | null = null;

  private constructor() {}

  static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  getServiceClient(): SupabaseClient {
    if (!this.serviceClient) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      this.serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'Connection': 'keep-alive'
          }
        }
      });
    }
    return this.serviceClient;
  }

  getAnonClient(): SupabaseClient {
    if (!this.anonClient) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      this.anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'Connection': 'keep-alive'
          }
        }
      });
    }
    return this.anonClient;
  }

  // Cleanup method para liberar conexões
  cleanup(): void {
    this.serviceClient = null;
    this.anonClient = null;
  }
}

export const getSupabaseServiceClient = () => SupabaseClientManager.getInstance().getServiceClient();
export const getSupabaseAnonClient = () => SupabaseClientManager.getInstance().getAnonClient();
export const cleanupConnections = () => SupabaseClientManager.getInstance().cleanup();