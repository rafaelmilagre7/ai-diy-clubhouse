
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink, Clock, AlertCircle } from "lucide-react";
import { useSectionTracking } from "@/hooks/implementation/useSectionTracking";

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface TabBasedToolsSectionProps {
  onSectionComplete: (validationData: any) => void;
  isCompleted: boolean;
  validation?: {
    isValid: boolean;
    message?: string;
    requirement?: string;
  };
}

export const TabBasedToolsSection = ({ 
  onSectionComplete, 
  isCompleted,
  validation 
}: TabBasedToolsSectionProps) => {
  const [exploredTools, setExploredTools] = useState<Set<string>>(new Set());
  const { trackInteraction, getTimeSpentInSeconds, getActionCount } = useSectionTracking("tools");

  // Mock data das ferramentas
  const tools: Tool[] = [
    {
      id: "1",
      name: "ChatGPT",
      description: "Assistente de IA para geração de texto e conversação",
      category: "IA Conversacional",
      url: "https://chat.openai.com",
      difficulty: "beginner"
    },
    {
      id: "2", 
      name: "Claude",
      description: "IA da Anthropic para análise e escrita",
      category: "IA Conversacional",
      url: "https://claude.ai",
      difficulty: "beginner"
    },
    {
      id: "3",
      name: "Midjourney",
      description: "Geração de imagens com IA",
      category: "IA Visual",
      url: "https://midjourney.com",
      difficulty: "intermediate"
    }
  ];

  const handleToolExplore = (toolId: string, toolName: string) => {
    setExploredTools(prev => new Set([...prev, toolId]));
    trackInteraction(`explore_${toolName}`);
  };

  const handleCompleteSection = () => {
    const validationData = {
      interactionCount: exploredTools.size,
      timeSpent: getTimeSpentInSeconds(),
      exploredTools: Array.from(exploredTools)
    };
    
    onSectionComplete(validationData);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-amber-100 text-amber-800"; 
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Ferramentas Essenciais</h2>
          <p className="text-gray-600 mt-1">
            Explore as ferramentas necessárias para implementar esta solução
          </p>
        </div>
        
        {validation && !validation.isValid && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">{validation.requirement}</span>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Progresso</span>
            </div>
            <div className="text-sm text-gray-600">
              {exploredTools.size}/2 ferramentas exploradas • {Math.floor(getTimeSpentInSeconds() / 60)}min
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tools grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const isExplored = exploredTools.has(tool.id);
          
          return (
            <Card key={tool.id} className={`transition-all duration-200 ${
              isExplored ? 'border-green-200 bg-green-50' : 'hover:shadow-md'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  {isExplored && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {tool.category}
                  </Badge>
                  <Badge className={`text-xs ${getDifficultyColor(tool.difficulty)}`}>
                    {tool.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{tool.description}</p>
                
                <Button
                  variant={isExplored ? "secondary" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToolExplore(tool.id, tool.name)}
                  asChild
                >
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isExplored ? "Explorado" : "Explorar Ferramenta"}
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion button */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-600">
          {validation?.message && (
            <p className="text-amber-600">{validation.message}</p>
          )}
        </div>
        
        <Button
          onClick={handleCompleteSection}
          disabled={isCompleted}
          size="lg"
          className="flex items-center gap-2"
        >
          {isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Seção Concluída
            </>
          ) : (
            "Marcar como Concluída"
          )}
        </Button>
      </div>
    </div>
  );
};
