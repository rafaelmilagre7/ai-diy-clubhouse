
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit, Lightbulb, Loader2 } from "lucide-react";
import { TrailCardList } from "@/components/dashboard/TrailCardList";
import LoadingScreen from "@/components/common/LoadingScreen";
import { TrailEmptyState } from "@/components/dashboard/TrailEmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const TrailGeneration = () => {
  const navigate = useNavigate();
  const { trail, isLoading, generateImplementationTrail } = useImplementationTrail();
  const [solutions, setSolutions] = useState<any[]>([]);
  const [generationStage, setGenerationStage] = useState<"initial" | "processing" | "complete">("initial");
  const [processingText, setProcessingText] = useState("Analisando seu perfil...");
  
  // Efeito para simular uma sequência de mensagens durante o processamento
  useEffect(() => {
    if (generationStage === "processing") {
      const messages = [
        "Analisando seu perfil...",
        "Identificando suas prioridades...",
        "Mapeando soluções ideais...",
        "Personalizando sua trilha...",
        "Preparando recomendações...",
        "Quase pronto..."
      ];
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % messages.length;
        setProcessingText(messages[currentIndex]);
        
        // Após percorrer algumas mensagens, transicionar para o estágio completo
        if (currentIndex === messages.length - 1) {
          setTimeout(() => {
            setGenerationStage("complete");
            clearInterval(interval);
          }, 1000);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [generationStage]);
  
  // Efeito para iniciar o processamento e gerar a trilha
  useEffect(() => {
    if (generationStage === "initial") {
      setGenerationStage("processing");
      
      // Gerar a trilha de implementação
      const generateTrail = async () => {
        try {
          await generateImplementationTrail();
        } catch (error) {
          console.error("Erro ao gerar trilha:", error);
        }
      };
      
      generateTrail();
    }
  }, [generationStage, generateImplementationTrail]);
  
  // Preparar as soluções após a trilha ser carregada
  useEffect(() => {
    if (trail) {
      const mappedSolutions = [];
      
      // Preparar soluções de prioridade 1
      trail.priority1.forEach(item => {
        mappedSolutions.push({
          ...item,
          priority: 1
        });
      });
      
      // Preparar soluções de prioridade 2
      trail.priority2.forEach(item => {
        mappedSolutions.push({
          ...item,
          priority: 2
        });
      });
      
      // Preparar soluções de prioridade 3
      trail.priority3.forEach(item => {
        mappedSolutions.push({
          ...item,
          priority: 3
        });
      });
      
      setSolutions(mappedSolutions);
    }
  }, [trail]);
  
  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };
  
  const handleEditOnboarding = () => {
    navigate("/onboarding/review");
  };
  
  // Tela de processamento
  if (generationStage === "processing" || isLoading) {
    return (
      <OnboardingLayout currentStep={9} title="Gerando sua trilha personalizada">
        <div className="flex flex-col items-center justify-center py-16 space-y-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-[#0ABAB5]/20 rounded-full blur-xl"></div>
            <div className="relative z-10 bg-white p-6 rounded-full shadow-lg">
              <Lightbulb size={48} className="text-[#0ABAB5]" />
            </div>
          </motion.div>
          
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 text-[#0ABAB5] animate-spin mx-auto" />
            <h2 className="text-2xl font-bold">{processingText}</h2>
            <p className="text-gray-600 max-w-md">
              O Milagrinho está analisando todas as informações que você compartilhou para criar uma trilha 
              de implementação exclusiva para o seu negócio.
            </p>
          </div>
        </div>
      </OnboardingLayout>
    );
  }
  
  // Tela de erro ou vazia
  if (!trail || solutions.length === 0) {
    return (
      <OnboardingLayout currentStep={9} title="Sua Trilha de Implementação">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <TrailEmptyState onRegenerate={() => setGenerationStage("initial")} />
          
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handleEditOnboarding}>
              <Edit className="mr-2 h-4 w-4" /> Revisar Onboarding
            </Button>
            
            <Button onClick={handleNavigateToDashboard} className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
              Ir para Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }
  
  // Tela de exibição da trilha
  return (
    <OnboardingLayout currentStep={9} title="Sua Trilha de Implementação">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="space-y-8"
      >
        <Card className="bg-gradient-to-br from-[#0ABAB5]/10 to-white border-[#0ABAB5]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-gray-800">
              Sua Trilha Personalizada VIVER DE IA Club
            </CardTitle>
            <CardDescription className="text-base">
              Com base no seu perfil, identificamos as soluções de IA que terão maior impacto no seu negócio.
              Comece pelas soluções marcadas como "Alta Prioridade".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <TrailCardList
                solutions={solutions}
                onSolutionClick={(id) => navigate(`/solution/${id}`)}
                onSeeAll={() => navigate('/solutions')}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleEditOnboarding}>
            <Edit className="mr-2 h-4 w-4" /> Revisar Informações
          </Button>
          
          <Button 
            onClick={handleNavigateToDashboard} 
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            Explorar Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
