
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Send } from 'lucide-react';
import { useSuggestionCreation } from '@/hooks/suggestions/useSuggestionCreation';
import { useCategories } from '@/hooks/suggestions/useCategories';
import { toast } from 'sonner';

interface SuggestionFormData {
  title: string;
  description: string;
  category_id: string;
}

const NewSuggestion = () => {
  const navigate = useNavigate();
  const { submitSuggestion, isSubmitting } = useSuggestionCreation();
  const { categories, isLoading: categoriesLoading } = useCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SuggestionFormData>();

  const selectedCategory = watch('category_id');

  const onSubmit = async (data: SuggestionFormData) => {
    try {
      await submitSuggestion(data);
      toast.success('Sugestão criada com sucesso!');
      navigate('/suggestions');
    } catch (error: any) {
      toast.error(`Erro ao criar sugestão: ${error.message}`);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/suggestions')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Sugestões
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nova Sugestão</CardTitle>
          <p className="text-muted-foreground">
            Compartilhe suas ideias para melhorar a plataforma
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Título da Sugestão *
              </label>
              <Input
                id="title"
                placeholder="Ex: Adicionar filtro avançado na lista de soluções"
                {...register('title', { 
                  required: 'O título é obrigatório',
                  minLength: { value: 10, message: 'Título deve ter pelo menos 10 caracteres' }
                })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Categoria *
              </label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => setValue('category_id', value)}
                disabled={categoriesLoading}
              >
                <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
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
              {errors.category_id && (
                <p className="text-sm text-red-500">Selecione uma categoria</p>
              )}
              <input
                type="hidden"
                {...register('category_id', { required: 'Selecione uma categoria' })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição Detalhada *
              </label>
              <Textarea
                id="description"
                placeholder="Descreva sua sugestão em detalhes. Explique o problema que resolve, como funcionaria e os benefícios..."
                rows={6}
                {...register('description', { 
                  required: 'A descrição é obrigatória',
                  minLength: { value: 50, message: 'Descrição deve ter pelo menos 50 caracteres' }
                })}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Dicas para uma boa sugestão:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Seja específico sobre o problema que sua sugestão resolve</li>
                <li>• Explique como a funcionalidade deveria funcionar</li>
                <li>• Mencione os benefícios para outros usuários</li>
                <li>• Use linguagem clara e objetiva</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/suggestions')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Sugestão
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSuggestion;
