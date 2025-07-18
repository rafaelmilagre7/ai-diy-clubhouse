
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, Save } from "lucide-react";
import { slugify } from "@/utils/slugify";
import React, { useEffect } from "react";
import { SolutionFormValues, solutionFormSchema } from "./solutionFormSchema";
import BasicInfoLeftColumn from "./BasicInfoLeftColumn";
import BasicInfoRightColumn from "./BasicInfoRightColumn";

interface BasicInfoFormProps {
  defaultValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const BasicInfoForm = ({
  defaultValues,
  onSubmit,
  saving,
}: BasicInfoFormProps) => {
  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(solutionFormSchema),
    defaultValues,
  });

  const title = form.watch("title");
  const difficulty = form.watch("difficulty");
  
  // Auto-gerar slug quando o título mudar
  useEffect(() => {
    if (title) {
      // Gerar um slug único com timestamp
      const newSlug = slugify(title, true);
      
      // Atualizar o campo de slug com o novo valor
      form.setValue("slug", newSlug, { shouldValidate: true });
    }
  }, [title, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BasicInfoLeftColumn form={form} />
          <BasicInfoRightColumn form={form} difficulty={difficulty} />
        </div>

        <Button 
          type="submit" 
          disabled={saving} 
          className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
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
