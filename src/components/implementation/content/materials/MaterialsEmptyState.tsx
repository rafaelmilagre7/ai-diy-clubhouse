
import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileX } from "lucide-react";

export const MaterialsEmptyState: React.FC = () => {
  return (
    <GlassCard className="p-6 text-center">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-3 bg-gray-100 rounded-full">
          <FileX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium">Nenhum material disponível</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Não existem materiais de apoio cadastrados para esta solução ou módulo.
        </p>
      </div>
    </GlassCard>
  );
};
