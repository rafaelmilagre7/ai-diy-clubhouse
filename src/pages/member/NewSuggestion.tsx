
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useSuggestionCreation } from '@/hooks/suggestions/useSuggestionCreation';
import { ArrowLeft, Lightbulb, Send } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from '@/components/ui/breadcrumb';

interface SuggestionFormData {
  title: string;
  description: string;
  category_id: string;
}

const NewSuggestion = () => {
  const navigate = useNavigate();
  const { submitSuggestion, isSubmitting } = useSuggestionCreation();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SuggestionFormData>();

  const categories = [
    { id: '1', name: 'Interface e Usabilidade', description: 'Melhorias na experiência do usuário' },
    { id: '2', name: 'Funcionalidades', description: 'Novas features e recursos' },
    { id: '3', name: 'Performance', description: 'Otimizações e velocidade' },
    { id: '4', name: 'Conteúdo', description: 'Cursos, materiais e recursos' },
    { id: '5', name: 'Comunidade', description: 'Fórum e interações sociais' },
    { id: '6', name: 'Outras', description: 'Sugestões gerais' }
  ];

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
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Header with Breadcrumb */}
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/suggestions')} className="cursor-pointer">
                Sugestões
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Nova Sugestão</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/suggestions')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Sugestões
        </Button>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
          <Lightbulb className="h-4 w-4" />
          Compartilhe sua ideia
        </div>
        <h1 className="text-3xl font-bold">Nova Sugestão</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ajude-nos a melhorar a plataforma compartilhando suas ideias e sugestões. 
          Sua opinião é muito importante para nós!
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Detalhes da Sugestão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título da sugestão <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Adicionar modo escuro na plataforma"
                {...register('title', { 
                  required: 'O título é obrigatório',
                  minLength: { value: 10, message: 'O título deve ter pelo menos 10 caracteres' }
                })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Categoria <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue('category_id', value)}>
                <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="space-y-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-sm text-red-500">A categoria é obrigatória</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição detalhada <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Descreva sua sugestão em detalhes. Explique como ela pode melhorar a experiência dos usuários, que problema resolve, etc."
                rows={6}
                {...register('description', { 
                  required: 'A descrição é obrigatória',
                  minLength: { value: 50, message: 'A descrição deve ter pelo menos 50 caracteres' }
                })}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Seja específico e claro. Quanto mais detalhes, melhor poderemos avaliar sua sugestão.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/suggestions')}
                className="sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="sm:order-2 gap-2"
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
