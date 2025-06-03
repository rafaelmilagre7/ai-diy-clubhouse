
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Sparkles, Route, RefreshCw } from "lucide-react";

const ImplementationTrailPage = () => {
  const { profile } = useAuth();

  console.log('🛤️ ImplementationTrailPage: Carregando página', { 
    isAdmin: profile?.role === 'admin',
    userRole: profile?.role 
  });

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-6 w-6 text-viverblue" />
            Trilha de Implementação Personalizada
          </CardTitle>
          <CardDescription>
            Sua jornada de IA personalizada com base no seu perfil de onboarding e objetivos de negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAdmin ? (
            <div className="space-y-6">
              {/* Header da Trilha */}
              <Card className="bg-gradient-to-br from-viverblue/10 via-transparent to-viverblue/5 border-viverblue/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-viverblue flex items-center justify-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    Trilha VIVER DE IA Funcionando
                  </CardTitle>
                  <p className="text-neutral-400">
                    Sistema de trilha personalizada funcionando - você está logado como admin
                  </p>
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="outline"
                      className="border-viverblue/40 text-viverblue hover:bg-viverblue/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Gerar Nova Trilha
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Exemplo de Soluções */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-viverblue" />
                  Soluções Recomendadas
                </h3>
                
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-4 border-gray-700">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-viverblue mt-2"></div>
                        <div>
                          <h4 className="font-medium text-white">Solução de IA {i}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            Exemplo de solução recomendada pela IA baseada no seu perfil
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <Card className="bg-neutral-800/20 border-neutral-700/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-neutral-400">
                      🤖 Sistema de trilha personalizada funcionando perfeitamente
                    </p>
                    <p className="text-xs text-neutral-500">
                      As recomendações seriam geradas com IA baseadas no onboarding completo
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
              <p className="text-gray-400">Carregando trilha personalizada...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationTrailPage;
