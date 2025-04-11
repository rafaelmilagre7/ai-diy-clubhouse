
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { slugify } from "@/utils/slugify";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  category: z.enum(["revenue", "operational", "strategy"], {
    required_error: "Por favor, selecione uma categoria.",
  }),
  difficulty: z.enum(["easy", "medium", "advanced"], {
    required_error: "Por favor, selecione uma dificuldade.",
  }),
  estimated_time: z.coerce.number().min(1, {
    message: "O tempo estimado deve ser de pelo menos 1 minuto.",
  }),
  success_rate: z.coerce.number().min(0).max(100, {
    message: "A taxa de sucesso deve estar entre 0% e 100%.",
  }),
  thumbnail_url: z.string().url({
    message: "Por favor, insira uma URL de imagem válida.",
  }).optional().or(z.literal("")),
  published: z.boolean().default(false),
  slug: z.string().min(3, {
    message: "O slug deve ter pelo menos 3 caracteres.",
  }).optional(),
  tags: z.string().optional(),
});

export type SolutionFormValues = z.infer<typeof formSchema>;

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
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const title = form.watch("title");
  
  // Auto-gerar slug quando o título mudar e o slug não tiver sido modificado manualmente
  const handleTitleChange = (value: string) => {
    form.setValue("title", value);
    if (!form.getValues("slug") || form.getValues("slug") === slugify(form.getValues("title"))) {
      form.setValue("slug", slugify(value));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Assistente de Vendas com IA" 
                      {...field} 
                      onChange={(e) => handleTitleChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome da solução que aparecerá no dashboard dos membros.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: assistente-vendas-ia" {...field} />
                  </FormControl>
                  <FormDescription>
                    Identificador único para URLs (gerado automaticamente).
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
                      placeholder="Descreva brevemente esta solução e seus benefícios..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição curta que aparecerá no card da solução.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: vendas, atendimento, conversão (separadas por vírgula)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Tags para categorização e busca (separadas por vírgula).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="revenue">Aumento de Receita</SelectItem>
                      <SelectItem value="operational">Otimização Operacional</SelectItem>
                      <SelectItem value="strategy">Gestão Estratégica</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    A trilha em que esta solução será categorizada.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dificuldade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma dificuldade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O nível de dificuldade de implementação da solução.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tempo estimado (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1}
                      placeholder="Ex: 30" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Quanto tempo leva para implementar esta solução (em minutos).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="success_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxa de sucesso (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      max={100}
                      placeholder="Ex: 95" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Porcentagem de membros que conseguem implementar com sucesso.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://exemplo.com/imagem.jpg" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    URL da imagem que será exibida no card da solução.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar solução</FormLabel>
                    <FormDescription>
                      Se ativado, a solução ficará visível para os membros.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={saving}>
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
