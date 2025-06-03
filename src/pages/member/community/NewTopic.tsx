
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewTopic() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: category } = useQuery({
    queryKey: ['forum-category', categorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const createTopicMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          title,
          content,
          category_id: category?.id,
          user_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Tópico criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      navigate(`/comunidade/topico/${data.id}`);
    },
    onError: () => {
      toast.error("Erro ao criar tópico");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    createTopicMutation.mutate({ title, content });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/comunidade/categoria/${categorySlug}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para {category?.name}
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Tópico</h1>
          <p className="text-muted-foreground">Crie um novo tópico em {category?.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar Tópico</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do seu tópico..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Descreva sua dúvida, experiência ou compartilhe conhecimento..."
                rows={8}
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate(`/comunidade/categoria/${categorySlug}`)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createTopicMutation.isPending}
              >
                {createTopicMutation.isPending ? "Criando..." : "Criar Tópico"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
