
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Award, CheckCircle, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import LoadingScreen from "@/components/common/LoadingScreen";

const ImplementationCompleted = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Carregar dados da solução
  const { solution, loading } = useSolutionData(id);
  
  // Gerar certificado
  const generateCertificate = async () => {
    if (!solution || !user) return;
    
    try {
      setIsGenerating(true);
      
      // Simular geração de certificado (integraria com uma API real)
      // Em uma implementação real, você geraria o PDF através de uma Edge Function
      
      // Simular um delay
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
    
    const text = `Acabei de implementar a solução "${solution.title}" com a ajuda do VIVER DE IA Club! #VIVERDEIA #IA #Implementação`;
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
      <Card className="border-t-4 border-t-green-500 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Award className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Parabéns! Implementação Concluída</CardTitle>
          <CardDescription>
            Você concluiu com sucesso a implementação da solução <span className="font-medium">{solution.title}</span>.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-6 rounded-md text-center">
            <h3 className="font-medium text-lg text-green-800 mb-2">
              Você acaba de dar um grande passo na transformação digital do seu negócio!
            </h3>
            <p className="text-green-700">
              Esta implementação contribui para melhorias significativas em seus processos e resultados.
            </p>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <div className="bg-slate-50 p-4 border-b">
              <h3 className="font-medium">Sua recompensa:</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Certificado de Implementação</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>+50 pontos no seu perfil do VIVER DE IA Club</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Acesso a materiais exclusivos de otimização</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={generateCertificate}
              disabled={isGenerating || !!certificateUrl}
            >
              {isGenerating ? (
                <>Gerando certificado...</>
              ) : certificateUrl ? (
                <>
                  <Download className="mr-2 h-5 w-5" />
                  Baixar Certificado
                </>
              ) : (
                <>
                  <Award className="mr-2 h-5 w-5" />
                  Gerar Certificado
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={shareAchievement}
            >
              <Share className="mr-2 h-5 w-5" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            variant="default" 
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
