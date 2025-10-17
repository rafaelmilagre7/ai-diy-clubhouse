
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getBlocksCount } from "../utils/resourceSectionUtils";

interface ModuleSummaryCardProps {
  modules: any[];
}

const ModuleSummaryCard: React.FC<ModuleSummaryCardProps> = ({ modules }) => {
  if (modules.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Conteúdo</CardTitle>
        <CardDescription>
          Visão geral dos módulos de conteúdo existentes nesta solução.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-scroll-md pr-4">
          <div className="space-y-6">
            {modules.map((module, index) => (
              <div key={module.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    Módulo {index + 1}: {module.title}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {getBlocksCount(module.content)} blocos
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tipo: <span className="capitalize">{module.type}</span>
                </p>
                <Separator />
              </div>
            ))}
            
            {modules.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum módulo de conteúdo criado ainda.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ModuleSummaryCard;
