
import React, { useState } from 'react';
import { useForumCategories } from '@/hooks/community/useForumCategories';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

export const CategoriesManagement = () => {
  const { categories, isLoading, refetch } = useForumCategories();
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    slug: '',
    icon: '💬',
    order_index: 0,
    is_active: true
  });

  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (data: Omit<CategoryFormData, 'order_index'> & { order_index?: number }) => {
      const { error } = await supabase
        .from('forum_categories')
        .insert({
          ...data,
          order_index: data.order_index || categories.length
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Categoria criada com sucesso!');
      setShowNewForm(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
      const { error } = await supabase
        .from('forum_categories')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Categoria atualizada com sucesso!');
      setEditingCategory(null);
      refetch();
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('forum_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Categoria excluída com sucesso!');
      refetch();
    },
    onError: (error) => {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      icon: '💬',
      order_index: 0,
      is_active: true
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory,
        data: formData
      });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  const startEdit = (category: any) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      icon: category.icon || '💬',
      order_index: category.order_index || 0,
      is_active: category.is_active
    });
    setEditingCategory(category.id);
    setShowNewForm(false);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setShowNewForm(false);
    resetForm();
  };

  if (isLoading) {
    return <div>Carregando categorias...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Categorias do Fórum</h2>
          <p className="text-muted-foreground">
            Crie, edite e organize as categorias da comunidade
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)} disabled={showNewForm || editingCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Formulário de Nova Categoria */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Nome da categoria"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="slug-da-categoria"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da categoria"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="icon">Ícone (Emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="💬"
                  maxLength={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createCategoryMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {createCategoryMutation.isPending ? 'Criando...' : 'Criar Categoria'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Categorias */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              {editingCategory === category.id ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`edit-name-${category.id}`}>Nome *</Label>
                      <Input
                        id={`edit-name-${category.id}`}
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-slug-${category.id}`}>Slug</Label>
                      <Input
                        id={`edit-slug-${category.id}`}
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`edit-description-${category.id}`}>Descrição</Label>
                    <Textarea
                      id={`edit-description-${category.id}`}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor={`edit-icon-${category.id}`}>Ícone</Label>
                    <Input
                      id={`edit-icon-${category.id}`}
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      maxLength={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={updateCategoryMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {updateCategoryMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{category.icon || '💬'}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <Badge variant={category.is_active ? "default" : "secondary"}>
                          {category.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Slug: {category.slug}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(category)}
                      disabled={editingCategory !== null || showNewForm}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={editingCategory !== null || showNewForm}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a categoria "{category.name}"? 
                            Esta ação não pode ser desfeita e todos os tópicos desta categoria serão afetados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCategoryMutation.mutate(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie a primeira categoria para organizar os tópicos da comunidade.
              </p>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
