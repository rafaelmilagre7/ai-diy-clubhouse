import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EtapaInformacoes from "./etapas/EtapaInformacoes";
import EtapaConteudo from "./etapas/EtapaConteudo";
import EtapaVideos from "./etapas/EtapaVideos";
import EtapaAtividades from "./etapas/EtapaAtividades";
import EtapaRevisao from "./etapas/EtapaRevisao";
import { useCreateAula } from "@/hooks/formacao/useCreateAula";
import { useNavigate } from "react-router-dom";

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
  origin?: "youtube" | "panda_upload" | "panda_select"; // Adicionada a propriedade origin
}

export interface AulaFormValues {
  title: string;
  description: string;
  content?: string;
  videos?: AulaVideo[];
  activities?: any[];
  order_index?: number;
  formacao_id?: string;
  modulo_id?: string;
}

const AulaStepWizard = () => {
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
      order_index: 0,
      formacao_id: "",
      modulo_id: "",
    },
  });

  const { mutate: createAula, isLoading: isAulaCreating } = useCreateAula();

  const handleNext = (tab: string) => {
    setActiveTab(tab);
  };

  const handlePrevious = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubmit = async (data: AulaFormValues) => {
    setIsSaving(true);
    try {
      createAula(data, {
        onSuccess: () => {
          console.log("Aula criada com sucesso!");
          setIsSaving(false);
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

  return (
    <Card className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="p-4">
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="atividades">Atividades</TabsTrigger>
          <TabsTrigger value="revisao">Revisão</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="p-4">
        {activeTab === "informacoes" && (
          <EtapaInformacoes form={form} onNext={() => handleNext("conteudo")} />
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
            onNext={() => handleNext("revisao")}
            onPrevious={() => handlePrevious("videos")}
          />
        )}
        {activeTab === "revisao" && (
          <EtapaRevisao
            form={form}
            onPrevious={() => handlePrevious("atividades")}
            onSubmit={form.handleSubmit(handleSubmit)}
            isSaving={isSaving || isAulaCreating}
          />
        )}
      </Card>
    </Card>
  );
};

export default AulaStepWizard;
