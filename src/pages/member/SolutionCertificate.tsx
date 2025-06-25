
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, Download, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSolutionCertificates } from "@/hooks/useSolutionCertificates";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

const SolutionCertificate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { certificates, checkEligibility, generateCertificate, isGenerating, downloadCertificate } = useSolutionCertificates(id);

  // Buscar dados da solução
  const { data: solution, isLoading: solutionLoading } = useQuery({
    queryKey: ['solution', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('id', id as any)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Verificar elegibilidade
  const { data: isEligible, isLoading: eligibilityLoading } = useQuery({
    queryKey: ['certificate-eligibility', id, user?.id],
    queryFn: async () => {
      if (!id) return false;
      return await checkEligibility(id);
    },
    enabled: !!id && !!user?.id
  });

  const isLoading = solutionLoading || eligibilityLoading;
  const certificate = certificates.find(cert => cert.solution_id === id);

  if (isLoading) {
    return <LoadingScreen message="Carregando informações do certificado..." />;
  }

  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Solução não encontrada</h1>
          <Button onClick={() => navigate('/solutions')}>
            Voltar para Soluções
          </Button>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(`/solution/${id}`);
  };

  const handleGenerateCertificate = () => {
    if (id) {
      generateCertificate(id);
    }
  };

  const handleDownloadCertificate = () => {
    if (certificate) {
      downloadCertificate(certificate.id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Certificado</h1>
          <p className="text-muted-foreground">{solution.title}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Status do Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certificate ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">Certificado Emitido</p>
                    <p className="text-sm text-muted-foreground">
                      Emitido em {new Date(certificate.issued_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Código: {certificate.validation_code}
                    </p>
                  </div>
                </div>
                <Button onClick={handleDownloadCertificate} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ) : isEligible ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-700">Pronto para Certificado</p>
                    <p className="text-sm text-muted-foreground">
                      Você completou a implementação e pode gerar seu certificado
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateCertificate} 
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  {isGenerating ? 'Gerando...' : 'Gerar Certificado'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-700">Implementação Incompleta</p>
                  <p className="text-sm text-muted-foreground">
                    Complete a implementação da solução para gerar seu certificado
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Solution Info */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre a Solução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{solution.category}</Badge>
              <Badge variant="outline">{solution.difficulty}</Badge>
            </div>
            <p className="text-muted-foreground">{solution.description}</p>
          </CardContent>
        </Card>

        {/* Certificate Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Requisitos para Certificado</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${isEligible ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={isEligible ? 'text-green-700' : 'text-muted-foreground'}>
                  Completar todos os módulos da implementação
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${isEligible ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={isEligible ? 'text-green-700' : 'text-muted-foreground'}>
                  Marcar a implementação como concluída
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SolutionCertificate;
