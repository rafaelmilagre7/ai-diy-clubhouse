import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { BrowserEventEmitter } from '@/utils/BrowserEventEmitter';

// Define the types for the events
type AuthChangeEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'PASSWORD_RECOVERY'
  | 'USER_UPDATED';

interface AuthStateListener {
  (event: AuthChangeEvent, session: Session | null): void | Promise<void>;
}

type Profile = {
  id: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
};

type PublicUser = {
  id: string;
  email: string;
  profile?: Profile;
};

type UserMetadata = {
  providerId?: string;
  provider?: string;
  name?: string;
  avatar_url?: string;
  email?: string;
  sub?: string;
  iss?: string;
};

type ExtendedUser = User & { user_metadata: UserMetadata };

type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface AuthEvents {
  'auth:signIn': (user: User) => void;
  'auth:signOut': () => void;
  'auth:tokenRefresh': (session: Session) => void;
  'profile:update': (profile: UserProfile) => void;
}

class AuthManager {
  private supabase: SupabaseClient<Database>;
  private eventEmitter: BrowserEventEmitter<AuthEvents>;
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private currentProfile: UserProfile | null = null;

  constructor() {
    this.supabase = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );
    
    this.eventEmitter = new BrowserEventEmitter<AuthEvents>();
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Set up auth state listener
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      this.currentSession = session;
      this.currentUser = session?.user ?? null;
      
      if (event === 'SIGNED_IN' && this.currentUser) {
        await this.loadUserProfile();
        this.eventEmitter.emit('auth:signIn', this.currentUser);
      } else if (event === 'SIGNED_OUT') {
        this.currentProfile = null;
        this.eventEmitter.emit('auth:signOut');
      } else if (event === 'TOKEN_REFRESHED' && session) {
        this.eventEmitter.emit('auth:tokenRefresh', session);
      }
    });

    // Check for existing session
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      this.currentSession = session;
      this.currentUser = session.user;
      await this.loadUserProfile();
    }
  }

  private async loadUserProfile() {
    if (!this.currentUser) return;

    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
        return;
      }

      this.currentProfile = profile;
      if (profile) {
        this.eventEmitter.emit('profile:update', profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async resetPassword(email: string) {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { data, error };
  }

  async updatePassword(password: string) {
    const { data, error } = await this.supabase.auth.updateUser({
      password
    });
    return { data, error };
  }

  // Profile methods
  async updateProfile(updates: Partial<UserProfile>) {
    if (!this.currentUser) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', this.currentUser.id)
      .select()
      .single();

    if (!error && data) {
      this.currentProfile = data;
      this.eventEmitter.emit('profile:update', data);
    }

    return { data, error };
  }

  async createProfile(profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
    if (!this.currentUser) {
      return { error: new Error('User not authenticated') };
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        id: this.currentUser.id,
        ...profileData
      })
      .select()
      .single();

    if (!error && data) {
      this.currentProfile = data;
      this.eventEmitter.emit('profile:update', data);
    }

    return { data, error };
  }

  // Getters
  get user() {
    return this.currentUser;
  }

  get session() {
    return this.currentSession;
  }

  get profile() {
    return this.currentProfile;
  }

  get isAuthenticated() {
    return !!this.currentUser;
  }

  // Event subscription methods
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  onSignIn(callback: (user: User) => void) {
    return this.eventEmitter.on('auth:signIn', callback);
  }

  onSignOut(callback: () => void) {
    return this.eventEmitter.on('auth:signOut', callback);
  }

  onTokenRefresh(callback: (session: Session) => void) {
    return this.eventEmitter.on('auth:tokenRefresh', callback);
  }

  onProfileUpdate(callback: (profile: UserProfile) => void) {
    return this.eventEmitter.on('profile:update', callback);
  }

  // Utility methods
  async refreshSession() {
    const { data, error } = await this.supabase.auth.refreshSession();
    return { data, error };
  }

  getSupabaseClient() {
    return this.supabase;
  }
}

// Export singleton instance
export const authManager = new AuthManager();
export default authManager;
