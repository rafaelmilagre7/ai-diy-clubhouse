
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, RefreshCw, ShieldCheck } from "lucide-react";
import { useRetroactiveCertificates } from "@/hooks/learning/useRetroactiveCertificates";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const RetroactiveCertificatesPanel = () => {
  const {
    generateAllRetroactiveCertificates,
    isGeneratingAll,
    generateUserRetroactiveCertificates,
    isGeneratingUser,
    isAdmin
  } = useRetroactiveCertificates();

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-aurora-primary" />
          Gerar Certificados Retroativos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/20 border-blue-700/30">
          <Award className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            Se você completou cursos ou implementou soluções mas não possui os certificados, 
            use esta função para gerar automaticamente todos os certificados que você tem direito.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Meus Certificados</h4>
              <p className="text-sm text-gray-400">
                Gera certificados para todos os cursos e soluções que você completou
              </p>
            </div>
            <Button
              onClick={() => generateUserRetroactiveCertificates()}
              disabled={isGeneratingUser}
              variant="aurora-primary"
            >
              {isGeneratingUser ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Gerar Meus Certificados
                </>
              )}
            </Button>
          </div>

          {isAdmin && (
            <>
              <div className="border-t border-neutral-700 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">Todos os Usuários</h4>
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      Gera certificados retroativos para todos os usuários elegíveis
                    </p>
                  </div>
                  <Button
                    onClick={() => generateAllRetroactiveCertificates()}
                    disabled={isGeneratingAll}
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                  >
                    {isGeneratingAll ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Gerar Todos
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
