
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
import React from "react";

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
  thumbnail_url: z.string().url({
    message: "Por favor, insira uma URL de imagem válida.",
  }).optional().or(z.literal("")),
  published: z.boolean().default(false),
  slug: z.string().min(3, {
    message: "O slug deve ter pelo menos 3 caracteres.",
  }).optional(),
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
  const difficulty = form.watch("difficulty");
  
  // Auto-gerar slug quando o título mudar e o slug não tiver sido modificado manualmente
  React.useEffect(() => {
    if (title) {
      const newSlug = slugify(title);
      const currentSlug = form.getValues("slug");
      
      // Se o slug estiver vazio ou for igual ao slug gerado anteriormente do título
      if (!currentSlug || currentSlug === slugify(form.formState.defaultValues?.title || '')) {
        form.setValue("slug", newSlug);
      }
    }
  }, [title, form]);

  // Função para obter a cor correspondente à dificuldade
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-500 text-white";
      case "medium": return "bg-orange-500 text-white";
      case "advanced": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
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
                      <SelectTrigger 
                        className={field.value ? `${getDifficultyColor(field.value)} border-0` : ""}
                      >
                        <SelectValue placeholder="Selecione uma dificuldade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy" className="bg-green-100 hover:bg-green-200">
                        Fácil
                      </SelectItem>
                      <SelectItem value="medium" className="bg-orange-100 hover:bg-orange-200">
                        Médio
                      </SelectItem>
                      <SelectItem value="advanced" className="bg-red-100 hover:bg-red-200">
                        Avançado
                      </SelectItem>
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

        <Button type="submit" disabled={saving} className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90">
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
