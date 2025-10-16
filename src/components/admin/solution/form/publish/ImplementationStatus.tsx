
import React from "react";
import { FileText, Wrench, Video, ClipboardCheck, Globe, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import StatusCard from "./StatusCard";

interface ImplementationStatusProps {
  isPublished: boolean;
}

/**
 * Componente que representa o status geral da implementação de uma solução
 * Exibe cartões de status para diferentes aspectos da solução
 * Permite uma visão rápida do progresso e completude antes da publicação
 */
const ImplementationStatus: React.FC<ImplementationStatusProps> = ({ isPublished }) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Status de Implementação</h4>
      <div className="grid grid-cols-2 gap-4">
        {/* Cartão de status das informações básicas sempre marcado como concluído */}
        <Card className="p-4 border-l-4 border-l-aurora-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-aurora-primary" />
              <span className="font-medium">Informações Básicas</span>
            </div>
            <CheckCircle2 className="h-5 w-5 text-aurora-primary" />
          </div>
        </Card>
        
        {/* Status dos diferentes componentes da solução */}
        <StatusCard 
          icon={<Wrench className="h-5 w-5" />}
          title="Ferramentas"
          status="check"
        />
        
        <StatusCard 
          icon={<FileText className="h-5 w-5" />}
          title="Materiais de Apoio"
          status="check"
        />
        
        <StatusCard 
          icon={<Video className="h-5 w-5" />}
          title="Vídeo-aulas"
          status="check"
        />
        
        <StatusCard 
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="Checklist de Implementação"
          status="check"
        />
        
        {/* Status de publicação dinâmico */}
        <StatusCard 
          icon={<Globe className="h-5 w-5" />}
          title="Publicação"
          status={isPublished ? "check" : "pending"}
        />
      </div>
    </div>
  );
};

export default ImplementationStatus;
