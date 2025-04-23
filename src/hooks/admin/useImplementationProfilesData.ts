
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ImplementationProfile } from "@/hooks/useImplementationProfile";

export type ProfileStats = {
  totalProfiles: number;
  completedProfiles: number;
  completionRate: number;
  byCompanySize: Record<string, number>;
  byCompanySector: Record<string, number>;
  byAiLevel: Record<string, number>;
  byPrimaryGoal: Record<string, number>;
  averageNps: number;
  npsDistribution: number[];
  recentProfiles: ImplementationProfile[];
};

export const useImplementationProfilesData = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ImplementationProfile[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalProfiles: 0,
    completedProfiles: 0,
    completionRate: 0,
    byCompanySize: {},
    byCompanySector: {},
    byAiLevel: {},
    byPrimaryGoal: {},
    averageNps: 0,
    npsDistribution: Array(11).fill(0),
    recentProfiles: []
  });

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("implementation_profiles")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) {
          throw error;
        }
        
        const profilesData = data as ImplementationProfile[];
        setProfiles(profilesData);
        
        // Calcular estatísticas
        processStats(profilesData);
      } catch (error) {
        console.error("Erro ao buscar perfis de implementação:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os perfis de implementação.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, [toast]);
  
  const processStats = (profiles: ImplementationProfile[]) => {
    if (profiles.length === 0) {
      return;
    }
    
    // Estatísticas básicas
    const completedProfiles = profiles.filter(p => p.is_completed).length;
    const completionRate = (completedProfiles / profiles.length) * 100;
    
    // Agrupar por tamanho da empresa
    const byCompanySize: Record<string, number> = {};
    profiles.forEach(p => {
      if (p.company_size) {
        byCompanySize[p.company_size] = (byCompanySize[p.company_size] || 0) + 1;
      }
    });
    
    // Agrupar por setor
    const byCompanySector: Record<string, number> = {};
    profiles.forEach(p => {
      if (p.company_sector) {
        byCompanySector[p.company_sector] = (byCompanySector[p.company_sector] || 0) + 1;
      }
    });
    
    // Agrupar por nível de conhecimento em IA
    const byAiLevel: Record<string, number> = {
      '1': 0, // Básico
      '2': 0, // Intermediário
      '3': 0, // Avançado
      '4': 0  // Expert
    };
    
    profiles.forEach(p => {
      if (p.ai_knowledge_level) {
        const level = typeof p.ai_knowledge_level === 'number'
          ? String(p.ai_knowledge_level)
          : p.ai_knowledge_level;
        byAiLevel[level] = (byAiLevel[level] || 0) + 1;
      }
    });
    
    // Agrupar por objetivo principal
    const byPrimaryGoal: Record<string, number> = {};
    profiles.forEach(p => {
      if (p.primary_goal) {
        byPrimaryGoal[p.primary_goal] = (byPrimaryGoal[p.primary_goal] || 0) + 1;
      }
    });
    
    // Calcular NPS
    let npsSum = 0;
    let npsCount = 0;
    const npsDistribution = Array(11).fill(0);
    
    profiles.forEach(p => {
      if (p.nps_score !== null && p.nps_score !== undefined) {
        const score = typeof p.nps_score === 'number'
          ? p.nps_score
          : parseInt(String(p.nps_score));
        
        if (!isNaN(score) && score >= 0 && score <= 10) {
          npsSum += score;
          npsCount++;
          npsDistribution[score]++;
        }
      }
    });
    
    const averageNps = npsCount > 0 ? npsSum / npsCount : 0;
    
    // Perfis recentes (últimos 5)
    const recentProfiles = profiles.slice(0, 5);
    
    setStats({
      totalProfiles: profiles.length,
      completedProfiles,
      completionRate,
      byCompanySize,
      byCompanySector,
      byAiLevel,
      byPrimaryGoal,
      averageNps,
      npsDistribution,
      recentProfiles
    });
  };
  
  return { profiles, stats, loading };
};
