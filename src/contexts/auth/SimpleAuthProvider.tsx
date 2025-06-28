
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '@/lib/supabase';
import { fetchUserProfile, createUserProfileIfNeeded } from './utils/profileUtils/userProfileFunctions';
import { logger } from '@/utils/logger';

interface SimpleAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isFormacao: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData?: any) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SimpleAuthContext = createContext<SimpleAuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAdmin: false,
  isFormacao: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider');
  }
  return context;
};

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      const userProfile = await fetchUserProfile(user.id);
      setProfile(userProfile);
    } catch (error) {
      logger.error('Erro ao atualizar perfil:', error);
    }
  };

  const transformToUserProfile = (data: any): UserProfile => {
    return {
      id: data.id,
      email: data.email || '',
      name: data.name || '',
      avatar_url: data.avatar_url,
      company_name: data.company_name,
      industry: data.industry,
      role_id: data.role_id,
      role: (data.role || 'member') as UserRole,
      created_at: data.created_at,
      updated_at: data.updated_at,
      onboarding_completed: data.onboarding_completed || false,
      onboarding_completed_at: data.onboarding_completed_at,
      
      // Required fields with defaults
      birth_date: data.birth_date || null,
      curiosity: data.curiosity || null,
      business_sector: data.business_sector || null,
      position: data.position || null,
      company_size: data.company_size || null,
      annual_revenue: data.annual_revenue || null,
      primary_goal: data.primary_goal || null,
      business_challenges: data.business_challenges || [],
      ai_knowledge_level: data.ai_knowledge_level || null,
      weekly_availability: data.weekly_availability || null,
      networking_interests: data.networking_interests || [],
      nps_score: data.nps_score || null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      phone: data.phone || null,
      phone_country_code: data.phone_country_code || '+55',
      linkedin: data.linkedin || null,
      instagram: data.instagram || null,
      current_position: data.current_position || null,
      company_website: data.company_website || null,
      accepts_marketing: data.accepts_marketing || null,
      accepts_case_study: data.accepts_case_study || null,
      
      // Additional required fields
      has_implemented_ai: data.has_implemented_ai || null,
      ai_tools_used: data.ai_tools_used || [],
      daily_tools: data.daily_tools || [],
      who_will_implement: data.who_will_implement || null,
      implementation_timeline: data.implementation_timeline || null,
      team_size: data.team_size || null,
      main_challenges: data.main_challenges || [],
      success_metrics: data.success_metrics || [],
      learning_preferences: data.learning_preferences || [],
      time_investment: data.time_investment || null,
      budget_range: data.budget_range || null,
      technical_level: data.technical_level || null,
      support_needs: data.support_needs || [],
      
      user_roles: data.user_roles ? {
        id: data.user_roles.id,
        name: data.user_roles.name,
        description: data.user_roles.description
      } : null
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch or create profile
          const userProfile = await createUserProfileIfNeeded(session.user.id, {
            email: session.user.email,
            name: session.user.user_metadata?.name || ''
          });
          
          if (userProfile) {
            setProfile(userProfile);
          }
        }
      } catch (error) {
        logger.error('Erro na inicialização da autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        
        const userProfile = await createUserProfileIfNeeded(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.name || ''
        });
        
        if (userProfile) {
          setProfile(userProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, userData?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signOut = logout; // Alias for logout

  const isAdmin = profile?.user_roles?.name === 'admin';
  const isFormacao = profile?.user_roles?.name === 'formacao';

  return (
    <SimpleAuthContext.Provider value={{
      user,
      profile,
      isLoading,
      isAdmin,
      isFormacao,
      login,
      register,
      logout,
      signOut,
      refreshProfile
    }}>
      {children}
    </SimpleAuthContext.Provider>
  );
};
