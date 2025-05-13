
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const goalsSchema = z.object({
  current_occupation: z.string().min(2, {
    message: "Por favor, informe sua ocupação atual"
  }),
  learning_goals: z.array(z.string()).min(1, {
    message: "Selecione pelo menos um objetivo de aprendizado"
  }),
  custom_goal: z.string().optional(),
  interests: z.array(z.string()).min(1, {
    message: "Selecione pelo menos uma área de interesse"
  }),
  expectations: z.string().min(10, {
    message: "Por favor, descreva suas expectativas em pelo menos 10 caracteres"
  }).max(500, {
    message: "Texto muito longo, por favor limite a 500 caracteres"
  }),
});

const FormacaoGoals = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading, refreshProgress } = useProgress();
  
  const { saveStepData } = useStepPersistenceCore({
    currentStepIndex: 2,
    setCurrentStepIndex: () => {}, // Não usado neste componente
    navigate,
    onboardingType: 'formacao',
  });
  
  const form = useForm<z.infer<typeof goalsSchema>>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      current_occupation: "",
      learning_goals: [],
      custom_goal: "",
      interests: [],
      expectations: ""
    }
  });
  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await refreshProgress();
        
        if (progress?.formation_data) {
          // Preencher o formulário com dados existentes
          form.reset({
            current_occupation: progress.formation_data.current_occupation || "",
            learning_goals: progress.formation_data.learning_goals || [],
            custom_goal: progress.formation_data.custom_goal || "",
            interests: progress.formation_data.interests || [],
            expectations: progress.formation_data.expectations || ""
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    
    loadInitialData();
  }, []);

  const onSubmit = async (data: z.infer<typeof goalsSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Se o usuário adicionou um objetivo personalizado, adicionar aos objetivos
      let finalLearningGoals = [...data.learning_goals];
      if (data.custom_goal && data.custom_goal.trim() !== "") {
        finalLearningGoals.push(data.custom_goal.trim());
      }
      
      await saveStepData("formation_goals", {
        formation_data: {
          ...progress?.formation_data,
          current_occupation: data.current_occupation,
          learning_goals: finalLearningGoals,
          interests: data.interests,
          expectations: data.expectations,
        },
        onboarding_type: 'formacao'
      });
      
      navigate("/onboarding/formacao/preferences");
      
    } catch (error) {
      console.error("Erro ao salvar objetivos:", error);
      toast.error("Erro ao salvar seus objetivos. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={3} 
        title="Objetivos de Aprendizado" 
        backUrl="/onboarding/formacao/ai-experience"
        isFormacao={true}
      >
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-gray-400">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }
  
  const learningGoals = [
    { id: "career-change", label: "Mudar de carreira para a área de IA" },
    { id: "skill-improvement", label: "Aprimorar habilidades atuais com IA" },
    { id: "project-development", label: "Desenvolver projetos específicos com IA" },
    { id: "business-application", label: "Aplicar IA em meu negócio" },
    { id: "academic", label: "Aprofundar conhecimento acadêmico" },
    { id: "certification", label: "Obter certificação profissional" }
  ];
  
  const interestAreas = [
    { id: "nlp", label: "Processamento de Linguagem Natural (NLP)" },
    { id: "computer-vision", label: "Visão Computacional" },
    { id: "chatbots", label: "Chatbots e Assistentes Virtuais" },
    { id: "data-analysis", label: "Análise de Dados e Predição" },
    { id: "automation", label: "Automação de Processos" },
    { id: "generative-ai", label: "IA Generativa (imagens, texto, áudio)" },
    { id: "recommendation", label: "Sistemas de Recomendação" },
    { id: "marketing", label: "IA para Marketing" },
    { id: "business-intelligence", label: "Business Intelligence" }
  ];

  return (
    <OnboardingLayout 
      currentStep={3} 
      title="Objetivos de Aprendizado" 
      backUrl="/onboarding/formacao/ai-experience"
      isFormacao={true}
    >
      <div className="text-gray-300 mb-6">
        <p>Vamos entender seus objetivos e interesses para personalizar sua jornada de aprendizado.</p>
        <p>Isso nos ajudará a recomendar conteúdos e trilhas mais relevantes para você.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="current_occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Qual é sua ocupação atual?</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Desenvolvedor de software, Gerente de marketing, Estudante..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="learning_goals"
            render={() => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base">Quais são seus objetivos ao aprender IA?</FormLabel>
                <FormDescription>
                  Selecione todos que se aplicam ao seu caso
                </FormDescription>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningGoals.map((goal) => (
                    <FormField
                      key={goal.id}
                      control={form.control}
                      name="learning_goals"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(goal.id)}
                              onCheckedChange={(checked) => {
                                const current = [...field.value || []];
                                if (checked) {
                                  field.onChange([...current, goal.id]);
                                } else {
                                  field.onChange(current.filter(value => value !== goal.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {goal.label}
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
            name="custom_goal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Algum outro objetivo específico?</FormLabel>
                <FormDescription>
                  Se tiver um objetivo que não está listado acima, você pode adicionar aqui
                </FormDescription>
                <FormControl>
                  <Input placeholder="Objetivo personalizado..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="interests"
            render={() => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base">Quais áreas de IA mais te interessam?</FormLabel>
                <FormDescription>
                  Selecione todas que deseja aprender
                </FormDescription>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {interestAreas.map((area) => (
                    <FormField
                      key={area.id}
                      control={form.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(area.id)}
                              onCheckedChange={(checked) => {
                                const current = [...field.value || []];
                                if (checked) {
                                  field.onChange([...current, area.id]);
                                } else {
                                  field.onChange(current.filter(value => value !== area.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {area.label}
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
            name="expectations"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Quais são suas expectativas para este curso?</FormLabel>
                <FormDescription>
                  Descreva o que você espera conquistar ao final da formação
                </FormDescription>
                <FormControl>
                  <Textarea 
                    placeholder="Após concluir a formação, eu espero ser capaz de..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-gray-400 text-right mt-1">
                  {field.value?.length || 0}/500 caracteres
                </div>
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

export default FormacaoGoals;
