
import React, { useState } from 'react';
import { ForumHeader } from "@/components/forum/ForumHeader";
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Edit, Trash, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth';
import * as LucideIcons from 'lucide-react';

// Array para opções de ícones
const iconOptions = [
  'MessagesSquare', 
  'MessageCircle', 
  'Sparkles', 
  'LifeBuoy', 
  'HelpCircle', 
  'Lightbulb',
  'Wrench',
  'Book',
  'Rocket',
  'UserPlus',
  'Code',
  'Gauge',
  'FileQuestion'
];

export const AdminForumPage = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useForumCategories();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    slug: '',
    icon: 'MessagesSquare',
    order_index: 0
  });
  const [isEditing, setIsEditing] = useState(false);

  // Verificar se o usuário é admin
  const isAdmin = profile?.role === 'admin';
  
  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="flex items-center text-amber-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              Esta área é restrita aos administradores.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto gerar slug ao digitar o nome
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, icon: value }));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      slug: '',
      icon: 'MessagesSquare',
      order_index: categories.length
    });
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing) {
        // Atualizar categoria
        const { error } = await supabase
          .from('forum_categories')
          .update({
            name: formData.name,
            description: formData.description,
            slug: formData.slug,
            icon: formData.icon,
            order_index: formData.order_index
          })
          .eq('id', formData.id);
          
        if (error) throw error;
        
        toast({
          title: "Categoria atualizada",
          description: `A categoria ${formData.name} foi atualizada com sucesso.`,
        });
      } else {
        // Criar nova categoria
        const { error } = await supabase
          .from('forum_categories')
          .insert({
            name: formData.name,
            description: formData.description,
            slug: formData.slug,
            icon: formData.icon,
            order_index: formData.order_index
          });
          
        if (error) throw error;
        
        toast({
          title: "Categoria criada",
          description: `A categoria ${formData.name} foi criada com sucesso.`,
        });
      }
      
      // Revalidar consulta de categorias
      queryClient.invalidateQueries({ queryKey: ['forum', 'categories'] });
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category: any) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description || '',
      slug: category.slug,
      icon: category.icon || 'MessagesSquare',
      order_index: category.order_index
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir a categoria "${name}"? Esta ação não pode ser desfeita e removerá todos os tópicos e respostas desta categoria.`);
    
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('forum_categories')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Categoria excluída",
          description: `A categoria "${name}" foi excluída com sucesso.`,
        });
        
        // Revalidar consulta de categorias
        queryClient.invalidateQueries({ queryKey: ['forum', 'categories'] });
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro ao excluir a categoria.",
          variant: "destructive"
        });
      }
    }
  };

  const handleMoveUp = async (category: any) => {
    const currentIndex = category.order_index;
    const categoryAbove = categories.find(c => c.order_index === currentIndex - 1);
    
    if (!categoryAbove) return;
    
    try {
      // Mover categoria selecionada para cima
      const { error: error1 } = await supabase
        .from('forum_categories')
        .update({ order_index: currentIndex - 1 })
        .eq('id', category.id);
        
      // Mover categoria acima para baixo
      const { error: error2 } = await supabase
        .from('forum_categories')
        .update({ order_index: currentIndex })
        .eq('id', categoryAbove.id);
        
      if (error1 || error2) throw error1 || error2;
      
      // Revalidar consulta de categorias
      queryClient.invalidateQueries({ queryKey: ['forum', 'categories'] });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao reordenar as categorias.",
        variant: "destructive"
      });
    }
  };

  const handleMoveDown = async (category: any) => {
    const currentIndex = category.order_index;
    const categoryBelow = categories.find(c => c.order_index === currentIndex + 1);
    
    if (!categoryBelow) return;
    
    try {
      // Mover categoria selecionada para baixo
      const { error: error1 } = await supabase
        .from('forum_categories')
        .update({ order_index: currentIndex + 1 })
        .eq('id', category.id);
        
      // Mover categoria abaixo para cima
      const { error: error2 } = await supabase
        .from('forum_categories')
        .update({ order_index: currentIndex })
        .eq('id', categoryBelow.id);
        
      if (error1 || error2) throw error1 || error2;
      
      // Revalidar consulta de categorias
      queryClient.invalidateQueries({ queryKey: ['forum', 'categories'] });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao reordenar as categorias.",
        variant: "destructive"
      });
    }
  };

  // Função para criar componente de ícone dinamicamente
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.MessagesSquare;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="container py-8">
      <ForumHeader 
        title="Gerenciar Fórum" 
        description="Gerencie as categorias e configurações do fórum"
        breadcrumbs={[
          { name: 'Fórum', href: '/forum' },
          { name: 'Administração', href: '/admin/forum' }
        ]}
      />
      
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</CardTitle>
            <CardDescription>
              {isEditing ? 'Edite as informações da categoria' : 'Adicione uma nova categoria ao fórum'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Suporte Técnico"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="Ex: suporte-tecnico"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  O slug é usado na URL da categoria. Use apenas letras minúsculas, números e hífens.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o propósito desta categoria"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Ícone</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon} className="flex items-center">
                        <div className="flex items-center">
                          {renderIcon(icon)}
                          <span className="ml-2">{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
              >
                {isEditing ? 'Cancelar' : 'Limpar'}
              </Button>
              <Button type="submit">
                {isEditing ? 'Salvar Alterações' : 'Adicionar Categoria'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Lista de categorias */}
        <Card>
          <CardHeader>
            <CardTitle>Categorias Existentes</CardTitle>
            <CardDescription>
              Gerencie as categorias do fórum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p>Carregando categorias...</p>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="p-4 border rounded-md flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 bg-primary/10 text-primary mr-3">
                        <AvatarFallback>{renderIcon(category.icon || 'MessagesSquare')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {category.description || 'Sem descrição'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {/* Botões para reordenar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(category)}
                        disabled={category.order_index === 0}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(category)}
                        disabled={category.order_index === categories.length - 1}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(category.id, category.name)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  Nenhuma categoria encontrada. Crie a primeira categoria do fórum.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
