
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useLogging } from "@/hooks/useLogging";
import { Tool } from "@/types/toolTypes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

interface ToolItemProps {
  toolId: string;
  isRequired: boolean;
}

export const ToolItem: React.FC<ToolItemProps> = ({ toolId, isRequired }) => {
  const { log } = useLogging();

  const { data: tool, isLoading } = useQuery({
    queryKey: ['tool', toolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single();

      if (error) throw error;
      return data as Tool;
    }
  });

  if (isLoading || !tool) {
    return (
      <Card className="animate-pulse border">
        <CardHeader className="pb-3 pt-4 px-4 flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mt-2"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4 flex-row items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0">
          {tool.logo_url ? (
            <img 
              src={tool.logo_url} 
              alt={tool.name} 
              className="h-full w-full object-contain" 
            />
          ) : (
            <div className="text-xl font-bold text-[#0ABAB5]">
              {tool.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm line-clamp-1">{tool.name}</h3>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="bg-[#0ABAB5]/10 text-[#0ABAB5] text-xs">
              {tool.category}
            </Badge>
            {isRequired && (
              <Badge variant="default" className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-xs">
                Obrigatória
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <p className="text-sm text-muted-foreground">
          {tool.description}
        </p>
      </CardContent>
      
      {tool.official_url && (
        <CardFooter className="px-4 py-3 flex justify-start border-t">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0"
            onClick={() => {
              log("Tool URL clicked", { tool_id: tool.id, tool_name: tool.name });
              window.open(tool.official_url, "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Acessar ferramenta
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
