
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
      const { data, error } = await supabase
        .from("implementation_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) {
        console.log("Perfil carregado:", data);
        setProfile(data);
      } else {
        console.error("Erro ao carregar perfil:", error);
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const saveProfile = async (values: ImplementationProfile) => {
    if (!user) {
      console.error("Usuário não autenticado");
      toast.error("Você precisa estar autenticado para salvar o perfil.");
      return;
    }
    setSaving(true);
    console.log("Salvando perfil com valores:", values);

    try {
      // Simplifiquei: sempre upsert pelo user_id
      const toSend = {
        ...values,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      console.log("Enviando dados para Supabase:", toSend);

      const { error, data } = await supabase
        .from("implementation_profiles")
        .upsert([toSend], { onConflict: "user_id" })
        .select();

      if (error) {
        console.error("Erro detalhado do Supabase:", error);
        setSaving(false);
        toast.error(`Erro ao salvar informações: ${error.message}`);
        return;
      }

      console.log("Resposta do upsert:", data);

      // Buscar perfil atualizado
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("implementation_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Erro ao buscar perfil atualizado:", fetchError);
      }

      setProfile(updatedProfile || null);
      toast.success("Perfil salvo com sucesso!");
    } catch (err) {
      console.error("Exceção ao salvar perfil:", err);
      toast.error("Erro inesperado ao salvar informações.");
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, saving, saveProfile };
};
