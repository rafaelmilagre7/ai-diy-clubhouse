
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export const AdminForumPage = () => {
  const { data: categories = [], isLoading } = useForumCategories();
  const queryClient = useQueryClient();
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [editCategoryDialog, setEditCategoryDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  // Estados para nova categoria
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newIcon, setNewIcon] = useState('message-square');
  
  // Estados para edição de categoria
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editIcon, setEditIcon] = useState('');
  
  const handleCreateCategory = async () => {
    try {
      // Validar dados
      if (!newName.trim() || !newSlug.trim()) {
        toast.error('Nome e slug são obrigatórios');
        return;
      }
      
      // Criar categoria
      const { error } = await supabase
        .from('forum_categories')
        .insert({
          name: newName,
          description: newDescription,
          slug: newSlug,
          icon: newIcon,
          is_active: true,
          order_index: categories.length + 1
        });
      
      if (error) throw error;
      
      // Fechar diálogo e resetar campos
      setNewCategoryDialog(false);
      setNewName('');
      setNewDescription('');
      setNewSlug('');
      setNewIcon('message-square');
      
      // Recarregar dados
      queryClient.invalidateQueries({
        queryKey: ['forum', 'categories']
      });
      
      toast.success('Categoria criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    }
  };
  
  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setEditSlug(category.slug);
    setEditIcon(category.icon || 'message-square');
    setEditCategoryDialog(true);
  };
  
  const handleUpdateCategory = async () => {
    try {
      // Validar dados
      if (!editName.trim() || !editSlug.trim()) {
        toast.error('Nome e slug são obrigatórios');
        return;
      }
      
      // Atualizar categoria
      const { error } = await supabase
        .from('forum_categories')
        .update({
          name: editName,
          description: editDescription,
          slug: editSlug,
          icon: editIcon
        })
        .eq('id', selectedCategory.id);
      
      if (error) throw error;
      
      // Fechar diálogo
      setEditCategoryDialog(false);
      
      // Recarregar dados
      queryClient.invalidateQueries({
        queryKey: ['forum', 'categories']
      });
      
      toast.success('Categoria atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };
  
  const handleToggleCategoryStatus = async (category: any) => {
    try {
      const { error } = await supabase
        .from('forum_categories')
        .update({
          is_active: !category.is_active
        })
        .eq('id', category.id);
      
      if (error) throw error;
      
      // Recarregar dados
      queryClient.invalidateQueries({
        queryKey: ['forum', 'categories']
      });
      
      toast.success(`Categoria ${category.is_active ? 'desativada' : 'ativada'} com sucesso`);
    } catch (error) {
      console.error('Erro ao atualizar status da categoria:', error);
      toast.error('Erro ao atualizar status da categoria');
    }
  };
  
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      // Verificar se existem tópicos nesta categoria
      const { data: topics, error: topicsError } = await supabase
        .from('forum_topics')
        .select('id')
        .eq('category_id', categoryId)
        .limit(1);
      
      if (topicsError) throw topicsError;
      
      if (topics && topics.length > 0) {
        toast.error('Não é possível excluir categoria com tópicos existentes');
        return;
      }
      
      // Excluir categoria
      const { error } = await supabase
        .from('forum_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      // Recarregar dados
      queryClient.invalidateQueries({
        queryKey: ['forum', 'categories']
      });
      
      toast.success('Categoria excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administração do Fórum</h1>
        <Button onClick={() => setNewCategoryDialog(true)}>Nova Categoria</Button>
      </div>
      
      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="moderation">Moderação</TabsTrigger>
          <TabsTrigger value="reports">Denúncias</TabsTrigger>
        </TabsList>
        
        {/* Tab de categorias */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {isLoading ? (
                  <p>Carregando categorias...</p>
                ) : categories.length === 0 ? (
                  <p>Nenhuma categoria cadastrada</p>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="py-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description || 'Sem descrição'}</p>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Slug: {category.slug} • Status: {category.is_active ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant={category.is_active ? "destructive" : "secondary"}
                          onClick={() => handleToggleCategoryStatus(category)}
                        >
                          {category.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de moderação */}
        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Moderação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Funcionalidades de moderação em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab de denúncias */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Denúncias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Sistema de denúncias em desenvolvimento.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Dialog para criar nova categoria */}
      <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nome</label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug">Slug</label>
              <Input
                id="slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="slug-da-categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Descrição</label>
              <Textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descrição da categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="icon">Ícone</label>
              <Input
                id="icon"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="Ícone da categoria"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCategory}>Criar Categoria</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para editar categoria */}
      <Dialog open={editCategoryDialog} onOpenChange={setEditCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-name">Nome</label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome da categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-slug">Slug</label>
              <Input
                id="edit-slug"
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="slug-da-categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description">Descrição</label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Descrição da categoria"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-icon">Ícone</label>
              <Input
                id="edit-icon"
                value={editIcon}
                onChange={(e) => setEditIcon(e.target.value)}
                placeholder="Ícone da categoria"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditCategoryDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateCategory}>Salvar Alterações</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
