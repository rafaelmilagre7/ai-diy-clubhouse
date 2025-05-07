
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EtapaVideos from "./etapas/EtapaVideos";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export type DifficultyLevel = "iniciante" | "intermediario" | "avancado";

export interface AulaVideo {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  duration_seconds?: number;
  thumbnail_url?: string;
  video_id?: string;
  origin?: "youtube" | "panda_upload" | "panda_select";
}

export interface AulaFormValues {
  title: string;
  description: string;
  content?: string;
  videos?: AulaVideo[];
  activities?: any[];
  resources?: any[];
  order_index?: number;
  formacao_id?: string;
  modulo_id?: string;
  difficultyLevel?: DifficultyLevel;
}

interface AulaStepWizardProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  moduleId: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const AulaStepWizard: React.FC<AulaStepWizardProps> = ({ 
  open, 
  onOpenChange, 
  moduleId, 
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState("informacoes");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const form = useForm<AulaFormValues>({
    defaultValues: {
      title: "",
      description: "",
      content: "",
      videos: [],
      activities: [],
      resources: [],
      order_index: 0,
      formacao_id: "",
      modulo_id: moduleId,
      difficultyLevel: "iniciante",
    },
  });

  // Simulação do hook de criação de aula
  const createAula = (data: AulaFormValues, options: any) => {
    console.log("Criando aula com dados:", data);
    setTimeout(() => {
      options.onSuccess();
    }, 1000);
  };

  const isAulaCreating = false;

  const handleNext = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePrevious = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubmit = async (data: AulaFormValues) => {
    setIsSaving(true);
    try {
      // Remover campos que não existem no backend
      const submissionData = {
        ...data,
        modulo_id: moduleId
      };

      createAula(submissionData, {
        onSuccess: () => {
          console.log("Aula criada com sucesso!");
          setIsSaving(false);
          if (onSuccess) onSuccess();
          if (onClose) onClose();
          navigate("/formacao/aulas");
        },
        onError: (error: any) => {
          console.error("Erro ao criar aula:", error);
          setIsSaving(false);
        },
      });
    } catch (error) {
      console.error("Erro ao criar aula:", error);
      setIsSaving(false);
    }
  };

  const content = (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="p-4">
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="revisao">Revisão</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="p-4">
        {activeTab === "informacoes" && (
          <EtapaInfoBasica form={form} onNext={() => handleNext("conteudo")} />
        )}
        {activeTab === "conteudo" && (
          <EtapaConteudo
            form={form}
            onNext={() => handleNext("videos")}
            onPrevious={() => handlePrevious("informacoes")}
          />
        )}
        {activeTab === "videos" && (
          <EtapaVideos
            form={form}
            onNext={() => handleNext("atividades")}
            onPrevious={() => handlePrevious("conteudo")}
            isSaving={isSaving}
          />
        )}
        {activeTab === "atividades" && (
          <EtapaAtividades
            form={form}
            onNext={() => handleNext("materiais")}
            onPrevious={() => handlePrevious("videos")}
          />
        )}
        {activeTab === "materiais" && (
          <EtapaMateriais
            form={form}
            onNext={() => handleNext("revisao")}
            onPrevious={() => handlePrevious("atividades")}
          />
        )}
        {activeTab === "revisao" && (
          <EtapaRevisao
            form={form}
            onPrevious={() => handlePrevious("materiais")}
            onSubmit={form.handleSubmit(handleSubmit)}
            isSaving={isSaving || isAulaCreating}
          />
        )}
      </Card>
    </Card>
  );

  // Se o componente for usado dentro de um modal
  if (open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Se o componente for usado em uma página
  return content;
};

export default AulaStepWizard;
