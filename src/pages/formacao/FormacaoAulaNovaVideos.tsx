
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { aulaFormSchema } from "@/components/formacao/aulas/wizard/schemas/aulaFormSchema";
import { AulaFormValues } from "@/components/formacao/aulas/wizard/AulaStepWizard";
import EtapaVideos from "@/components/formacao/aulas/wizard/etapas/EtapaVideos";
import { useAulaWizardStore } from "@/hooks/formacao/useAulaWizardStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PandaVideoStatusCheck } from "@/components/formacao/comum/PandaVideoStatusCheck";

const FormacaoAulaNovaVideos = () => {
  const navigate = useNavigate();
  const { formData, updateFormField } = useAulaWizardStore();
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
      Object.keys(value).forEach((key) => {
        if (value[key as keyof AulaFormValues] !== undefined) {
          updateFormField(
            key as keyof AulaFormValues,
            value[key as keyof AulaFormValues] as any
          );
        }
      });
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch, updateFormField]);
  
  // Manipuladores de navegação
  const handlePrevious = () => {
    navigate("/formacao/aulas/nova");
  };
  
  const handleNext = () => {
    navigate("/formacao/aulas/nova/materiais");
  };
  
  return (
    <div className="py-6 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Aula</h1>
          <p className="text-muted-foreground">
            Adicione vídeos à sua aula.
          </p>
        </div>
      </div>
      
      {/* Etapas do wizard */}
      <div className="mb-6">
        <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
          <li className="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-primary">
            <span className="flex items-center justify-center w-8 h-8 bg-primary-500/20 border border-primary-500 text-primary-700 rounded-full shrink-0">
              ✓
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Informações Básicas</span>
          </li>
          <li className="flex md:w-full items-center text-primary font-medium after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full shrink-0">
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

      {/* Verificador de status da API Panda */}
      <PandaVideoStatusCheck />

      <Card>
        <CardHeader>
          <CardTitle>Vídeos da Aula</CardTitle>
          <CardDescription>
            Adicione vídeos para enriquecer o conteúdo da aula.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <EtapaVideos 
                form={form}
                onNext={handleNext}
                onPrevious={handlePrevious}
                standalone={true}
              />
              
              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={handlePrevious} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                
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

export default FormacaoAulaNovaVideos;
