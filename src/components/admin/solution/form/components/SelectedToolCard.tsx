
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectedTool } from "../types";
import { ToolImage } from "./ToolImage";

interface SelectedToolCardProps {
  tool: SelectedTool;
  onRemove: (id: string) => void;
  onToggleRequired: (id: string) => void;
}

export const SelectedToolCard: React.FC<SelectedToolCardProps> = ({
  tool,
  onRemove,
  onToggleRequired,
}) => {
  return (
    <Card className="border overflow-hidden shadow-sm bg-card text-card-foreground">
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
      <CardContent className="px-4 py-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {tool.description}
        </p>
      </CardContent>
      <CardFooter className="px-4 py-3 flex justify-between border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`required-${tool.id}`}
            checked={tool.is_required}
            onCheckedChange={() => onToggleRequired(tool.id)}
          />
          <label
            htmlFor={`required-${tool.id}`}
            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Obrigatória
          </label>
        </div>
        <button
          className="text-sm text-status-error"
          onClick={() => onRemove(tool.id)}
        >
          Remover
        </button>
      </CardFooter>
    </Card>
  );
};
