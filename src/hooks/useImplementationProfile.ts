
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { 
  validateLinkedInUrl, 
  validateInstagramUrl, 
  validateCompanyWebsite,
  formatWebsiteUrl,
  formatSocialUrl 
} from "@/utils/validationUtils";

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

  const validateProfile = (values: ImplementationProfile): string[] => {
    const errors: string[] = [];

    // Validar URLs
    if (values.linkedin && !validateLinkedInUrl(values.linkedin)) {
      errors.push("URL do LinkedIn inválida");
    }
    if (values.instagram && !validateInstagramUrl(values.instagram)) {
      errors.push("URL do Instagram inválida");
    }
    if (values.company_website && !validateCompanyWebsite(values.company_website)) {
      errors.push("URL do site da empresa inválida");
    }

    // Validar campos obrigatórios do perfil de implementação
    if (!values.company_name?.trim()) {
      errors.push("Nome da empresa é obrigatório");
    }
    if (!values.company_sector?.trim()) {
      errors.push("Setor da empresa é obrigatório");
    }
    if (!values.company_size?.trim()) {
      errors.push("Tamanho da empresa é obrigatório");
    }
    if (!values.current_position?.trim()) {
      errors.push("Cargo atual é obrigatório");
    }

    // Validar NPS
    if (values.nps_score !== undefined && values.nps_score !== "") {
      const npsNumber = Number(values.nps_score);
      if (isNaN(npsNumber) || npsNumber < 0 || npsNumber > 10) {
        errors.push("NPS deve ser um número entre 0 e 10");
      }
    }

    return errors;
  };

  const saveProfile = async (values: ImplementationProfile) => {
    if (!user) {
      console.error("Usuário não autenticado");
      toast.error("Você precisa estar autenticado para salvar o perfil.");
      return;
    }

    const errors = validateProfile(values);
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setSaving(true);
    console.log("Salvando perfil com valores:", values);

    try {
      // Formatar URLs antes de salvar
      const formattedValues = {
        ...values,
        user_id: user.id,
        linkedin: values.linkedin ? formatSocialUrl(values.linkedin, "linkedin") : null,
        instagram: values.instagram ? formatSocialUrl(values.instagram, "instagram") : null,
        company_website: values.company_website ? formatWebsiteUrl(values.company_website) : null,
        is_completed: true, // Marcar como completo quando salvar
        updated_at: new Date().toISOString(),
      };

      console.log("Enviando dados formatados para Supabase:", formattedValues);

      // Verificar se já existe um perfil para o usuário
      if (profile?.id) {
        // Atualizar perfil existente usando o ID
        const { error } = await supabase
          .from("implementation_profiles")
          .update(formattedValues)
          .eq("id", profile.id);

        if (error) {
          console.error("Erro detalhado do Supabase:", error);
          toast.error(`Erro ao atualizar informações: ${error.message}`);
          return;
        }
      } else {
        // Inserir novo perfil
        const { error } = await supabase
          .from("implementation_profiles")
          .insert([formattedValues]);

        if (error) {
          console.error("Erro detalhado do Supabase:", error);
          toast.error(`Erro ao inserir informações: ${error.message}`);
          return;
        }
      }

      // Buscar o perfil atualizado
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
