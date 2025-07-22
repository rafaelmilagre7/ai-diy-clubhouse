
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';
import { useSuggestionCreation } from '@/hooks/suggestions/useSuggestionCreation';
import { useCategories } from '@/hooks/suggestions/useCategories';

type FormValues = {
  title: string;
  description: string;
  category_id: string;
};

const NewSuggestionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSubmitting, submitSuggestion } = useSuggestionCreation();
  const { categories: categoriesList } = useCategories();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category_id: '',
    }
  });

  const selectedCategory = watch('category_id');
  
  console.log("Categorias disponíveis:", categoriesList);
  console.log("Usuário logado:", user);

  const onSubmit = async (data: FormValues) => {
    try {
      if (!data.category_id) {
        toast.error("Por favor, selecione uma categoria");
        return;
      }

      console.log("Enviando sugestão:", data);
      await submitSuggestion(data);
      toast.success("Sugestão criada com sucesso!");
      
      // Redirecionamento imediato
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header com navegação */}
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground" 
              onClick={() => navigate('/suggestions')}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para sugestões
            </Button>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-foreground">Nova Sugestão</h1>
              <p className="text-base text-muted-foreground">
                Compartilhe sua ideia para melhorar nossa plataforma
              </p>
            </div>
          </div>

          {/* Formulário */}
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-medium text-foreground">
                    Título da sugestão
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Adicionar dashboard personalizado"
                    className="h-11 bg-background border-border focus:border-primary transition-colors"
                    {...register('title', { required: 'O título é obrigatório' })}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-medium text-foreground">
                    Categoria
                  </Label>
                  <Select 
                    onValueChange={(value) => setValue('category_id', value)}
                    value={selectedCategory}
                  >
                    <SelectTrigger className="h-11 bg-background border-border focus:border-primary">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {categoriesList.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id}
                          className="hover:bg-accent focus:bg-accent"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-destructive">{errors.category_id.message}</p>
                  )}
                  {!selectedCategory && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Selecione uma categoria para sua sugestão
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva sua sugestão em detalhes..."
                    className="min-h-[150px] bg-background border-border focus:border-primary transition-colors resize-none"
                    {...register('description', { required: 'A descrição é obrigatória' })}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="flex justify-end gap-3 p-8 pt-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/suggestions')}
                  className="px-6 h-11"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 h-11"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar sugestão'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewSuggestionPage;
