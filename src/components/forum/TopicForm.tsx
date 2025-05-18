
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForumActions } from '@/hooks/forum/useForumActions';
import { useForumCategories } from '@/hooks/forum/useForumCategories';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SendIcon } from 'lucide-react';

interface TopicFormProps {
  categoryId?: string;
}

interface FormValues {
  title: string;
  content: string;
  categoryId: string;
}

export const TopicForm = ({ categoryId: initialCategoryId }: TopicFormProps) => {
  const { createTopic } = useForumActions();
  const { data: categories = [], isLoading: categoriesLoading } = useForumCategories();
  const navigate = useNavigate();
  
  const { register, handleSubmit, control, formState: { isSubmitting, errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      content: '',
      categoryId: initialCategoryId || ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await createTopic.mutateAsync({
        title: data.title,
        content: data.content,
        categoryId: data.categoryId
      });
      
      // Redirecionar para o tópico criado
      navigate(`/forum/topico/${result.id}`);
    } catch (error) {
      console.error('Erro ao criar tópico:', error);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Tópico</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Digite um título para o tópico"
              {...register('title', { 
                required: 'O título é obrigatório',
                minLength: { value: 5, message: 'O título deve ter pelo menos 5 caracteres' },
                maxLength: { value: 100, message: 'O título deve ter no máximo 100 caracteres' }
              })}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Selecione uma categoria' }}
              render={({ field }) => (
                <Select
                  disabled={categoriesLoading || !!initialCategoryId}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              placeholder="Descreva seu tópico em detalhes..."
              className="min-h-[200px] resize-y"
              {...register('content', { 
                required: 'O conteúdo é obrigatório',
                minLength: { value: 20, message: 'O conteúdo deve ter pelo menos 20 caracteres' }
              })}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <SendIcon className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Publicar Tópico'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
