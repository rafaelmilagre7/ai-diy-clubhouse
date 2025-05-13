
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useStepPersistenceCore } from "@/hooks/onboarding/useStepPersistenceCore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

const preferencesSchema = z.object({
  preferred_learning_style: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um estilo de aprendizado"
  }),
  availability_hours_per_week: z.number().min(1).max(40),
  preferred_content_format: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um formato de conteúdo"
  }),
  preferred_study_time: z.string().min(1, {
    message: "Selecione sua preferência de horário para estudos"
  })
});

const FormacaoPreferences = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading, refreshProgress } = useProgress();
  
  const { saveStepData } = useStepPersistenceCore({
    currentStepIndex: 3,
    setCurrentStepIndex: () => {},
    navigate,
    onboardingType: 'formacao',
  });
  
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferred_learning_style: [],
      availability_hours_per_week: 5,
      preferred_content_format: [],
      preferred_study_time: ""
    }
  });
  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await refreshProgress();
        
        if (progress?.formation_data) {
          // Preencher o formulário com dados existentes se disponíveis
          form.reset({
            preferred_learning_style: progress.formation_data.preferred_learning_style || [],
            availability_hours_per_week: progress.formation_data.availability_hours_per_week || 5,
            preferred_content_format: progress.formation_data.preferred_content_format || [],
            preferred_study_time: progress.formation_data.preferred_study_time || ""
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    
    loadInitialData();
  }, []);

  const onSubmit = async (data: z.infer<typeof preferencesSchema>) => {
    try {
      setIsSubmitting(true);
      
      await saveStepData("learning_preferences", {
        formation_data: {
          ...progress?.formation_data,
          ...data
        },
        onboarding_type: 'formacao'
      });
      
      navigate("/onboarding/formacao/review");
      
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);
      toast.error("Erro ao salvar suas preferências. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={4} 
        title="Preferências de Aprendizado" 
        backUrl="/onboarding/formacao/goals"
        isFormacao={true}
      >
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  const learningStyles = [
    { id: "visual", label: "Visual - Aprendo melhor vendo" },
    { id: "auditory", label: "Auditivo - Aprendo melhor ouvindo" },
    { id: "reading", label: "Leitura - Aprendo melhor lendo" },
    { id: "practice", label: "Prática - Aprendo melhor fazendo" }
  ];
  
  const contentFormats = [
    { id: "video", label: "Vídeos" },
    { id: "text", label: "Textos e artigos" },
    { id: "interactive", label: "Exercícios interativos" },
    { id: "projects", label: "Projetos práticos" },
    { id: "community", label: "Discussões em comunidade" }
  ];

  return (
    <OnboardingLayout 
      currentStep={4} 
      title="Preferências de Aprendizado" 
      backUrl="/onboarding/formacao/goals"
      isFormacao={true}
    >
      <div className="text-gray-300 mb-6">
        <p>Personalize sua experiência de aprendizado informando suas preferências.</p>
        <p>Isso nos ajudará a recomendar o melhor formato de estudo para você.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="preferred_learning_style"
            render={() => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base">Como você prefere aprender?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningStyles.map((style) => (
                    <FormField
                      key={style.id}
                      control={form.control}
                      name="preferred_learning_style"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(style.id)}
                              onCheckedChange={(checked) => {
                                const current = [...field.value || []];
                                if (checked) {
                                  field.onChange([...current, style.id]);
                                } else {
                                  field.onChange(current.filter(value => value !== style.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {style.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="availability_hours_per_week"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base">Quantas horas por semana você pode dedicar aos estudos?</FormLabel>
                <div className="space-y-2">
                  <Slider 
                    min={1} 
                    max={40} 
                    step={1}
                    value={[field.value]} 
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm">{field.value} horas</span>
                    {field.value < 5 && (
                      <span className="text-sm text-amber-400">Recomendamos pelo menos 5 horas por semana</span>
                    )}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="preferred_content_format"
            render={() => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base">Quais formatos de conteúdo você prefere?</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {contentFormats.map((format) => (
                    <FormField
                      key={format.id}
                      control={form.control}
                      name="preferred_content_format"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(format.id)}
                              onCheckedChange={(checked) => {
                                const current = [...field.value || []];
                                if (checked) {
                                  field.onChange([...current, format.id]);
                                } else {
                                  field.onChange(current.filter(value => value !== format.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {format.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="preferred_study_time"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-base">Em qual horário você costuma estudar?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Manhã (6h - 12h)</SelectItem>
                    <SelectItem value="afternoon">Tarde (12h - 18h)</SelectItem>
                    <SelectItem value="evening">Noite (18h - 22h)</SelectItem>
                    <SelectItem value="late_night">Madrugada (22h - 6h)</SelectItem>
                    <SelectItem value="weekends">Apenas finais de semana</SelectItem>
                    <SelectItem value="variable">Horário variável</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 px-8"
            >
              {isSubmitting ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </Form>
    </OnboardingLayout>
  );
};

export default FormacaoPreferences;
