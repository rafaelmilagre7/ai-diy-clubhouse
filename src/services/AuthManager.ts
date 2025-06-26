
import { User } from '@supabase/supabase-js';

// Interface unificada para InviteDetails - resolve conflito de tipos
export interface InviteDetails {
  email: string;
  role_id: string;
  token: string;
  name?: string;
  whatsapp_number?: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
  expires_at?: string;
  created_at?: string;
}

interface HandleInviteFlowParams {
  token: string;
  inviteEmail: string;
  currentUser: User | null;
  inviteDetails: InviteDetails;
}

type EventCallback = (state: any) => void;

class AuthManager {
  private static instance: AuthManager;
  private state = {
    hasInviteToken: false,
    inviteDetails: null as InviteDetails | null,
    user: null as User | null,
    profile: null as any,
    isLoading: false,
    isAdmin: false,
    onboardingRequired: false
  };
  
  private eventListeners: Map<string, EventCallback[]> = new Map();

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  getState() {
    return this.state;
  }

  setInviteDetails(details: InviteDetails) {
    this.state.inviteDetails = details;
    this.state.hasInviteToken = true;
    this.emit('stateChanged', this.state);
  }

  clearInviteDetails() {
    this.state.inviteDetails = null;
    this.state.hasInviteToken = false;
    this.emit('stateChanged', this.state);
  }

  updateState(newState: Partial<typeof this.state>) {
    this.state = { ...this.state, ...newState };
    this.emit('stateChanged', this.state);
  }

  // Event system methods
  on(event: string, callback: EventCallback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventCallback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Get redirect path based on current state
  getRedirectPath(): string {
    // Admin always goes to admin panel
    if (this.state.isAdmin) {
      return '/admin';
    }

    // If onboarding is required
    if (this.state.onboardingRequired) {
      return '/onboarding';
    }

    // Default to dashboard for authenticated users
    if (this.state.user) {
      return '/dashboard';
    }

    // Not authenticated
    return '/login';
  }

  async handleInviteFlow(params: HandleInviteFlowParams): Promise<string | null> {
    const { token, inviteEmail, currentUser } = params;

    try {
      // If user is not logged in, redirect to login with invite token
      if (!currentUser) {
        return `/login?invite=${token}`;
      }

      // If user email doesn't match invite email, show mismatch screen
      if (currentUser.email !== inviteEmail) {
        return `/invite/${token}/mismatch`;
      }

      // If everything matches, redirect to dashboard
      return '/dashboard';
    } catch (error) {
      console.error('Error in handleInviteFlow:', error);
      return '/login';
    }
  }
}

export default AuthManager;
