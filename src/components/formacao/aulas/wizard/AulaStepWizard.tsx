
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

// Schema completo para validação
const aulaFormSchema = z.object({
  // Etapa 1: Informações Básicas
  title: z.string().min(2, { message: "O título deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  moduleId: z.string().uuid({ message: "Por favor, selecione um módulo válido." }),
  orderIndex: z.number().optional().default(0),
  
  // Etapa 2: Imagem e Mídia
  coverImageUrl: z.string().optional(),
  
  // Etapa 3: Vídeos
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
    })
  ).optional().default([]),
  
  // Etapa 4: Materiais
  resources: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      type: z.string().optional(),
      fileName: z.string().optional(),
    })
  ).optional().default([]),
  
  // Etapa 5: Publicação
  published: z.boolean().default(false),
  aiAssistantEnabled: z.boolean().default(false),
  aiAssistantPrompt: z.string().optional(),
});

export type AulaFormValues = z.infer<typeof aulaFormSchema>;

interface AulaStepWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aula?: LearningLesson | null;
  moduleId?: string | null;
  onSuccess?: () => void;
}

const AulaStepWizard: React.FC<AulaStepWizardProps> = ({
  open,
  onOpenChange,
  aula,
  moduleId,
  onSuccess,
}) => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
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
    orderIndex: aula?.order_index || 0,
    coverImageUrl: aula?.cover_image_url || "",
    published: aula?.published || false,
    aiAssistantEnabled: aula?.ai_assistant_enabled || false,
    aiAssistantPrompt: aula?.ai_assistant_prompt || "",
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
        const result = await setupLearningStorageBuckets();
        setStorageReady(result.success);
        
        if (!result.success) {
          console.warn("Configuração de armazenamento incompleta:", result.message);
          toast.warning("Configuração de armazenamento incompleta. Alguns recursos podem não funcionar corretamente.");
        }
      } catch (error) {
        console.error("Erro ao verificar configuração de armazenamento:", error);
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
  const saveVideos = async (lessonId: string, videos: any[]) => {
    try {
      console.log("Salvando vídeos para a aula:", lessonId);
      console.log("Vídeos a salvar:", videos);
      
      if (!videos || videos.length === 0) {
        console.log("Nenhum vídeo para salvar.");
        return;
      }
      
      let videosSalvosComSucesso = 0;
      let errosEncontrados = 0;
      
      // Para cada vídeo no formulário
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        
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
            thumbnail_url: video.thumbnail_url || null
          };
          
          console.log(`Salvando vídeo ${i + 1}:`, videoData);
          
          if (video.id) {
            // Atualizar vídeo existente
            const { error } = await supabase
              .from('learning_lesson_videos')
              .update(videoData)
              .eq('id', video.id);
              
            if (error) {
              console.error(`Erro ao atualizar vídeo ${i + 1}:`, error);
              errosEncontrados++;
              continue; // Continuar com o próximo vídeo mesmo se houver erro
            }
            
            console.log(`Vídeo ${i + 1} atualizado com sucesso.`);
            videosSalvosComSucesso++;
          } else {
            // Criar novo vídeo
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
          }
        } catch (err) {
          console.error(`Erro ao processar vídeo ${i + 1}:`, err);
          errosEncontrados++;
        }
      }
      
      // Mostrar mensagem de resumo
      if (errosEncontrados > 0) {
        if (videosSalvosComSucesso > 0) {
          console.warn(`Alguns vídeos não puderam ser salvos. Salvos: ${videosSalvosComSucesso}, Erros: ${errosEncontrados}`);
          toast.warning(`Nem todos os vídeos puderam ser salvos. ${videosSalvosComSucesso} salvos, ${errosEncontrados} com erro.`);
        } else {
          console.error("Nenhum vídeo pôde ser salvo.");
          toast.error("Não foi possível salvar os vídeos. Verifique os logs para mais detalhes.");
        }
      } else if (videosSalvosComSucesso > 0) {
        console.log(`Todos os ${videosSalvosComSucesso} vídeos foram salvos com sucesso.`);
      }
      
      return videosSalvosComSucesso > 0; // Retorna true se pelo menos um vídeo foi salvo
    } catch (error) {
      console.error("Erro ao salvar vídeos:", error);
      toast.error("Ocorreu um erro ao salvar os vídeos.");
      return false;
    }
  };

  // Função para salvar recursos de materiais
  const saveResources = async (lessonId: string, resources: any[]) => {
    try {
      if (!resources || resources.length === 0) {
        return true;
      }
      
      console.log("Salvando materiais para a aula:", lessonId);
      console.log("Materiais a salvar:", resources);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];
        
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
          if (resource.id) {
            // Atualizar recurso existente
            const { error } = await supabase
              .from('learning_resources')
              .update(resourceData)
              .eq('id', resource.id);
              
            if (error) throw error;
            successCount++;
          } else {
            // Criar novo recurso
            const { error } = await supabase
              .from('learning_resources')
              .insert([resourceData]);
              
            if (error) throw error;
            successCount++;
          }
        } catch (err) {
          console.error(`Erro ao salvar material ${i + 1}:`, err);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        toast.warning(`Nem todos os materiais foram salvos. ${successCount} salvos, ${errorCount} com erro.`);
      }
      
      return successCount > 0;
    } catch (error) {
      console.error("Erro ao salvar materiais:", error);
      toast.error("Ocorreu um erro ao salvar os materiais.");
      return false;
    }
  };

  // Submeter o formulário
  const onSubmit = async (values: AulaFormValues) => {
    try {
      setIsSaving(true);
      
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
        ai_assistant_prompt: values.aiAssistantPrompt || null,
        published: values.published,
        order_index: values.orderIndex || 0
      };
      
      console.log("Dados completos a serem salvos:", lessonData);
      
      let salvamentoAulaSucesso = false;
      
      if (lessonId) {
        // Atualizar aula existente
        const { error } = await supabase
          .from("learning_lessons")
          .update(lessonData)
          .eq("id", lessonId);
          
        if (error) throw error;
        
        console.log("Aula atualizada com sucesso!");
        salvamentoAulaSucesso = true;
      } else {
        // Criar nova aula
        const { data, error } = await supabase
          .from("learning_lessons")
          .insert([lessonData])
          .select("*")
          .single();
          
        if (error) throw error;
        
        lessonId = data.id;
        console.log("Aula criada com sucesso:", data);
        salvamentoAulaSucesso = true;
      }
      
      if (salvamentoAulaSucesso && lessonId) {
        // Salvar vídeos e materiais
        const videosSalvos = await saveVideos(lessonId, values.videos || []);
        
        // Salvar recursos (materiais)
        const materiaisSalvos = await saveResources(lessonId, values.resources || []);
        
        if (videosSalvos) {
          toast.success(aula ? "Aula atualizada com sucesso!" : "Aula criada com sucesso!");
        } else {
          toast.warning(aula 
            ? "Aula atualizada, mas houve problema com os vídeos" 
            : "Aula criada, mas houve problema com os vídeos");
        }
      }
      
      if (onSuccess) onSuccess();
      form.reset(defaultValues);
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Erro ao salvar aula:", error);
      toast.error(`Erro ao salvar aula: ${error.message || "Ocorreu um erro ao tentar salvar."}`);
    } finally {
      setIsSaving(false);
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
        
        <form className="space-y-6">
          {renderStep()}
          
          {/* Navegação inferior - só aparece em algumas etapas */}
          {currentStep < 4 && (
            <div className="flex justify-between pt-4 border-t">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <div className="space-x-2">
                {currentStep > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={prevStep}
                  >
                    Voltar
                  </Button>
                )}
                <Button 
                  type="button" 
                  onClick={nextStep}
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
