
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

type FormValues = {
  title: string;
  description: string;
  category_id: string;
};

const NewSuggestionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, submitSuggestion, isLoading } = useSuggestions();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
    }
  });

  const selectedCategory = watch('category_id');
  
  console.log("Categorias disponíveis:", categories);
  console.log("Usuário logado:", user);

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Enviando sugestão:", data);
      await submitSuggestion(data);
      toast.success('Sugestão enviada com sucesso!');
      navigate('/suggestions');
    } catch (error: any) {
      console.error('Erro ao enviar sugestão:', error);
      toast.error('Erro ao enviar sugestão: ' + (error.message || 'Tente novamente.'));
    }
  };

  // Verificar se o usuário está logado
  if (!user) {
    return (
      <div className="container py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado para criar uma sugestão.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/auth')}>
              Fazer Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2 mb-4" 
        onClick={() => navigate('/suggestions')}
      >
        <ArrowLeft size={16} />
        Voltar para sugestões
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Nova Sugestão</CardTitle>
          <CardDescription>
            Compartilhe sua ideia para melhorar nossa plataforma
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da sugestão</Label>
              <Input
                id="title"
                placeholder="Ex: Adicionar dashboard personalizado"
                {...register('title', { required: 'O título é obrigatório' })}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                onValueChange={(value) => setValue('category_id', value)}
                value={selectedCategory}
              >
                <SelectTrigger>
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
                <p className="text-sm text-red-500">{errors.category_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva sua sugestão em detalhes..."
                className="min-h-[150px]"
                {...register('description', { required: 'A descrição é obrigatória' })}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/suggestions')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar sugestão'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default NewSuggestionPage;
