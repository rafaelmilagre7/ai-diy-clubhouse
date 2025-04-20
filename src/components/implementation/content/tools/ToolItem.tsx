
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useLogging } from "@/hooks/useLogging";
import { Tool } from "@/types/toolTypes";

interface ToolItemProps {
  toolId?: string;
  toolName?: string;
  toolUrl?: string;
  isRequired?: boolean;
}

export const ToolItem: React.FC<ToolItemProps> = ({ 
  toolId,
  toolName,
  toolUrl,
  isRequired = true
}) => {
  const { log, logError } = useLogging();

  // Buscar detalhes da ferramenta pelo ID ou nome
  const { data: tool, isLoading } = useQuery({
    queryKey: ['tool', toolId, toolName],
    queryFn: async () => {
      // Primeiro, tente buscar a ferramenta pelo ID se disponível
      if (toolId) {
        log("Buscando ferramenta pelo ID", { toolId });
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .eq('id', toolId)
          .single();
        
        if (error) {
          logError("Erro ao buscar ferramenta pelo ID", error);
        } else if (data) {
          log("Ferramenta encontrada pelo ID", { toolId, name: data.name });
          return data as Tool;
        }
      }
      
      // Se não encontrou pelo ID ou se o ID não está disponível, tente pelo nome
      if (toolName) {
        log("Buscando ferramenta pelo nome", { toolName });
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .ilike('name', toolName)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 é "nenhum resultado encontrado"
          logError("Erro ao buscar ferramenta pelo nome", error);
        } else if (data) {
          log("Ferramenta encontrada pelo nome", { name: data.name, logo: data.logo_url });
          return data as Tool;
        }
      }
      
      // Se não encontrou no banco de dados, criar um objeto básico com as informações disponíveis
      const defaultTool = {
        name: toolName || "Ferramenta",
        description: "Ferramenta necessária para implementação desta solução",
        official_url: toolUrl || "",
        category: "Outros",
        logo_url: null
      } as Tool;
      
      log("Usando ferramenta padrão, não encontrada na base", { defaultTool });
      return defaultTool;
    },
    enabled: !!toolId || !!toolName
  });

  if (isLoading) {
    return (
      <Card className="border overflow-hidden animate-pulse">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Obter as iniciais para o fallback
  const getInitials = () => {
    const name = tool?.name || toolName || "??";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="border overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-4 flex-row items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
          {tool?.logo_url ? (
            <img 
              src={tool.logo_url} 
              alt={tool?.name || toolName} 
              className="h-full w-full object-contain"
              onError={() => {
                logError("Erro ao carregar logo da ferramenta", { 
                  name: tool.name, 
                  logo_url: tool.logo_url 
                });
                // O erro será capturado e exibirá o fallback automaticamente
              }}
            />
          ) : (
            <div className="text-xl font-bold text-[#0ABAB5]">
              {getInitials()}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm">{tool?.name || toolName}</h3>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] text-xs">
              {tool?.category || "Outros"}
            </Badge>
            {isRequired && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs">
                Obrigatória
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2 flex-1">
        <p className="text-xs text-muted-foreground">
          {tool?.description || "Ferramenta necessária para a implementação desta solução"}
        </p>
      </CardContent>
      {(tool?.official_url || toolUrl) && (
        <CardFooter className="border-t px-4 py-3">
          <a 
            href={tool?.official_url || toolUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            Acessar <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
        </CardFooter>
      )}
    </Card>
  );
};
