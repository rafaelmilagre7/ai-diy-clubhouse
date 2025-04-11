
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Solution } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Clock, Upload } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres",
  }),
  description: z.string().min(30, {
    message: "A descrição deve ter pelo menos 30 caracteres",
  }),
  category: z.enum(["revenue", "operational", "strategy"], {
    invalid_type_error: "Selecione uma categoria válida",
  }),
  difficulty: z.enum(["easy", "medium", "advanced"], {
    invalid_type_error: "Selecione uma dificuldade válida",
  }),
  estimated_time: z.number().min(5, {
    message: "O tempo estimado deve ser de pelo menos 5 minutos",
  }),
  success_rate: z.number().min(0).max(100, {
    message: "A taxa de sucesso deve estar entre 0 e 100%",
  }),
  thumbnail_url: z.string().optional(),
  published: z.boolean().default(false),
  slug: z.string().min(3, {
    message: "O slug deve ter pelo menos 3 caracteres",
  }).optional(),
});

export type SolutionFormValues = z.infer<typeof formSchema>;

interface BasicInfoFormProps {
  defaultValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => void;
  saving: boolean;
}

const BasicInfoForm = ({ defaultValues, onSubmit, saving }: BasicInfoFormProps) => {
  const form = useForm<SolutionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Solução</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Assistente de vendas no Instagram" {...field} />
                  </FormControl>
                  <FormDescription>
                    Um título claro e descritivo para a solução
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
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: assistente-vendas-instagram" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Identificador único para URL (deixe em branco para gerar automaticamente)
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
                      placeholder="Descreva brevemente o que esta solução faz e quais benefícios ela traz..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Uma descrição concisa que explique o valor para o membro
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
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
                      A trilha à qual esta solução pertence
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
                    <FormLabel>Nível de Dificuldade</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a dificuldade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="easy">Fácil</SelectItem>
                        <SelectItem value="medium">Médio</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      O nível de complexidade da implementação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="estimated_time"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Tempo Estimado (minutos)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            type="number"
                            min={5}
                            className="w-20" 
                            value={value}
                            onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
                            {...field}
                          />
                          <span className="text-muted-foreground">minutos</span>
                        </div>
                        <Slider
                          min={5}
                          max={120}
                          step={5}
                          value={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Tempo aproximado para completar a implementação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="success_rate"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Taxa de Sucesso (%)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            className="w-20"
                            value={value}
                            onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
                            {...field}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          value={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Percentual estimado de membros que completam com sucesso
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="thumbnail_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem de Capa</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <div className="border rounded-md flex items-center justify-center h-40 bg-muted/40">
                        {field.value ? (
                          <img
                            src={field.value}
                            alt="Thumbnail"
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="flex flex-col items-center p-4 text-center">
                            <ImagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Nenhuma imagem selecionada
                            </p>
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder="URL da imagem"
                        {...field}
                      />
                      <Button type="button" variant="outline" className="w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar Imagem
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Imagem principal da solução (1200x400 recomendado)
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
                    <FormLabel className="text-base">Status de Publicação</FormLabel>
                    <FormDescription>
                      {field.value
                        ? "Esta solução está visível para os membros"
                        : "Esta solução está salva como rascunho"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Prévia</h3>
                  <Badge variant="outline" className={
                    form.watch("published") 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }>
                    {form.watch("published") ? "Publicada" : "Rascunho"}
                  </Badge>
                </div>
                <div className="rounded-lg border overflow-hidden">
                  <div className="bg-gradient-to-r from-viverblue to-viverblue-dark h-16 w-full"></div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1">{form.watch("title") || "Título da Solução"}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{form.watch("estimated_time") || 0} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar Informações Básicas"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BasicInfoForm;
