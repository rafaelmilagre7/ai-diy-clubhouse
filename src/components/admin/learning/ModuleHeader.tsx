
import { Button } from "@/components/ui/button";
import { Module } from "@/types/learningTypes";
import { ArrowLeft, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModuleHeaderProps {
  module: Module;
  onBack: () => void;
}

export function ModuleHeader({ module, onBack }: ModuleHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{module.title}</h1>
            <Badge variant={module.published ? "default" : "secondary"}>
              {module.published ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          {module.description && (
            <p className="text-muted-foreground line-clamp-1">{module.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <a 
            href={`/learning/module/${module.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </a>
        </Button>
      </div>
    </div>
  );
}
