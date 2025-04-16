
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AchievementGrid, Achievement } from "@/components/achievements/AchievementGrid";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Achievements = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Definição das conquistas fictícias
        const defaultAchievements: Achievement[] = [
          {
            id: "1",
            name: "Pioneiro",
            description: "Completou sua primeira implementação",
            category: "achievement",
            isUnlocked: false,
            requiredCount: 1,
            currentCount: 0
          },
          {
            id: "2",
            name: "Especialista em Vendas",
            description: "Implementou 3 soluções da trilha de Receita",
            category: "revenue",
            isUnlocked: false,
            requiredCount: 3,
            currentCount: 0
          },
          {
            id: "3",
            name: "Mestre em Automação",
            description: "Implementou 5 soluções com sucesso",
            category: "operational",
            isUnlocked: false,
            requiredCount: 5,
            currentCount: 0
          },
          {
            id: "4",
            name: "Estrategista",
            description: "Completou uma solução da trilha de Estratégia",
            category: "strategy",
            isUnlocked: false,
            requiredCount: 1,
            currentCount: 0
          },
          {
            id: "5",
            name: "Entusiasta de IA",
            description: "Visitou 10 soluções diferentes",
            category: "achievement",
            isUnlocked: false,
            requiredCount: 10,
            currentCount: 0
          },
          {
            id: "6",
            name: "Constante",
            description: "Acessou a plataforma por 7 dias consecutivos",
            category: "achievement",
            isUnlocked: false,
            requiredCount: 7,
            currentCount: 3
          }
        ];

        try {
          // Tentar buscar o progresso do usuário
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select("*")
            .eq("user_id", user.id);

          if (progressError) {
            console.error("Erro ao buscar progresso:", progressError);
          } else {
            // Se encontrar dados de progresso, atualizar as conquistas
            if (progressData && progressData.length > 0) {
              const completedCount = progressData.filter(p => p.is_completed).length;
              const completedRevenue = progressData.filter(p => p.solution_category === "revenue" && p.is_completed).length;
              const completedStrategy = progressData.filter(p => p.solution_category === "strategy" && p.is_completed).length;
              
              // Atualizar conquistas com base no progresso
              defaultAchievements[0].currentCount = completedCount;
              defaultAchievements[0].isUnlocked = completedCount >= 1;
              if (defaultAchievements[0].isUnlocked) {
                defaultAchievements[0].earnedAt = new Date().toISOString();
              }
              
              defaultAchievements[1].currentCount = completedRevenue;
              defaultAchievements[1].isUnlocked = completedRevenue >= 3;
              if (defaultAchievements[1].isUnlocked) {
                defaultAchievements[1].earnedAt = new Date().toISOString();
              }
              
              defaultAchievements[2].currentCount = completedCount;
              defaultAchievements[2].isUnlocked = completedCount >= 5;
              if (defaultAchievements[2].isUnlocked) {
                defaultAchievements[2].earnedAt = new Date().toISOString();
              }
              
              defaultAchievements[3].currentCount = completedStrategy;
              defaultAchievements[3].isUnlocked = completedStrategy >= 1;
              if (defaultAchievements[3].isUnlocked) {
                defaultAchievements[3].earnedAt = new Date().toISOString();
              }
            }
          }

          // Buscar conquistas do usuário no banco de dados (se implementado)
          const { data: userBadges, error: badgesError } = await supabase
            .from("user_badges")
            .select("*, badge:badge_id(*)")
            .eq("user_id", user.id);

          if (badgesError) {
            console.warn("Erro ao buscar conquistas:", badgesError);
          } else if (userBadges && userBadges.length > 0) {
            // Se existirem conquistas no banco de dados, usá-las (implementação futura)
            console.log("Conquistas encontradas:", userBadges);
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }

        setAchievements(defaultAchievements);
      } catch (error) {
        console.error("Erro ao carregar conquistas:", error);
        toast({
          title: "Erro ao carregar conquistas",
          description: "Não foi possível carregar suas conquistas. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user, toast]);

  if (loading) {
    return <LoadingScreen message="Carregando suas conquistas..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Minhas Conquistas</h1>
          <p className="text-muted-foreground mt-1">
            Veja suas conquistas e desbloqueie novos marcos
          </p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>
      </div>

      <div className="mt-8">
        <AchievementGrid achievements={achievements} />
      </div>
    </div>
  );
};

export default Achievements;
