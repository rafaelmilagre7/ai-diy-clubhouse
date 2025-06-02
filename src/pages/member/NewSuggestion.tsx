
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/suggestions/useCategories';
import { useSuggestionCreation } from '@/hooks/suggestions/useSuggestionCreation';
import { toast } from 'sonner';

const suggestionSchema = yup.object({
  title: yup.string().required('Título é obrigatório').min(10, 'Título deve ter pelo menos 10 caracteres'),
  description: yup.string().required('Descrição é obrigatória').min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  category_id: yup.string().required('Categoria é obrigatória')
});

type SuggestionFormData = yup.InferType<typeof suggestionSchema>;

const NewSuggestion = () => {
  const navigate = useNavigate();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { isSubmitting, submitSuggestion } = useSuggestionCreation();

  const form = useForm<SuggestionFormData>({
    resolver: yupResolver(suggestionSchema),
    defaultValues: {
      title: '',
      description: '',
      category_id: ''
    }
  });

  const onSubmit = async (values: SuggestionFormData) => {
    try {
      await submitSuggestion(values);
      toast.success('Sugestão criada com sucesso!');
      navigate('/suggestions');
    } catch (error: any) {
      toast.error(`Erro ao criar sugestão: ${error.message}`);
    }
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/suggestions" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar para sugestões
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Sugestão</CardTitle>
          <p className="text-muted-foreground">
            Compartilhe sua ideia para melhorar nossa plataforma
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descreva sua sugestão em poucas palavras"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesLoading ? (
                          <SelectItem value="loading" disabled>
                            Carregando categorias...
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalhe sua sugestão. Explique o problema que ela resolve e como funcionaria..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Criando...' : 'Criar Sugestão'}
                </Button>
                
                <Button type="button" variant="outline" asChild>
                  <Link to="/suggestions">Cancelar</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSuggestion;
