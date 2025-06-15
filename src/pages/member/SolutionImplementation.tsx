import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase, Solution, Module, Progress } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlayCircle, CheckCircle, Award } from "lucide-react";
import { SolutionContentSection } from '@/components/solution/SolutionContentSection';
import { SolutionHeaderSection } from '@/components/solution/SolutionHeaderSection';
import { SolutionSidebar } from '@/components/solution/SolutionSidebar';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SolutionCategory } from '@/lib/types/categoryTypes';

const getCategoryDisplayText = (category: SolutionCategory): string => {
  switch (category) {
    case 'Receita':
      return "Receita";
    case 'Operacional':
      return "Operacional";
    case 'Estratégia':
      return "Estratégia";
    default:
      return String(category);
  }
};

const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case "easy":
      return "Fácil";
    case "medium":
      return "Médio";
    case "advanced":
      return "Avançado";
    default:
      return difficulty;
  }
};

const SolutionImplementationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [solution, setSolution] = useState<Solution | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolution = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("solutions")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setSolution(data as Solution);

          // Fetch progress for this solution and user
          if (user) {
            try {
              const { data: progressData, error: progressError } = await supabase
                .from("progress")
                .select("solution_id, is_completed, current_module, completed_modules, created_at, last_activity")
                .eq("solution_id", id)
                .eq("user_id", user.id)
                .single();

              if (progressError) {
                console.warn("Erro ao buscar progresso:", progressError);
                setProgress(null); // Não é um erro crítico, então continua
              } else if (progressData) {
                setProgress(progressData);
              } else {
                setProgress(null);
              }
            } catch (progressFetchError: any) {
              console.error("Erro ao buscar progresso:", progressFetchError);
              setProgress(null);
            }
          } else {
            setProgress(null);
          }
        } else {
          setError("Solução não encontrada");
          toast({
            title: "Solução não encontrada",
            description: "Não foi possível encontrar a solução solicitada.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        setError(error.message || "Erro ao buscar a solução");
        toast({
          title: "Erro ao carregar solução",
          description: error.message || "Não foi possível carregar os dados da solução.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSolution();
  }, [id, toast, user, navigate]);

  const startImplementation = async () => {
    if (!user || !solution) return;

    setInitializing(true);

    try {
      // Iniciar a implementação criando um registro de progresso
      const { data: newProgress, error: progressError } = await supabase
        .from("progress")
        .insert({
          user_id: user.id,
          solution_id: solution.id,
          current_module: 0,
          is_completed: false,
          completed_modules: [],
          last_activity: new Date().toISOString(),
        })
        .select()
        .single();

      if (progressError) {
        throw progressError;
      }

      if (newProgress) {
        setProgress(newProgress);
        navigate(`/implement/${solution.id}/0`);
      }
    } catch (error: any) {
      console.error("Erro ao iniciar implementação:", error);
      toast({
        title: "Erro ao iniciar implementação",
        description: "Ocorreu um erro ao iniciar a implementação. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setInitializing(false);
    }
  };

  const continueImplementation = () => {
    if (!solution || !progress) return;
    navigate(`/implement/${solution.id}/${progress.current_module}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-[#151823] border-white/5">
          <CardContent className="p-6">
            <div className="md:flex md:space-x-6">
              <div className="md:w-2/3 space-y-6">
                <div className="space-y-4 animate-pulse">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-52 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
              <div className="md:w-1/3 space-y-6 hidden sm:block">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="bg-[#151823] border-white/5">
        <CardContent className="p-6">
          <div className="md:flex md:space-x-6">
            <div className="md:w-2/3 space-y-6">
              <SolutionHeaderSection solution={solution} />
              <SolutionContentSection solution={solution} />
            </div>
            <div className="md:w-1/3">
              <SolutionSidebar 
                solution={solution} 
                progress={progress}
                startImplementation={startImplementation}
                continueImplementation={continueImplementation}
                initializing={initializing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SolutionImplementationPage;
