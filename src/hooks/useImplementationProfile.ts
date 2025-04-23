
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        
        console.log("Buscando perfil de implementação para o usuário:", user.id);
        
        const { data, error } = await supabase
          .from("implementation_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Erro ao buscar perfil:", error);
          setErrorMessage(error.message);
          toast.error("Erro ao buscar perfil: " + error.message);
          return;
        }
        
        console.log("Perfil de implementação encontrado:", data);
        setProfile(data);
      } catch (err) {
        console.error("Erro inesperado ao buscar perfil:", err);
        const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
        setErrorMessage(errorMsg);
        toast.error("Erro ao buscar perfil: " + errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const saveProfile = async (values: ImplementationProfile) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    try {
      setSaving(true);
      setErrorMessage(null);
      
      console.log("Salvando perfil de implementação:", values);
      
      let response;
      
      if (profile?.id) {
        // Atualizar perfil existente
        response = await supabase
          .from("implementation_profiles")
          .update({ 
            ...values,
            is_completed: true, 
            updated_at: new Date().toISOString() 
          })
          .eq("id", profile.id);
      } else {
        // Criar novo perfil
        response = await supabase
          .from("implementation_profiles")
          .insert([{ 
            ...values, 
            user_id: user.id,
            is_completed: true, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
      }
      
      const { error } = response;
      
      if (error) {
        console.error("Erro ao salvar perfil:", error);
        setErrorMessage(error.message);
        toast.error("Erro ao salvar perfil: " + error.message);
        return;
      }
      
      // Buscar o perfil atualizado para ter o ID e outras informações atualizadas
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("implementation_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Erro ao buscar perfil atualizado:", fetchError);
      } else {
        setProfile(updatedProfile);
      }
      
      toast.success("Perfil salvo com sucesso!");
    } catch (err) {
      console.error("Erro inesperado ao salvar perfil:", err);
      const errorMsg = err instanceof Error ? err.message : "Erro desconhecido";
      setErrorMessage(errorMsg);
      toast.error("Erro ao salvar perfil: " + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return { profile, loading, saving, saveProfile, errorMessage };
};
