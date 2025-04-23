
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

/**
 * O tipo do perfil segue o banco de dados, mas todos campos são string/simples para facilitar salvamento.
 */
export type ImplementationProfile = {
  id?: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  phone_country_code?: string;
  instagram?: string;
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
  ai_knowledge_level?: string;
  nps_score?: string;
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
    if (!user) return;
    setSaving(true);

    // Simplifiquei: sempre upsert pelo user_id
    const toSend = {
      ...values,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("implementation_profiles")
      .upsert([toSend], { onConflict: "user_id" });

    if (error) {
      setSaving(false);
      toast.error("Erro ao salvar informações. Tente novamente.");
      return;
    }
    // Buscar perfil atualizado
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
