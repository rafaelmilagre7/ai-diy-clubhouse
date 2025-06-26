
import { User } from '@supabase/supabase-js';

interface InviteDetails {
  email: string;
  role_id: string;
  token: string;
  name?: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
}

interface HandleInviteFlowParams {
  token: string;
  inviteEmail: string;
  currentUser: User | null;
  inviteDetails: InviteDetails;
}

class AuthManager {
  private static instance: AuthManager;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
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
