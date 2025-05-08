import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LearningLesson, LearningModule, supabase } from "@/lib/supabase";
import { toast } from "sonner";
import useAulaSteps from "@/hooks/useAulaSteps";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Etapas do wizard
import EtapaInfoBasica from "./etapas/EtapaInfoBasica";
import EtapaMidia from "./etapas/EtapaMidia";
import EtapaVideos from "./etapas/EtapaVideos";
import EtapaMateriais from "./etapas/EtapaMateriais";
import EtapaPublicacao from "./etapas/EtapaPublicacao";

// Componente indicador de progresso
import WizardProgress from "./WizardProgress";
import { setupLearningStorageBuckets } from "@/lib/supabase/storage";
import { Loader2 } from "lucide-react";

// Enum para nível de dificuldade
export enum DifficultyLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced"
}

// Schema completo para validação
const aulaFormSchema = z.object({
  // Etapa 1: Informações Básicas
  title: z.string().min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  moduleId: z.string().uuid({ message: "Por favor, selecione um módulo válido." }),
  difficultyLevel: z.nativeEnum(DifficultyLevel).default(DifficultyLevel.BEGINNER),
  
  // Etapa 2: Imagem e Mídia
  coverImageUrl: z.string().optional(),
  
  // Etapa 3: Vídeos (limitado a 3)
  videos: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().url("Por favor, insira uma URL válida").optional(),
      type: z.string().optional(),
      fileName: z.string().optional(),
      filePath: z.string().optional(),
      fileSize: z.number().optional(),
      duration_seconds: z.number().optional(),
      thumbnail_url: z.string().optional(),
      video_id: z.string().optional(),
    })
  ).max(3, { message: "É permitido no máximo 3 vídeos por aula" }).optional().default([]),
  
  // Etapa 4: Materiais
  resources: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      type: z.string().optional(),
      fileName: z.string().optional(),
      fileSize: z.string().optional(),
    })
  ).optional().default([]),
  
  // Etapa 5: Publicação
  published: z.boolean().default(false),
  aiAssistantEnabled: z.boolean().default(false),
  aiAssistantId: z.string().optional()
    .refine(val => val === undefined || val === "" || val?.startsWith("asst_"), {
      message: "ID do assistente deve começar com 'asst_'",
    }),
});

export type AulaFormValues = z.infer<typeof aulaFormSchema>;

interface AulaStepWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula?: LearningLesson | null;
  moduleId?: string | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

