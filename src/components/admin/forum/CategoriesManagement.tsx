
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { ForumCategory } from '@/types/forumTypes';

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  slug: string;
  is_active: boolean;
  order_index: number;
}

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
  icon: '📁',
  slug: '',
  is_active: true,
  order_index: 0,
};

export const CategoriesManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(emptyForm);
  const queryClient = useQueryClient();

  // Buscar categorias
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['forum-categories-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as ForumCategory[];
    },
  });

  // Mutation para criar categoria
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<CategoryFormData, 'order_index'> & { order_index?: number }) => {
      const maxOrder = Math.max(...categories.map(c => c.order_index || 0), 0);
      
      const { data, error } = await supabase
        .from('forum_categories')
        .insert([{
          ...categoryData,
          order_index: categoryData.order_index || maxOrder + 1
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success('Categoria criada com sucesso!');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    },
  });

  // Mutation para atualizar categoria
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: CategoryFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('forum_categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success('Categoria atualizada com sucesso!');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    },
  });

  // Mutation para deletar categoria
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('forum_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories-admin'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    // Gerar slug se não fornecido
    if (!formData.slug.trim()) {
      formData.slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ ...formData, id: editingCategory.id });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const handleEdit = (category: ForumCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '📁',
      slug: category.slug,
      is_active: category.is_active ?? true,
      order_index: category.order_index || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData(emptyForm);
  };

  const suggestedIcons = ['📁', '💡', '🎯', '🚀', '💼', '🔧', '📊', '🌟', '❓', '💬', '📚', '🎨', '⚡', '🏆'];

  if (isLoading) {
    return <div>Carregando categorias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Categorias</h2>
          <p className="text-muted-foreground">
            Gerencie as categorias do fórum da comunidade
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Geral, Ajuda, Sugestões"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ex: geral, ajuda, sugestoes (deixe vazio para gerar automaticamente)"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o propósito desta categoria"
                />
              </div>

              <div>
                <Label htmlFor="icon">Ícone</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Ex: 📁, 💡, 🎯"
                    className="flex-1"
                  />
                  <span className="text-2xl">{formData.icon}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggestedIcons.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, icon })}
                      className="text-lg p-1 h-8 w-8"
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="order_index">Ordem</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Categoria ativa</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">/{category.slug}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    (category.is_active ?? true) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {(category.is_active ?? true) ? 'Ativa' : 'Inativa'}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            
            {category.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardContent>
            )}
          </Card>
        ))}

        {categories.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhuma categoria encontrada. Crie a primeira categoria para começar!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
