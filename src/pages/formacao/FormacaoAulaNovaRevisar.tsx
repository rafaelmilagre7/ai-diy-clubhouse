
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { aulaFormSchema } from "@/components/formacao/aulas/wizard/schemas/aulaFormSchema";
import { AulaFormValues } from "@/components/formacao/aulas/types";
import EtapaPublicacao from "@/components/formacao/aulas/wizard/etapas/EtapaPublicacao";
import { useAulaWizardStore } from "@/hooks/formacao/useAulaWizardStore";
import { useCreateAula } from "@/hooks/formacao/useCreateAula";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const FormacaoAulaNovaRevisar = () => {
  const navigate = useNavigate();
  const { formData, updateFormField, moduleId, reset } = useAulaWizardStore();
  const { mutate, isLoading } = useCreateAula();
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
    navigate("/formacao/aulas/nova/materiais");
  };
  
  const handleSubmit = async (formValues: AulaFormValues) => {
    try {
      // Verificar se temos pelo menos os campos obrigatórios
      if (!formValues.title || !formValues.difficulty) {
        toast.error("Campos obrigatórios não preenchidos");
        navigate("/formacao/aulas/nova");
        return;
      }
      
      // Adicionar moduleId se foi especificado
      const aulaData = {
        ...formValues,
        module_id: moduleId
      };
      
      toast.message("Processando...", {
        description: "Criando nova aula com todos os recursos."
      });
      
      // Criar aula via hook
      await mutate(aulaData, {
        onSuccess: (data) => {
          toast.success("Aula criada com sucesso!");
          
          // Resetar estado do wizard
          reset();
          
          // Redirecionar para página de detalhes da aula
          navigate(`/formacao/aulas/${data.id}`);
        },
        onError: (error) => {
          console.error("Erro ao criar aula:", error);
          toast.error("Erro ao criar aula", {
            description: "Por favor, verifique os campos e tente novamente."
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
  
  return (
    <div className="py-6 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nova Aula</h1>
          <p className="text-muted-foreground">
            Revise e publique sua aula.
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
          <li className="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-primary">
            <span className="flex items-center justify-center w-8 h-8 bg-primary-500/20 border border-primary-500 text-primary-700 rounded-full shrink-0">
              ✓
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Vídeos</span>
          </li>
          <li className="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-primary after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-primary">
            <span className="flex items-center justify-center w-8 h-8 bg-primary-500/20 border border-primary-500 text-primary-700 rounded-full shrink-0">
              ✓
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Materiais</span>
          </li>
          <li className="flex items-center text-primary font-medium">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full shrink-0">
              4
            </span>
            <span className={`hidden sm:inline-flex sm:ml-2 ${isMobile ? "text-xs" : ""}`}>Revisar</span>
          </li>
        </ol>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revisar e Publicar</CardTitle>
          <CardDescription>
            Revise todas as informações da aula antes de salvar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <EtapaPublicacao 
                form={form}
                onComplete={handleSubmit}
                onPrevious={handlePrevious}
                isSaving={isLoading}
                standalone={true}
              />
              
              <div className="flex justify-between pt-4 border-t">
                <Button type="button" variant="outline" onClick={handlePrevious} className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
                
                <Button 
                  type="button" 
                  onClick={() => handleSubmit(form.getValues())} 
                  className="gap-1"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Salvando..." : "Salvar Aula"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormacaoAulaNovaRevisar;
