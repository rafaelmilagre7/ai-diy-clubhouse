import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToolForm } from "./ToolForm";
import { useFormState } from "@/hooks/useFormState";
import { useFormMutation } from "@/hooks/useFormData";
import { toolFormSchema, type ToolFormValues } from "@/utils/formSchemas";
import { supabase } from "@/integrations/supabase/client";

interface ToolFormWrapperProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function ToolFormWrapper({ initialData, onSuccess }: ToolFormWrapperProps) {
  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      category: "",
      url: "",
      image_url: "",
      benefits: [],
      pricing_info: "",
    },
  });

  const { isSubmitting, handleSubmit } = useFormState({
    debounceMs: 500,
    onSuccess,
  });

  const toolMutation = useFormMutation(
    async (data: ToolFormValues) => {
      if (initialData?.id) {
        const { error } = await supabase
          .from('tools')
          .update(data)
          .eq('id', initialData.id);
        if (error) throw error;
        return data;
      } else {
        const { data: newTool, error } = await supabase
          .from('tools')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return newTool;
      }
    },
    {
      invalidateQueries: [['tools'], ['tool-categories']],
    }
  );

  const onSubmit = async (data: ToolFormValues): Promise<boolean> => {
    const result = await handleSubmit(async () => {
      await toolMutation.mutateAsync(data);
    }, initialData ? "Ferramenta atualizada!" : "Ferramenta criada!");
    
    return result !== null;
  };

  return (
    <ToolForm
      initialData={initialData}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}