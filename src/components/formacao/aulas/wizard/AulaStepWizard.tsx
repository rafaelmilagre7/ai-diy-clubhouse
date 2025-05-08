
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCreateAula } from "@/hooks/formacao/useCreateAula";

// Importações das etapas
// Por enquanto vamos criar placeholders para essas etapas
const EtapaInfoBasica = ({ form, onNext }: any) => (
  <div>
    <h3>Etapa de Informações Básicas</h3>
    <button onClick={onNext}>Próximo</button>
  </div>
);

const EtapaConteudo = ({ form, onNext, onPrevious }: any) => (
  <div>
    <h3>Etapa de Conteúdo</h3>
    <button onClick={onPrevious}>Voltar</button>
    <button onClick={onNext}>Próximo</button>
  </div>
);

const EtapaVideos = ({ form, onNext, onPrevious, isSaving }: any) => (
  <div>
    <h3>Etapa de Vídeos</h3>
    <button onClick={onPrevious}>Voltar</button>
    <button onClick={onNext}>Próximo</button>
  </div>
);

const EtapaAtividades = ({ form, onNext, onPrevious }: any) => (
  <div>
    <h3>Etapa de Atividades</h3>
    <button onClick={onPrevious}>Voltar</button>
    <button onClick={onNext}>Próximo</button>
  </div>
);

const EtapaMateriais = ({ form, onNext, onPrevious }: any) => (
  <div>
    <h3>Etapa de Materiais</h3>
    <button onClick={onPrevious}>Voltar</button>
    <button onClick={onNext}>Próximo</button>
  </div>
);

const EtapaRevisao = ({ form, onPrevious, onSubmit, isSaving }: any) => (
  <div>
    <h3>Etapa de Revisão</h3>
    <button onClick={onPrevious}>Voltar</button>
    <button onClick={onSubmit} disabled={isSaving}>Salvar</button>
  </div>
);

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
  coverImageUrl?: string;
  aiAssistantEnabled?: boolean;
  aiAssistantPrompt?: string;
  published?: boolean;
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
  const { mutate: createAula, isLoading: isAulaCreating } = useCreateAula();

  const methods = useForm<AulaFormValues>({
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
      coverImageUrl: "",
      aiAssistantEnabled: false,
      aiAssistantPrompt: "",
      published: false,
    },
  });

  const handleNext = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePrevious = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubmit = methods.handleSubmit(async (data: AulaFormValues) => {
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
  });

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
          <EtapaInfoBasica form={methods} onNext={() => handleNext("conteudo")} />
        )}
        {activeTab === "conteudo" && (
          <EtapaConteudo
            form={methods}
            onNext={() => handleNext("videos")}
            onPrevious={() => handlePrevious("informacoes")}
          />
        )}
        {activeTab === "videos" && (
          <EtapaVideos
            form={methods}
            onNext={() => handleNext("atividades")}
            onPrevious={() => handlePrevious("conteudo")}
            isSaving={isSaving}
          />
        )}
        {activeTab === "atividades" && (
          <EtapaAtividades
            form={methods}
            onNext={() => handleNext("materiais")}
            onPrevious={() => handlePrevious("videos")}
          />
        )}
        {activeTab === "materiais" && (
          <EtapaMateriais
            form={methods}
            onNext={() => handleNext("revisao")}
            onPrevious={() => handlePrevious("atividades")}
          />
        )}
        {activeTab === "revisao" && (
          <EtapaRevisao
            form={methods}
            onPrevious={() => handlePrevious("materiais")}
            onSubmit={handleSubmit}
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
