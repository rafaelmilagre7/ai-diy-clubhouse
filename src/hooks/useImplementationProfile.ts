
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
    if (!user) return;
    setLoading(true);
    supabase
      .from("implementation_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast.error("Erro ao buscar perfil.");
        }
        setProfile(data || null);
        setLoading(false);
      });
  }, [user]);

  const saveProfile = async (values: ImplementationProfile) => {
    if (!user) return;
    setSaving(true);
    let res, error;
    if (profile?.id) {
      ({ error } = await supabase
        .from("implementation_profiles")
        .update({ ...values })
        .eq("id", profile.id));
    } else {
      ({ error } = await supabase
        .from("implementation_profiles")
        .insert([{ ...values, user_id: user.id }]));
    }
    if (!error) {
      toast.success("Perfil salvo com sucesso!");
      setProfile({ ...profile, ...values });
    } else {
      toast.error("Erro ao salvar perfil.");
    }
    setSaving(false);
  };

  return { profile, loading, saving, saveProfile };
};
