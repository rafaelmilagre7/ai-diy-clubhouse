
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export type ImplementationProfile = {
  id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  country?: string;
  state?: string;
  city?: string;
  company_name?: string;
  company_website?: string;
  current_position?: string;
  company_sector?: string;
  company_size?: string;
  annual_revenue?: string;
  primary_goal?: string;
  business_challenges?: string[];
  ai_knowledge_level?: number;
  weekly_availability?: string;
  networking_interests?: string[];
  is_completed?: boolean;
  created_at?: string;
  updated_at?: string;
};

export const useImplementationProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ImplementationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setProfile(null);
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      // Buscar perfil e setar, se não houver, manter como null sem erro
      const { data, error } = await supabase
        .from("implementation_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const saveProfile = async (values: ImplementationProfile) => {
    if (!user) {
      return;
    }
    setSaving(true);

    let response;
    if (profile?.id) {
      // Atualizar perfil existente
      response = await supabase
        .from("implementation_profiles")
        .update({
          ...values,
          is_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
    } else {
      // Criar novo perfil
      response = await supabase
        .from("implementation_profiles")
        .insert([
          {
            ...values,
            user_id: user.id,
            is_completed: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
    }
    const { error } = response;
    if (error) {
      toast.error("Não foi possível salvar o perfil. Tente novamente.");
      setSaving(false);
      return;
    }
    // Buscar perfil atualizado para garantir que o perfil local fique certo
    const { data: updatedProfile } = await supabase
      .from("implementation_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(updatedProfile || null);
    toast.success("Perfil salvo com sucesso!");
    setSaving(false);
  };

  return { profile, loading, saving, saveProfile };
};
