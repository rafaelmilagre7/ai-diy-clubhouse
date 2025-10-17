
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SolutionFormValues } from "./solutionFormSchema";
import { UseFormReturn } from "react-hook-form";
import CategorySelector from "@/components/admin/solution/editor/CategorySelector";
import ImageUploadField from "./ImageUploadField";

interface BasicInfoLeftColumnProps {
  form: UseFormReturn<SolutionFormValues>;
}

const BasicInfoLeftColumn = ({ form }: BasicInfoLeftColumnProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da Solução</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Assistente de Atendimento ao Cliente com IA" {...field} />
            </FormControl>
            <FormDescription>
              Nome da solução que será exibido para os usuários.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva brevemente o objetivo desta solução e seus benefícios..." 
                className="min-h-chart-sm"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Uma descrição clara e concisa que explique o que a solução faz.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <ImageUploadField 
        control={form.control}
        name="thumbnail_url"
        label="Imagem de Capa"
      />
    </div>
  );
};

export default BasicInfoLeftColumn;
