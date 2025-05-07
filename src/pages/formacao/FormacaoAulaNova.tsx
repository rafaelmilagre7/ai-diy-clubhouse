
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { aulaFormSchema } from "@/components/formacao/aulas/wizard/schemas/aulaFormSchema";
import { AulaFormValues } from "@/components/formacao/aulas/types";
import EtapaInfoBasica from "@/components/formacao/aulas/wizard/etapas/EtapaInfoBasica";
import { useAulaWizardStore } from "@/hooks/formacao/useAulaWizardStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const FormacaoAulaNova = () => {
  const navigate = useNavigate();
  const { formData, updateFormField, setModuleId, moduleId } = useAulaWizardStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Inicializar formulário com dados do store
  const form = useForm<AulaFormValues>({
    resolver: zodResolver(aulaFormSchema),
    defaultValues: formData as AulaFormValues,
    mode: "onChange"
  });
  
  // Atualizar store quando form values mudam
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Apenas atualizar campos que foram modificados
      if (value) {
        Object.keys(value).forEach((key) => {
          const fieldKey = key as keyof AulaFormValues;
          if (value[fieldKey] !== undefined) {
            updateFormField(fieldKey, value[fieldKey] as any);
          }
        });
      }
    });
    
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [form.watch, updateFormField]);
  
  // Manipulador para avançar para a próxima etapa
  const handleNext = async () => {
    const valid = await form.trigger(['title', 'description', 'difficulty', 'estimated_time', 'objective']);
    
    if (!valid) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    navigate("/formacao/aulas/nova/videos");
  };
  
  // Se um módulo foi especificado via query param, salvar no store
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const moduleIdParam = params.get('moduleId');
    
    if (moduleIdParam && moduleIdParam !== moduleId) {
      setModuleId(moduleIdParam);
    }
  }, [setModuleId, moduleId]);
  
  return (
    <div className="py-6 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Aula</h1>
          <p className="text-muted-foreground">
            Crie uma nova aula para o seu curso.
          </p>
        </div>
      </div>
      
      {/* Etapas do wizard */}
      <div className="mb-6">
        <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
          <li className="flex md:w-full items-center text-primary font-medium dark:text-primary after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full shrink-0">
              1
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Informações Básicas</span>
          </li>
          <li className="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
            <span className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full shrink-0 dark:bg-gray-700">
              2
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Vídeos</span>
          </li>
          <li className="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
            <span className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full shrink-0 dark:bg-gray-700">
              3
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Materiais</span>
          </li>
          <li className="flex items-center">
            <span className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full shrink-0 dark:bg-gray-700">
              4
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Revisar</span>
          </li>
        </ol>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
          <CardDescription>
            Preencha as informações básicas da aula.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <EtapaInfoBasica 
                form={form}
                onNext={handleNext}
                standalone={true}
              />
              
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={handleNext} className="gap-1">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoAulaNova;
