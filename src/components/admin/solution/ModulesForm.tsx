
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, Play, Save } from "lucide-react";

interface ModulesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ModulesForm = ({ solutionId, onSave, saving }: ModulesFormProps) => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Módulos da Solução</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Primeiramente, salve as informações básicas da solução antes de configurar os módulos detalhados.
            </p>
            <div className="mt-6">
              {solutionId ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Cada solução é estruturada em 8 módulos sequenciais:
                  </p>
                  <ul className="space-y-2 text-left max-w-md mx-auto">
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">1</Badge>
                      <span>Landing - Apresentação inicial (30s)</span>
                    </li>
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">2</Badge>
                      <span>Visão Geral - Contexto e case (2 min)</span>
                    </li>
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">3</Badge>
                      <span>Preparação - Requisitos e setup (3-5 min)</span>
                    </li>
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">4</Badge>
                      <span>Implementação - Passo a passo (15-30 min)</span>
                    </li>
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">5</Badge>
                      <span>Verificação - Testes de funcionamento (2-5 min)</span>
                    </li>
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">6</Badge>
                      <span>Resultados - Primeiros resultados (5 min)</span>
                    </li>
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">7</Badge>
                      <span>Otimização - Melhorias e ajustes (5 min)</span>
                    </li>
                    <li className="flex items-center">
                      <Badge variant="outline" className="mr-2">8</Badge>
                      <span>Celebração - Conquista e próximos passos (1 min)</span>
                    </li>
                  </ul>
                  <Button type="button" className="mt-4">
                    <Play className="mr-2 h-4 w-4" />
                    Configurar Módulos
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
                  <p className="text-sm">
                    Você precisa salvar a solução primeiro para configurar os módulos.
                  </p>
                  <Button 
                    type="button"
                    onClick={onSave}
                    className="mt-4"
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Solução
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulesForm;