const AulaStepWizard: React.FC<AulaStepWizardProps> = ({
  open,
  onOpenChange,
  aula,
  moduleId,
  onSuccess,
  onClose,
}) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [currentSaveStep, setCurrentSaveStep] = useState<string>("");
  const { 
    currentStep, 
    stepTitles, 
    totalSteps, 
    nextStep, 
    prevStep, 
    goToStep 
  } = useAulaSteps(0);
  
  // Inicializar formulário com valores padrão ou da aula existente
  const defaultValues: Partial<AulaFormValues> = {
    title: aula?.title || "",
    description: aula?.description || "",
    moduleId: aula?.module_id || moduleId || "",
    difficultyLevel: (aula?.difficulty_level as DifficultyLevel) || DifficultyLevel.BEGINNER,
    coverImageUrl: aula?.cover_image_url || "",
    published: aula?.published || false,
    aiAssistantEnabled: aula?.ai_assistant_enabled || false,
    aiAssistantId: aula?.ai_assistant_id || "",
    videos: [],
    resources: [],
  };

  const form = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues,
    mode: "onChange",
  });

  // Verificar configuração de storage ao inicializar
  useEffect(() => {
    const checkStorageConfig = async () => {
      try {
        console.log("Verificando configuração de buckets de armazenamento...");
        const result = await setupLearningStorageBuckets();
        console.log("Resultado da configuração de buckets:", result);
        setStorageReady(result.success);
        
        if (!result.success) {
          console.warn("Configuração de armazenamento incompleta:", result.message);
          toast.warning("Configuração de armazenamento incompleta. Alguns recursos podem não funcionar corretamente.");
        } else {
          console.log("Buckets configurados com sucesso:", result);
        }
      } catch (error) {
        console.error("Erro ao verificar configuração de armazenamento:", error);
        toast.error("Erro ao verificar armazenamento. Alguns recursos podem não funcionar corretamente.");
      }
    };
    
    checkStorageConfig();
  }, []);

  // Buscar módulos disponíveis ao carregar o componente
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const { data, error } = await supabase
          .from("learning_modules")
          .select("*")
          .order("title");

        if (error) {
          console.error("Erro ao buscar módulos:", error);
          toast.error("Falha ao carregar a lista de módulos.");
          return;
        }

        setModules(data || []);
      } catch (error) {
        console.error("Erro ao buscar módulos:", error);
        toast.error("Falha ao carregar a lista de módulos.");
      }
    };

    fetchModules();
  }, []);

  // Buscar os vídeos existentes, se for edição de aula
  useEffect(() => {
    const fetchVideos = async () => {
      if (!aula?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("learning_lesson_videos")
          .select("*")
          .eq("lesson_id", aula.id)
          .order("order_index");
          
        if (error) {
          console.error("Erro ao buscar vídeos da aula:", error);
          return;
        }
        
        if (data && data.length > 0) {
          const videosFormatted = data.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description || "",
            url: video.url,
            type: video.video_type || "youtube",
            fileName: video.video_file_name,
            filePath: video.video_file_path,
            fileSize: video.file_size_bytes,
            duration_seconds: video.duration_seconds,
            thumbnail_url: video.thumbnail_url,
            video_id: video.video_id
          }));
          
          form.setValue("videos", videosFormatted);
        }
      } catch (error) {
        console.error("Erro ao buscar vídeos:", error);
      }
    };
    
    const fetchResources = async () => {
      if (!aula?.id) return;
      
      try {
        const { data, error } = await supabase
          .from("learning_resources")
          .select("*")
          .eq("lesson_id", aula.id)
          .order("order_index");
          
        if (error) {
          console.error("Erro ao buscar recursos da aula:", error);
          return;
        }
        
        if (data && data.length > 0) {
          const resourcesFormatted = data.map(resource => ({
            id: resource.id,
            title: resource.name,
            description: resource.description || "",
            url: resource.file_url,
            type: resource.file_type || "document",
            fileName: resource.file_url.split('/').pop(),
            fileSize: resource.file_size_bytes
          }));
          
          form.setValue("resources", resourcesFormatted);
        }
      } catch (error) {
        console.error("Erro ao buscar recursos:", error);
      }
    };
    
    fetchVideos();
    fetchResources();
  }, [aula?.id, form]);

  // Resetar formulário quando a aula mudar
  useEffect(() => {
    form.reset(defaultValues);
  }, [aula, moduleId, form]);

  // Função para calcular tempo estimado com base nos vídeos
  const calculateTotalDuration = (videos: any[]): number => {
    if (!videos || videos.length === 0) return 0;
    
    let totalDuration = 0;
    for (const video of videos) {
      if (video.duration_seconds) {
        totalDuration += video.duration_seconds;
      }
    }
    
    // Converter segundos para minutos e arredondar para cima
    return Math.ceil(totalDuration / 60);
  };

  // Função para salvar vídeos com melhor tratamento de erros
  const saveVideos = async (lessonId: string, videos: any[]): Promise<{ success: boolean, message: string }> => {
    try {
      console.log("Salvando vídeos para a aula:", lessonId);
      setCurrentSaveStep("Processando vídeos...");
      console.log("Vídeos a salvar:", videos);
      
      if (!videos || videos.length === 0) {
        console.log("Nenhum vídeo para salvar.");
        return { success: true, message: "Nenhum vídeo para salvar" };
      }
      
      let videosSalvosComSucesso = 0;
      let errosEncontrados = 0;
      
      // Primeiro removemos todos os vídeos existentes desta aula
      if (aula?.id) {
        setCurrentSaveStep("Removendo vídeos existentes...");
        console.log("Removendo vídeos existentes...");
        const { error: deleteError } = await supabase
          .from('learning_lesson_videos')
          .delete()
          .eq('lesson_id', lessonId);
          
        if (deleteError) {
          console.error("Erro ao remover vídeos existentes:", deleteError);
          return { 
            success: false, 
            message: `Erro ao remover vídeos existentes: ${deleteError.message}`
          };
        }
      }
      
      // Para cada vídeo no formulário
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        setCurrentSaveStep(`Processando vídeo ${i + 1} de ${videos.length}...`);
        
        // Se o vídeo não tiver URL, pular
        if (!video.url) {
          console.log(`Vídeo ${i + 1} sem URL encontrado, pulando...`);
          continue;
        }
        
        try {
          const videoData = {
            lesson_id: lessonId,
            title: video.title || "Vídeo sem título",
            description: video.description || null,
            url: video.url,
            order_index: i,
            video_type: video.type || "youtube",
            video_file_path: video.filePath || null,
            video_file_name: video.fileName || null,
            file_size_bytes: video.fileSize || null,
            duration_seconds: video.duration_seconds || null,
            thumbnail_url: video.thumbnail_url || null,
            video_id: video.video_id
          };
          
          console.log(`Salvando vídeo ${i + 1}:`, videoData);
          
          // Sempre inserir novos registros após a limpeza
          const { error } = await supabase
            .from('learning_lesson_videos')
            .insert([videoData]);
            
          if (error) {
            console.error(`Erro ao criar vídeo ${i + 1}:`, error);
            errosEncontrados++;
            continue;
          }
          
          console.log(`Vídeo ${i + 1} criado com sucesso.`);
          videosSalvosComSucesso++;
        } catch (err) {
          console.error(`Erro ao processar vídeo ${i + 1}:`, err);
          errosEncontrados++;
        }
      }
      
      // Mostrar mensagem de resumo
      if (errosEncontrados > 0) {
        if (videosSalvosComSucesso > 0) {
          const mensagem = `Alguns vídeos não puderam ser salvos. Salvos: ${videosSalvosComSucesso}, Erros: ${errosEncontrados}`;
          console.warn(mensagem);
          return { success: true, message: mensagem };
        } else {
          console.error("Nenhum vídeo pôde ser salvo.");
          return { 
            success: false, 
            message: "Não foi possível salvar os vídeos. Verifique os logs para mais detalhes."
          };
        }
      } else if (videosSalvosComSucesso > 0) {
        console.log(`Todos os ${videosSalvosComSucesso} vídeos foram salvos com sucesso.`);
      }
      
      return { 
        success: true, 
        message: videosSalvosComSucesso > 0 ? 
          `${videosSalvosComSucesso} vídeo(s) salvo(s) com sucesso.` : 
          "Nenhum vídeo para salvar."
      };
    } catch (error: any) {
      console.error("Erro ao salvar vídeos:", error);
      return { 
        success: false, 
        message: `Erro ao salvar vídeos: ${error.message || "Erro desconhecido"}`
      };
    }
  };

  // Função para salvar recursos de materiais
  const saveResources = async (lessonId: string, resources: any[]): Promise<{ success: boolean, message: string }> => {
    try {
      setCurrentSaveStep("Processando materiais...");
      if (!resources || resources.length === 0) {
        return { success: true, message: "Nenhum material para salvar" };
      }
      
      console.log("Salvando materiais para a aula:", lessonId);
      console.log("Materiais a salvar:", resources);
      
      // Primeiro removemos todos os recursos existentes desta aula
      if (aula?.id) {
        setCurrentSaveStep("Removendo materiais existentes...");
        console.log("Removendo recursos existentes...");
        const { error: deleteError } = await supabase
          .from('learning_resources')
          .delete()
          .eq('lesson_id', lessonId);
          
        if (deleteError) {
          console.error("Erro ao remover recursos existentes:", deleteError);
          return { 
            success: false, 
            message: `Erro ao remover recursos existentes: ${deleteError.message}`
          };
        }
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        setCurrentSaveStep(`Processando material ${i + 1} de ${resources.length}...`);
        
        if (!resource.url) continue;
        
        const resourceData = {
          lesson_id: lessonId,
          name: resource.title || "Material sem nome",
          description: resource.description || null,
          file_url: resource.url,
          file_type: resource.type || "document",
          order_index: i,
          file_size_bytes: resource.fileSize || null
        };
        
        try {
          // Sempre inserir novos registros
          const { error } = await supabase
            .from('learning_resources')
            .insert([resourceData]);
            
          if (error) {
            console.error(`Erro ao salvar material ${i + 1}:`, error);
            errorCount++;
            continue;
          }
          
          successCount++;
        } catch (err) {
          console.error(`Erro ao salvar material ${i + 1}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        if (successCount > 0) {
          return { 
            success: true, 
            message: `Nem todos os materiais foram salvos. ${successCount} salvos, ${errorCount} com erro.`
          };
        } else {
          return { 
            success: false, 
            message: "Não foi possível salvar nenhum material."
          };
        }
      }
      
      return { 
        success: true, 
        message: successCount > 0 ? 
          `${successCount} material(is) salvo(s) com sucesso.` : 
          "Nenhum material para salvar."
      };
    } catch (error: any) {
      console.error("Erro ao salvar materiais:", error);
      return { 
        success: false, 
        message: `Erro ao salvar materiais: ${error.message || "Erro desconhecido"}`
      };
    }
  };

  // Submeter o formulário
  const onSubmit = async (values: AulaFormValues) => {
    try {
      setIsSaving(true);
      setCurrentSaveStep("Iniciando salvamento...");
      console.log("Iniciando processo de salvamento da aula");
      
      // Usar let para poder reatribuir o valor caso uma nova aula seja criada
      let lessonId = aula?.id;
      
      console.log("Dados do formulário:", values);
      
      // Calcular o tempo estimado com base nos vídeos
      const totalDurationMinutes = calculateTotalDuration(values.videos);
      console.log("Tempo total calculado dos vídeos (minutos):", totalDurationMinutes);
      
      // Preparar os dados da aula
      const lessonData = {
        title: values.title,
        description: values.description || null,
        module_id: values.moduleId,
        cover_image_url: values.coverImageUrl || null,
        estimated_time_minutes: totalDurationMinutes,
        ai_assistant_enabled: values.aiAssistantEnabled,
        ai_assistant_id: values.aiAssistantId || null,
        published: values.published,
        difficulty_level: values.difficultyLevel
      };
      
      console.log("Dados completos a serem salvos:", lessonData);
      setCurrentSaveStep("Salvando dados básicos da aula...");
      
      let salvamentoAulaSucesso = false;
      
      if (lessonId) {
        // Atualizar aula existente
        console.log(`Atualizando aula existente (ID: ${lessonId})...`);
        const { data, error } = await supabase
          .from("learning_lessons")
          .update(lessonData)
          .eq("id", lessonId)
          .select();
          
        if (error) {
          console.error("Erro ao atualizar aula:", error);
          toast.error(`Erro ao atualizar aula: ${error.message}`);
          setIsSaving(false);
          setCurrentSaveStep("");
          return;
        }
        
        console.log("Aula atualizada com sucesso!", data);
        salvamentoAulaSucesso = true;
      } else {
        // Criar nova aula
        console.log("Criando nova aula...");
        const { data, error } = await supabase
          .from("learning_lessons")
          .insert([lessonData])
          .select("*")
          .single();
          
        if (error) {
          console.error("Erro ao criar aula:", error);
          toast.error(`Erro ao criar aula: ${error.message}`);
          setIsSaving(false);
          setCurrentSaveStep("");
          return;
        }
        
        lessonId = data.id;
        console.log("Aula criada com sucesso:", data);
        salvamentoAulaSucesso = true;
      }
      
      if (salvamentoAulaSucesso && lessonId) {
        // Salvar vídeos e materiais
        const videoResult = await saveVideos(lessonId, values.videos || []);
        
        // Salvar recursos (materiais)
        const materiaisResult = await saveResources(lessonId, values.resources || []);
        
        if (videoResult.success && materiaisResult.success) {
          toast.success(aula ? "Aula atualizada com sucesso!" : "Aula criada com sucesso!");
        } else {
          toast.warning(
            `${aula ? "Aula atualizada" : "Aula criada"}, mas houve problemas: ${
              !videoResult.success ? videoResult.message : ""
            } ${!materiaisResult.success ? materiaisResult.message : ""}`
          );
        }
        
        if (onSuccess) onSuccess();
        form.reset(defaultValues);
        onOpenChange(false);
        if (onClose) onClose();
      }
      
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      toast.error(`Erro ao salvar aula: ${error.message || "Ocorreu um erro ao tentar salvar."}`);
    } finally {
      setIsSaving(false);
      setCurrentSaveStep("");
    }
  };

  // Função para renderizar a etapa atual
  const renderStep = () => {
    const formProps = {
      form,
      onNext: nextStep,
      onPrevious: prevStep,
      isSaving,
    };
    
    switch (currentStep) {
      case 0:
        return <EtapaInfoBasica {...formProps} modules={modules} />;
      case 1:
        return <EtapaMidia {...formProps} />;
      case 2:
        return <EtapaVideos {...formProps} />;
      case 3:
        return <EtapaMateriais {...formProps} />;
      case 4:
        return <EtapaPublicacao {...formProps} onSubmit={() => form.handleSubmit(onSubmit)()} />;
      default:
        return <EtapaInfoBasica {...formProps} modules={modules} />;
    }
  };

  // Fechar o wizard
  const handleCancel = () => {
    form.reset(defaultValues);
    onOpenChange(false);
    if (onClose) onClose();
  };

  // Exibir aviso se houver problemas de armazenamento
  const renderStorageWarning = () => {
    if (!storageReady) {
      return (
        <div className="bg-amber-50 border border-amber-300 p-3 rounded-md mt-2 mb-4">
          <p className="text-amber-800 text-sm">
            <strong>Atenção:</strong> A configuração de armazenamento pode não estar completa. 
            Alguns recursos como upload de imagens e vídeos podem não funcionar corretamente.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{aula ? "Editar Aula" : "Criar Nova Aula"}</DialogTitle>
          <WizardProgress 
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitles={stepTitles}
            onStepClick={goToStep}
          />
        </DialogHeader>
        
        {renderStorageWarning()}
        
        {isSaving && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-4 flex items-center space-x-3">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <p className="text-blue-700">
              {currentSaveStep || "Salvando aula..."}
            </p>
          </div>
        )}
        
        <form className="space-y-6">
          {renderStep()}
          
          {/* Navegação inferior - só aparece em algumas etapas */}
          {currentStep < 4 && (
            <div className="flex justify-between pt-4 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <div className="space-x-2">
                {currentStep > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={isSaving}
                  >
                    Voltar
                  </Button>
                )}
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={isSaving}
                >
                  {currentStep === totalSteps - 2 ? "Finalizar" : "Avançar"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AulaStepWizard;
