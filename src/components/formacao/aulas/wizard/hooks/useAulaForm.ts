
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { aulaFormSchema, AulaFormValues } from "../schemas/aulaFormSchema";
import { fetchLessonVideos } from "../services/videoService";
import { fetchLessonResources } from "../services/resourceService";
import { LearningLesson, LearningModule } from "@/lib/supabase/types";
import { useLessonTagsForLesson } from "@/hooks/useLessonTags";

export const useAulaForm = (
  aula?: LearningLesson | null,
  moduleId?: string | null,
  onSuccess?: () => void
) => {
  const [isSaving, setIsSaving] = useState(false);
  const [currentSaveStep, setCurrentSaveStep] = useState<string>("");
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Hook para buscar tags existentes da aula
  const { data: existingTags } = useLessonTagsForLesson(aula?.id || '');

  // Inicializar formulário com valores padrão ou da aula existente
  const defaultValues: Partial<AulaFormValues> = {
    title: aula?.title || "",
    description: aula?.description || "",
    moduleId: aula?.module_id || moduleId || "",
    difficultyLevel: (aula?.difficulty_level as any) || "beginner",
    coverImageUrl: aula?.cover_image_url || "",
    published: aula?.published || false,
    aiAssistantEnabled: aula?.ai_assistant_enabled || false,
    aiAssistantId: aula?.ai_assistant_id || "",
    tags: [],
    videos: [],
    resources: [],
  };

  // Inicializar o formulário
  const form = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues,
    mode: "onChange",
  });

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
      } finally {
        setInitialLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Buscar os vídeos e recursos existentes, se for edição de aula
  useEffect(() => {
    const fetchData = async () => {
      if (!aula?.id) {
        setInitialLoading(false);
        return;
      }
      
      try {
        // Buscar vídeos
        const videos = await fetchLessonVideos(aula.id);
        form.setValue("videos", videos);
        
        // Buscar recursos
        const resources = await fetchLessonResources(aula.id);
        form.setValue("resources", resources);
        
        // Definir tags existentes
        if (existingTags && existingTags.length > 0) {
          const tagIds = existingTags.map(tag => tag.lesson_tags.id);
          form.setValue("tags", tagIds);
        }
      } catch (error) {
        console.error("Erro ao buscar dados da aula:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, [aula?.id, form, existingTags]);

  // Resetar formulário quando a aula mudar
  useEffect(() => {
    form.reset(defaultValues);
  }, [aula, moduleId, form]);

  return {
    form,
    isSaving,
    setIsSaving,
    currentSaveStep,
    setCurrentSaveStep,
    modules,
    initialLoading,
    defaultValues,
  };
};
