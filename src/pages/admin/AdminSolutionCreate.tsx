import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Solution {
  id: string;
  title: string;
  description: string;
  category: 'Receita' | 'Operacional' | 'Estratégia';
  difficulty: 'easy' | 'medium' | 'advanced';
  slug: string;
  thumbnail_url: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const AdminSolutionCreate = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Receita' | 'Operacional' | 'Estratégia'>('Receita');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'advanced'>('medium');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a descrição da solução.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const slug = generateSlug(title);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('solutions')
        .insert({
          title: title.trim(),
          description: description.trim(),
          category,
          difficulty,
          slug,
          thumbnail_url: '',
          published: false,
          created_at: now,
          updated_at: now,
        } as any)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const solutionId = (data as any)?.id;
      
      if (solutionId) {
        toast({
          title: "Solução criada",
          description: "A solução foi criada com sucesso!",
        });
        
        navigate(`/admin/solutions/${solutionId}/edit`);
      }
    } catch (error: any) {
      console.error('Erro ao criar solução:', error);
      toast({
        title: "Erro ao criar solução",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Solução</CardTitle>
          <CardDescription>Preencha os campos abaixo para criar uma nova solução.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select onValueChange={(value) => setCategory(value as 'Receita' | 'Operacional' | 'Estratégia')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receita">Receita</SelectItem>
                  <SelectItem value="Operacional">Operacional</SelectItem>
                  <SelectItem value="Estratégia">Estratégia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty">Dificuldade</Label>
              <Select onValueChange={(value) => setDifficulty(value as 'easy' | 'medium' | 'advanced')}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="advanced">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Criando..." : "Criar Solução"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSolutionCreate;
