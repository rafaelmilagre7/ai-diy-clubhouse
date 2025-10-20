
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionCertificate } from "@/hooks/learning/useSolutionCertificate";
import { UnifiedCertificateViewer } from "@/components/certificates/UnifiedCertificateViewer";
import { SolutionCertificateEligibility } from "@/components/learning/certificates/SolutionCertificateEligibility";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SolutionCertificate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { solution, loading: solutionLoading } = useSolutionData(id);
  const {
    certificate,
    isEligible,
    isLoading: certificateLoading,
    generateCertificate,
    isGenerating,
    downloadCertificate,
    openCertificateInNewTab
  } = useSolutionCertificate(id || '');

  const loading = solutionLoading || certificateLoading;

  console.log('Página do certificado - Estado atual:', {
    certificate: !!certificate,
    isEligible,
    loading,
    isGenerating,
    hasCachedPDF: !!(certificate?.certificate_url)
  });

  if (loading) {
    return <LoadingScreen message="Carregando certificado..." />;
  }

  if (!solution) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Solução não encontrada</h1>
          <Button onClick={() => navigate("/solutions")}>
            Voltar para Soluções
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Perfil não encontrado</h1>
          <Button onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleDownload = () => {
    if (certificate && profile) {
      downloadCertificate(certificate, profile);
    }
  };

  const handleOpenInNewTab = () => {
    if (certificate && profile) {
      openCertificateInNewTab(certificate, profile);
    }
  };

  // Função de compartilhamento simplificada (mantida para compatibilidade)
  const handleShare = () => {
    console.log('Share function called (using new ShareCertificateDropdown component)');
  };

  const handleGenerate = () => {
    generateCertificate();
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/solution/${id}`)}
          className="text-gray-300 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a solução
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-6 w-6 text-aurora-primary" />
          <h1 className="text-3xl font-bold text-white">Certificado de Implementação</h1>
        </div>
        
        <p className="text-gray-300">
          Certificado para a solução: <strong>{solution.title}</strong>
        </p>
      </div>

      {/* Se tem certificado, mostrar o viewer */}
      {certificate ? (
        <UnifiedCertificateViewer
          data={{
            userName: profile?.name || profile?.email || "Usuário",
            solutionTitle: solution?.title || "Solução",
            solutionCategory: solution?.category || "Solução de IA",
            implementationDate: format(new Date(certificate.implementation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            certificateId: certificate.id,
            validationCode: certificate.validation_code
          }}
          headerTitle="Certificado de Implementação"
          headerDescription={`Parabéns! Você conquistou este certificado ao implementar com sucesso a solução "${solution?.title}".`}
          scale={0.6}
        />
      ) : isEligible ? (
        /* Se é elegível mas não tem certificado, mostrar botão para gerar */
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-aurora-primary" />
              Gerar Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-lg bg-status-success/20 border border-status-success/30">
                <h3 className="font-semibold text-status-success mb-2">Parabéns! 🎉</h3>
                <p className="text-muted-foreground mb-4">
                  Você completou com sucesso a implementação da solução <strong>{solution.title}</strong>.
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Clique no botão abaixo para gerar seu certificado de implementação.
                </p>
                
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  variant="aurora-primary"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Gerando certificado...' : 'Gerar Certificado'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Se não é elegível, mostrar status */
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-aurora-primary" />
              Status do Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-surface-elevated border border-border">
                <h3 className="font-semibold text-white mb-2">Sobre esta solução</h3>
                <p className="text-gray-300 text-sm mb-3">{solution.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Categoria:</span>
                    <span className="text-white ml-2">{solution.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Dificuldade:</span>
                    <span className="text-white ml-2">
                      {solution.difficulty === "easy" && "Fácil"}
                      {solution.difficulty === "medium" && "Médio"}
                      {solution.difficulty === "advanced" && "Avançado"}
                    </span>
                  </div>
                </div>
              </div>
              
              <SolutionCertificateEligibility 
                solutionId={solution.id}
                isCompleted={isEligible}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SolutionCertificate;
