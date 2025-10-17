
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Tool } from "@/types/toolTypes";
import { ToolImage } from "./ToolImage";

interface AvailableToolCardProps {
  tool: Tool;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}

export const AvailableToolCard: React.FC<AvailableToolCardProps> = ({
  tool,
  isSelected,
  onSelect,
  onDeselect,
}) => {
  return (
    <Card className={`flex flex-col h-full border overflow-hidden shadow-sm bg-card text-card-foreground ${
      isSelected ? "border-aurora-primary" : ""
    }`}>
      <CardHeader className="pb-3 pt-4 px-4 flex-row items-center gap-3">
        <ToolImage tool={tool} size="small" />
        <div>
          <h3 className="font-medium text-sm line-clamp-1">{tool.name}</h3>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="bg-aurora-primary/10 text-aurora-primary text-xs">
              {tool.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {tool.description}
        </p>
      </CardContent>
      <CardFooter className="px-4 py-3 flex justify-between border-t">
        <button
          className={`text-sm ${
            isSelected
            ? "text-aurora-primary"
            : "text-operational"
          }`}
          onClick={isSelected ? onDeselect : onSelect}
        >
          {isSelected ? "Remover" : "Adicionar"}
        </button>
        
        {tool.official_url && (
          <a 
            href={tool.official_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-500"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </CardFooter>
    </Card>
  );
};
