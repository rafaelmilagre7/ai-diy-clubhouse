
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string()
    .min(5, {
      message: "O título deve ter pelo menos 5 caracteres.",
    })
    .max(100, {
      message: "O título não pode exceder 100 caracteres.",
    }),
  content: z.string()
    .min(10, {
      message: "O conteúdo deve ter pelo menos 10 caracteres.",
    })
});

interface NewTopicFormProps {
  categoryId: string;
  categorySlug: string;
}

export const NewTopicForm = ({ categoryId }: NewTopicFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: ""
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para criar um tópico");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Cria o tópico
      const { data: topic, error: topicError } = await supabase
        .from("forum_topics")
        .insert({
          title: values.title.trim(),
          content: values.content.trim(),
          category_id: categoryId,
          user_id: user.id,
        })
        .select()
        .single();
        
      if (topicError) throw topicError;
      
      toast.success("Tópico criado com sucesso!");
      navigate(`/forum/topic/${topic.id}`);
      
    } catch (error) {
      console.error("Erro ao criar tópico:", error);
      toast.error("Não foi possível criar o tópico. Tente novamente mais tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título do seu tópico" {...field} />
              </FormControl>
              <FormDescription>
                Um título claro ajuda outros membros a encontrarem seu tópico.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva seu tópico em detalhes..." 
                  className="min-h-[200px] resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="mr-2"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar Tópico"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
