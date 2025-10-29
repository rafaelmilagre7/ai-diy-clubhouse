import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Users, Zap, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";
import { useRetroactiveCertificates } from "@/hooks/learning/useRetroactiveCertificates";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RetroactiveCertificatesManager() {
  useDynamicSEO({
    title: 'Geração Retroativa de Certificados',
    description: 'Gere certificados para completações anteriores ao sistema.',
    keywords: 'certificados, retroativo, geração'
  });

  const {
    generateAllRetroactiveCertificates,
    isGeneratingAll,
    generateUserRetroactiveCertificates,
    isGeneratingUser,
    isAdmin
  } = useRetroactiveCertificates();

  return (
    <div className="container mx-auto py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          Geração Retroativa de Certificados
        </h1>
        <p className="text-muted-foreground mt-2">
          Emita certificados para completações anteriores ao sistema de certificação
        </p>
      </div>

      {!isAdmin && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Apenas administradores podem acessar esta funcionalidade.
          </AlertDescription>
        </Alert>
      )}

      {isAdmin && (
        <>
          {/* Informações */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Como Funciona</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                Esta ferramenta verifica todos os usuários que completaram soluções ou cursos mas não possuem certificados,
                e gera automaticamente os certificados retroativos.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                O sistema verifica elegibilidade e previne duplicações automaticamente.
              </p>
            </AlertDescription>
          </Alert>

          {/* Card de Geração para Todos */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Gerar para Todos os Usuários
              </CardTitle>
              <CardDescription>
                Executa a geração retroativa para TODOS os usuários da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertTitle>Processo Automatizado</AlertTitle>
                <AlertDescription>
                  O sistema irá:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Verificar todas as soluções completadas</li>
                    <li>Verificar todos os cursos concluídos</li>
                    <li>Gerar certificados apenas para quem não possui</li>
                    <li>Calcular cargas horárias automaticamente</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => generateAllRetroactiveCertificates()}
                disabled={isGeneratingAll}
                className="w-full"
                size="lg"
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando Certificados...
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5 mr-2" />
                    Gerar Certificados para Todos
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Este processo pode levar alguns minutos dependendo da quantidade de usuários
              </p>
            </CardContent>
          </Card>

          {/* Card de Geração Individual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-status-success" />
                Gerar Meus Certificados
              </CardTitle>
              <CardDescription>
                Gera certificados retroativos apenas para o usuário atual (você)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use esta opção para testar o sistema ou gerar seus próprios certificados retroativos
                sem afetar outros usuários.
              </p>

              <Button
                onClick={() => generateUserRetroactiveCertificates()}
                disabled={isGeneratingUser}
                variant="outline"
                className="w-full"
              >
                {isGeneratingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Gerar Meus Certificados
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">⚠️ Observações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Certificados só são gerados para completações válidas (100% de progresso)</li>
                <li>• Não serão criados certificados duplicados - o sistema verifica antes</li>
                <li>• As durações dos vídeos devem estar sincronizadas para cálculo correto da carga horária</li>
                <li>• Certificados gerados ficam disponíveis imediatamente para os usuários</li>
                <li>• Os códigos de validação são únicos e verificáveis</li>
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
