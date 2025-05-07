
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { aulaFormSchema } from "./schemas/aulaFormSchema";
import EtapaInfoBasica from "./etapas/EtapaInfoBasica";
import EtapaVideos from "./etapas/EtapaVideos";
import EtapaMateriais from "./etapas/EtapaMateriais";
import EtapaPublicacao from "./etapas/EtapaPublicacao";
import { toast } from "sonner";
import { useCreateAula } from "@/hooks/formacao/useCreateAula";

// Interfaces para tipos de dados
export interface AulaVideo {
  id?: string;
  title: string;
  description?: string;
  url: string;
  type: "youtube" | "panda";
  video_id?: string; // ID do vídeo no Panda Video
  thumbnail_url?: string; // URL da miniatura do vídeo
  duration_seconds?: number; // Duração do vídeo em segundos
}

export interface AulaMaterial {
  id?: string;
  title: string;
  description?: string;
  url: string;
  type: string; // "pdf", "doc", "image", etc.
  file_size?: number;
}

export interface AulaFormValues {
  title: string;
  description?: string;
  objective?: string;
  difficulty: string;
  estimated_time?: string;
  thumbnail_url?: string;
  videos: AulaVideo[];
  materials?: AulaMaterial[];
  is_published?: boolean;
  is_featured?: boolean;
}

interface AulaStepWizardProps {
  onComplete?: (data: AulaFormValues) => void;
  onCancel?: () => void;
  defaultValues?: Partial<AulaFormValues>;
}

const defaultFormValues: AulaFormValues = {
  title: "",
  description: "",
  objective: "",
  difficulty: "medium",
  estimated_time: "30",
  thumbnail_url: "",
  videos: [],
  materials: [],
  is_published: false,
  is_featured: false
};

const AulaStepWizard: React.FC<AulaStepWizardProps> = ({ 
  onComplete,
  onCancel,
  defaultValues
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { mutate, isLoading } = useCreateAula();

  const form = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues: { ...defaultFormValues, ...defaultValues },
    mode: "onChange"
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleComplete = async (values: AulaFormValues) => {
    try {
      toast.message("Processando...", {
        description: "Criando nova aula com todos os recursos."
      });
      
      // Simular chamada de API através do hook useCreateAula
      await mutate(values, {
        onSuccess: (data) => {
          toast.success("Aula criada com sucesso!");
          if (onComplete) onComplete(data);
        },
        onError: (error) => {
          console.error("Erro ao criar aula:", error);
          toast.error("Erro ao criar aula", {
            description: "Por favor, tente novamente."
          });
        }
      });
    } catch (error) {
      console.error("Erro no processo de criação:", error);
      toast.error("Erro ao processar", {
        description: "Ocorreu um erro interno. Tente novamente."
      });
    }
  };

  const steps = [
    <EtapaInfoBasica 
      key="info" 
      form={form} 
      onNext={handleNext} 
    />,
    <EtapaVideos 
      key="videos" 
      form={form} 
      onNext={handleNext} 
      onPrevious={handlePrevious}
      isSaving={isLoading}
    />,
    <EtapaMateriais 
      key="materiais" 
      form={form} 
      onNext={handleNext} 
      onPrevious={handlePrevious}
    />,
    <EtapaPublicacao 
      key="publicacao" 
      form={form} 
      onPrevious={handlePrevious} 
      onComplete={handleComplete}
      isSaving={isLoading}
    />
  ];

  return (
    <Form {...form}>
      <form className="space-y-6">
        {steps[currentStep]}
      </form>
    </Form>
  );
};

export default AulaStepWizard;
