
import React from "react";
import { FileText, Wrench, Video, ClipboardCheck, Globe, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import StatusCard from "./StatusCard";

interface ImplementationStatusProps {
  isPublished: boolean;
}

const ImplementationStatus: React.FC<ImplementationStatusProps> = ({ isPublished }) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Status de Implementação</h4>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-l-4 border-l-[#0ABAB5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#0ABAB5]" />
              <span className="font-medium">Informações Básicas</span>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[#0ABAB5]" />
          </div>
        </Card>
        
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
