
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Award, CheckCircle, Download, Share, ArrowRight, Trophy, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";
import confetti from "canvas-confetti";

const ImplementationCompleted = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  
  // Carregar dados da solução
  const { solution, loading } = useSolutionData(id);
  
  // Efeito confetti ao carregar
  useEffect(() => {
    if (showConfetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          setShowConfetti(false);
          return;
        }
        
        // Dispara confetti dos cantos
        confetti({
          particleCount: Math.floor(randomInRange(20, 40)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.3, 0.5) }
        });
        
        confetti({
          particleCount: Math.floor(randomInRange(20, 40)),
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.3, 0.5) }
        });
      }, 450);
      
      return () => clearInterval(interval);
    }
  }, [showConfetti]);
  
  // Gerar certificado
  const generateCertificate = async () => {
    if (!solution || !user) return;
    
    try {
      setIsGenerating(true);
      
      // Simular geração de certificado (integraria com uma API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // URL do certificado fictício
      const url = `https://exemplo.com/certificados/${solution.id}-${user.id}.pdf`;
      setCertificateUrl(url);
      
      toast({
        title: "Certificado gerado",
        description: "Seu certificado de implementação está pronto para download.",
      });
    } catch (error) {
      console.error("Erro ao gerar certificado:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o certificado. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Compartilhar nas redes sociais
  const shareAchievement = () => {
    if (!solution) return;
    
    const text = `Acabei de implementar a solução "${solution.title}" com a ajuda do VIVER DE IA! #VIVERDEIA #IA #Implementação`;
    const url = window.location.href;
    
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };
  
  if (loading) {
    return <LoadingScreen message="Carregando dados da conclusão..." />;
  }
  
  if (!solution) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Solução não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          Não foi possível encontrar a solução solicitada. Verifique o link e tente novamente.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Voltar para Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Card className="border-t-4 border-t-aurora-primary shadow-lg overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-aurora-primary/10 to-transparent -z-10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-aurora-primary/5 to-transparent -z-10 rounded-tr-full"></div>
        
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="absolute inset-0 bg-aurora-primary/20 rounded-full pulse-subtle"></div>
              <div className="rounded-full bg-aurora-primary/10 p-3 relative z-10">
                <Trophy className="h-10 w-10 text-aurora-primary" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl text-aurora-primary">Parabéns! Implementação Concluída</CardTitle>
          <CardDescription className="text-base">
            Você concluiu com sucesso a implementação da solução <span className="font-medium">{solution.title}</span>.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <div className="bg-gradient-to-br from-aurora-primary/5 to-white p-6 rounded-xl text-center">
            <h3 className="font-medium text-lg text-aurora-primary mb-2">
              Você acaba de dar um grande passo na transformação digital do seu negócio!
            </h3>
            <p className="text-neutral-600">
              Esta implementação contribui para melhorias significativas em seus processos e resultados.
            </p>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-aurora-primary/10 text-center stat-item-enter" style={{"--delay": "0"} as React.CSSProperties}>
              <div className="text-2xl font-bold text-aurora-primary">1</div>
              <div className="text-xs text-neutral-500">Solução</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-aurora-primary/10 text-center stat-item-enter" style={{"--delay": "1"} as React.CSSProperties}>
              <div className="text-2xl font-bold text-aurora-primary">8</div>
              <div className="text-xs text-neutral-500">Etapas</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-aurora-primary/10 text-center stat-item-enter" style={{"--delay": "2"} as React.CSSProperties}>
              <div className="text-2xl font-bold text-aurora-primary">+30%</div>
              <div className="text-xs text-neutral-500">Eficiência</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-aurora-primary/10 text-center stat-item-enter" style={{"--delay": "3"} as React.CSSProperties}>
              <div className="text-2xl font-bold text-aurora-primary">50</div>
              <div className="text-xs text-neutral-500">Pontos</div>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden bg-white">
            <div className="bg-slate-50 p-3 border-b">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-aurora-primary" />
                <span>Sua recompensa:</span>
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Certificado de Implementação</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">+50 pontos no seu perfil do VIVER DE IA</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">Acesso a materiais exclusivos de otimização</span>
              </div>
            </div>
          </div>
          
          {/* Próximos passos */}
          <div className="bg-white border rounded-md overflow-hidden mb-2">
            <div className="bg-slate-50 p-3 border-b">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-aurora-primary" />
                <span>Próximos passos:</span>
              </h3>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                <MessageSquare className="h-4 w-4 text-operational" />
                <span className="text-sm">Compartilhe sua experiência com outros membros</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                <Trophy className="h-4 w-4 text-warning" />
                <span className="text-sm">Explore mais soluções para desbloquear novas conquistas</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full hover-lift border-aurora-primary/30 hover:border-aurora-primary/50 flex items-center gap-2"
              onClick={generateCertificate}
              disabled={isGenerating || !!certificateUrl}
            >
              {isGenerating ? (
                <>Gerando certificado...</>
              ) : certificateUrl ? (
                <>
                  <Download className="h-5 w-5" />
                  Baixar Certificado
                </>
              ) : (
                <>
                  <Award className="h-5 w-5" />
                  Gerar Certificado
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full hover-lift border-aurora-primary/30 hover:border-aurora-primary/50 flex items-center gap-2"
              onClick={shareAchievement}
            >
              <Share className="h-5 w-5" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center pt-0">
          <Button 
            variant="aurora-primary"
            onClick={() => navigate("/dashboard")}
          >
            Voltar para Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ImplementationCompleted;
