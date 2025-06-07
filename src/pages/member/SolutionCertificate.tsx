
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionCertificate } from "@/hooks/learning/useSolutionCertificate";
import { CertificateViewer } from "@/components/learning/certificates/CertificateViewer";
import { SolutionCertificateEligibility } from "@/components/learning/certificates/SolutionCertificateEligibility";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award } from "lucide-react";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";

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
    downloadCertificate
  } = useSolutionCertificate(id || '');

  const loading = solutionLoading || certificateLoading;

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

  const handleDownload = () => {
    if (certificate && profile) {
      downloadCertificate(certificate, profile);
    }
  };

  const handleShare = () => {
    if (certificate) {
      const shareUrl = `${window.location.origin}/certificado/validar/${certificate.validation_code}`;
      if (navigator.share) {
        navigator.share({
          title: 'Meu Certificado de Implementação',
          text: `Confira meu certificado de implementação da solução: ${solution.title}`,
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        // toast aqui seria ideal, mas vamos usar alert por simplicidade
        alert('Link do certificado copiado para a área de transferência!');
      }
    }
  };

  const handleValidate = () => {
    if (certificate) {
      window.open(`/certificado/validar/${certificate.validation_code}`, '_blank');
    }
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
          <Award className="h-6 w-6 text-viverblue" />
          <h1 className="text-3xl font-bold text-white">Certificado de Implementação</h1>
        </div>
        
        <p className="text-gray-300">
          Certificado para a solução: <strong>{solution.title}</strong>
        </p>
      </div>

      {certificate ? (
        // Mostrar certificado visual quando já existe
        <CertificateViewer
          certificate={certificate}
          userProfile={profile!}
          onDownload={handleDownload}
          onShare={handleShare}
          onValidate={handleValidate}
        />
      ) : (
        // Mostrar status de elegibilidade quando não tem certificado
        <Card className="bg-[#151823] border-neutral-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-viverblue" />
              Status do Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-[#1A1E2E] border border-neutral-600">
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
