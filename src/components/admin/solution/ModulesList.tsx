
import { Module } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModulesListProps {
  modules: Module[];
  isLoading: boolean;
  onEditModule: (index: number) => void;
  onPreview: () => void;
}

const ModulesList = ({
  modules,
  isLoading,
  onEditModule,
  onPreview,
}: ModulesListProps) => {
  const getModuleTypeName = (type: string) => {
    switch (type) {
      case "landing":
        return "Landing da Solução";
      case "overview":
        return "Visão Geral e Case Real";
      case "preparation":
        return "Preparação Express";
      case "implementation":
        return "Implementação Passo a Passo";
      case "verification":
        return "Verificação de Implementação";
      case "results":
        return "Primeiros Resultados";
      case "optimization":
        return "Otimização Rápida";
      case "celebration":
        return "Celebração e Próximos Passos";
      default:
        return type;
    }
  };

  const getModuleTypeDescription = (type: string) => {
    switch (type) {
      case "landing":
        return "Apresentação inicial (30s)";
      case "overview":
        return "Contexto e case (2 min)";
      case "preparation":
        return "Requisitos e setup (3-5 min)";
      case "implementation":
        return "Passo a passo (15-30 min)";
      case "verification":
        return "Testes de funcionamento (2-5 min)";
      case "results":
        return "Primeiros resultados (5 min)";
      case "optimization":
        return "Melhorias e ajustes (5 min)";
      case "celebration":
        return "Conquista e próximos passos (1 min)";
      default:
        return "";
    }
  };

  const getModuleTypeClass = (type: string) => {
    switch (type) {
      case "landing":
        return "border-blue-300 bg-blue-50";
      case "overview":
        return "border-green-300 bg-green-50";
      case "preparation":
        return "border-yellow-300 bg-yellow-50";
      case "implementation":
        return "border-purple-300 bg-purple-50";
      case "verification":
        return "border-red-300 bg-red-50";
      case "results":
        return "border-indigo-300 bg-indigo-50";
      case "optimization":
        return "border-pink-300 bg-pink-50";
      case "celebration":
        return "border-teal-300 bg-teal-50";
      default:
        return "border-gray-300";
    }
  };

  const getModuleTypeColor = (type: string) => {
    switch (type) {
      case "landing":
        return "border-blue-300 bg-blue-100 text-blue-800";
      case "overview":
        return "border-green-300 bg-green-100 text-green-800";
      case "preparation":
        return "border-yellow-300 bg-yellow-100 text-yellow-800";
      case "implementation":
        return "border-purple-300 bg-purple-100 text-purple-800";
      case "verification":
        return "border-red-300 bg-red-100 text-red-800";
      case "results":
        return "border-indigo-300 bg-indigo-100 text-indigo-800";
      case "optimization":
        return "border-pink-300 bg-pink-100 text-pink-800";
      case "celebration":
        return "border-teal-300 bg-teal-100 text-teal-800";
      default:
        return "border-gray-300 bg-gray-100 text-gray-800";
    }
  };

  const getContentStatus = (module: Module) => {
    if (!module.content || !module.content.blocks) {
      return "Não configurado";
    }
    const blockCount = module.content.blocks.length;
    if (blockCount === 0) {
      return "Vazio";
    }
    return `${blockCount} bloco${blockCount !== 1 ? "s" : ""}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Carregando módulos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Módulos da Solução</h2>
        <Button onClick={onPreview} variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Pré-visualizar Implementação
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {modules.map((module, index) => (
          <Card
            key={module.id}
            className={cn("border-l-4", getModuleTypeClass(module.type))}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className={getModuleTypeColor(module.type)}>
                    Módulo {index + 1}
                  </Badge>
                  <CardTitle className="mt-2">{module.title || getModuleTypeName(module.type)}</CardTitle>
                  <CardDescription>{getModuleTypeDescription(module.type)}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditModule(index)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Status do conteúdo: {getContentStatus(module)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ModulesList;
