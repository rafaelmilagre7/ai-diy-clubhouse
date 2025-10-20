
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Video, 
  CheckSquare, 
  List, 
  AlertTriangle, 
  LineChart, 
  Zap, 
  Award 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { moduleTypes } from "./moduleTypes";

interface ModuleTypeSelectorProps {
  selectedType: string;
  onSelectType: (type: string) => void;
}

const ModuleTypeSelector: React.FC<ModuleTypeSelectorProps> = ({
  selectedType,
  onSelectType
}) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case "landing": return <FileText className="h-8 w-8" />;
      case "overview": return <Video className="h-8 w-8" />;
      case "preparation": return <CheckSquare className="h-8 w-8" />;
      case "implementation": return <List className="h-8 w-8" />;
      case "verification": return <AlertTriangle className="h-8 w-8" />;
      case "results": return <LineChart className="h-8 w-8" />;
      case "optimization": return <Zap className="h-8 w-8" />;
      case "celebration": return <Award className="h-8 w-8" />;
      default: return <FileText className="h-8 w-8" />;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {moduleTypes.map((moduleType) => (
        <Card 
          key={moduleType.type}
          className={cn(
            "cursor-pointer hover:border-primary hover:bg-muted transition-all",
            selectedType === moduleType.type && "border-primary bg-primary/5"
          )}
          onClick={() => onSelectType(moduleType.type)}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className={cn(
              "p-2 rounded-full mb-2 text-primary-foreground",
              selectedType === moduleType.type ? "bg-primary" : "bg-muted-foreground"
            )}>
              {getIconForType(moduleType.type)}
            </div>
            <h3 className="font-medium text-sm">{moduleType.title}</h3>
            <span className="text-xs text-muted-foreground mt-1">Módulo {moduleType.order + 1}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModuleTypeSelector;
