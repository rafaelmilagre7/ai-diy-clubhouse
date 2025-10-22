
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { slugify } from "@/utils/slugify";
import React, { useEffect } from "react";
import { SolutionFormValues, solutionFormSchema } from "./form/solutionFormSchema";
import BasicInfoLeftColumn from "./form/BasicInfoLeftColumn";
import BasicInfoRightColumn from "./form/BasicInfoRightColumn";

interface BasicInfoFormProps {
  defaultValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  onValuesChange?: (values: SolutionFormValues) => void;
}

const BasicInfoForm = ({
  defaultValues,
  onSubmit,
  saving,
  onValuesChange,
}: BasicInfoFormProps) => {
  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionFormSchema),
    defaultValues,
  });

  const title = form.watch("title");
  const difficulty = form.watch("difficulty");

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  // Notificar mudanças nos valores do formulário
  useEffect(() => {
    const subscription = form.watch((values) => {
      if (onValuesChange) {
        onValuesChange(values as SolutionFormValues);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, onValuesChange]);
  
  // Auto-gerar slug quando o título mudar
  useEffect(() => {
    if (title) {
      // Gerar um slug único com timestamp
      const newSlug = slugify(title, true);
      
      // Truncar o slug se ele ficar muito longo
      const truncatedSlug = newSlug.length > 60 ? newSlug.substring(0, 60) : newSlug;
      
      // Atualizar o campo de slug com o novo valor
      form.setValue("slug", truncatedSlug, { shouldValidate: true });
    }
  }, [title, form]);

  const handleFormSubmit = async (values: SolutionFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("❌ BasicInfoForm: Erro ao submeter formulário:", error);
      throw error;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BasicInfoLeftColumn form={form} />
          <BasicInfoRightColumn form={form} difficulty={difficulty} />
        </div>

        <Button 
          type="submit" 
          disabled={saving} 
          variant="aurora-primary"
          className="w-full"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Informações Básicas
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BasicInfoForm;
