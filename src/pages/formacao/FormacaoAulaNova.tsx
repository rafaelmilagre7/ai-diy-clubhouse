
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Editor } from "@/components/editor/Editor";
import { FormacaoAulasHeader } from "@/components/formacao/aulas/FormacaoAulasHeader";

// Schema para validação do formulário
const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  module_id: z.string({
    required_error: "Por favor selecione um módulo.",
  }),
  order_index: z.number().optional(),
  cover_image_url: z.string().optional(),
  is_published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const FormacaoAulaNova = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [modulos, setModulos] = useState<{ id: string; title: string; course_id: string }[]>([]);
  const [cursos, setCursos] = useState<{ id: string; title: string }[]>([]);
  const [cursoSelecionado, setCursoSelecionado] = useState<string>("");

  // Configurar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      order_index: 0,
      is_published: false,
      cover_image_url: "",
    },
  });

  // Buscar cursos e módulos
  useEffect(() => {
    const fetchCursos = async () => {
      const { data, error } = await supabase
        .from("learning_courses")
        .select("id, title")
        .order("title");

      if (error) {
        toast.error("Erro ao carregar cursos");
        console.error("Erro ao carregar cursos:", error);
        return;
      }

      setCursos(data || []);
    };

    fetchCursos();
  }, []);

  // Buscar módulos baseado no curso selecionado
  useEffect(() => {
    const fetchModulos = async () => {
      if (!cursoSelecionado) {
        setModulos([]);
        return;
      }

      const { data, error } = await supabase
        .from("learning_modules")
        .select("id, title, course_id")
        .eq("course_id", cursoSelecionado)
        .order("title");

      if (error) {
        toast.error("Erro ao carregar módulos");
        console.error("Erro ao carregar módulos:", error);
        return;
      }

      setModulos(data || []);
    };

    fetchModulos();
  }, [cursoSelecionado]);

  // Manipular a seleção de curso
  const handleCursoChange = (value: string) => {
    setCursoSelecionado(value);
    form.setValue("module_id", ""); // Resetar o módulo quando mudar o curso
  };

  // Criar uma nova aula
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("learning_lessons")
        .insert({
          title: values.title,
          description: values.description || "",
          module_id: values.module_id,
          order_index: values.order_index || 0,
          cover_image_url: values.cover_image_url || null,
          is_published: values.is_published,
        })
        .select();

      if (error) throw error;

      toast.success("Aula criada com sucesso!");
      navigate(`/formacao/aulas/${data[0].id}`);
    } catch (error: any) {
      toast.error("Erro ao criar aula");
      console.error("Erro ao criar aula:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormacaoAulasHeader 
        titulo="Nova Aula" 
        breadcrumb={true} 
      />

      <Card>
        <CardHeader>
          <CardTitle>Informações da Aula</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar uma nova aula
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Aula</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Introdução à Inteligência Artificial" {...field} />
                    </FormControl>
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
                        placeholder="Descreva o conteúdo desta aula"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Uma breve descrição sobre o que será abordado nesta aula.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <FormLabel className="block mb-2">Curso</FormLabel>
                    <Select
                      value={cursoSelecionado}
                      onValueChange={handleCursoChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um curso" />
                      </SelectTrigger>
                      <SelectContent>
                        {cursos.map((curso) => (
                          <SelectItem key={curso.id} value={curso.id}>
                            {curso.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <FormField
                    control={form.control}
                    name="module_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Módulo</FormLabel>
                        <Select
                          disabled={!cursoSelecionado || modulos.length === 0}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um módulo" />
                          </SelectTrigger>
                          <SelectContent>
                            {modulos.map((modulo) => (
                              <SelectItem key={modulo.id} value={modulo.id}>
                                {modulo.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Primeiro selecione um curso para ver os módulos disponíveis.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order_index"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value?.toString() || "0"}
                          />
                        </FormControl>
                        <FormDescription>
                          Posição da aula dentro do módulo (0 é a primeira).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem de Capa</FormLabel>
                      <FormControl>
                        <Editor
                          value={field.value}
                          onChange={field.onChange}
                          type="image"
                        />
                      </FormControl>
                      <FormDescription>
                        Imagem que será exibida na listagem de aulas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/formacao/aulas")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Aula"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default FormacaoAulaNova;
