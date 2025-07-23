import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, TrendingUp, Target } from 'lucide-react';

const businessInfoSchema = z.object({
  company_name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  company_size: z.string().min(1, 'Selecione o tamanho da empresa'),
  company_sector: z.string().min(1, 'Selecione o setor'),
  current_position: z.string().min(2, 'Cargo deve ter pelo menos 2 caracteres'),
  annual_revenue: z.string().min(1, 'Selecione o faturamento'),
  main_challenge: z.string().optional(),
});

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

interface Step2BusinessInfoProps {
  initialData?: Partial<BusinessInfoFormData>;
  onDataChange: (data: Partial<BusinessInfoFormData>) => void;
  onNext: () => void;
}

export const Step2BusinessInfo: React.FC<Step2BusinessInfoProps> = ({
  initialData,
  onDataChange,
  onNext,
}) => {
  const [currentData, setCurrentData] = useState<Partial<BusinessInfoFormData>>(initialData || {});

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: initialData || {},
    mode: 'onChange',
  });

  const watchedFields = form.watch();

  useEffect(() => {
    const newData = { ...currentData, ...watchedFields };
    setCurrentData(newData);
    onDataChange(newData);
  }, [watchedFields, onDataChange]);

  const handleSubmit = (data: BusinessInfoFormData) => {
    onNext();
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <Building2 className="w-16 h-16 mx-auto text-primary" />
        <p className="text-muted-foreground text-lg">
          Entenda melhor seu contexto profissional para personalizar suas recomendações
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Nome da Empresa
            </Label>
            <Input
              id="company_name"
              placeholder="Digite o nome da sua empresa"
              {...form.register('company_name')}
              className="h-12"
            />
            {form.formState.errors.company_name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.company_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_position" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Cargo Atual
            </Label>
            <Input
              id="current_position"
              placeholder="Ex: CEO, Gerente de Marketing"
              {...form.register('current_position')}
              className="h-12"
            />
            {form.formState.errors.current_position && (
              <p className="text-sm text-destructive">
                {form.formState.errors.current_position.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tamanho da Empresa
            </Label>
            <Select onValueChange={(value) => form.setValue('company_size', value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 funcionários</SelectItem>
                <SelectItem value="11-50">11-50 funcionários</SelectItem>
                <SelectItem value="51-200">51-200 funcionários</SelectItem>
                <SelectItem value="201-1000">201-1000 funcionários</SelectItem>
                <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.company_size && (
              <p className="text-sm text-destructive">
                {form.formState.errors.company_size.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Faturamento Anual
            </Label>
            <Select onValueChange={(value) => form.setValue('annual_revenue', value)}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o faturamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-100k">Até R$ 100 mil</SelectItem>
                <SelectItem value="100k-500k">R$ 100 mil - R$ 500 mil</SelectItem>
                <SelectItem value="500k-2m">R$ 500 mil - R$ 2 milhões</SelectItem>
                <SelectItem value="2m-10m">R$ 2 milhões - R$ 10 milhões</SelectItem>
                <SelectItem value="10m+">Mais de R$ 10 milhões</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.annual_revenue && (
              <p className="text-sm text-destructive">
                {form.formState.errors.annual_revenue.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Setor da Empresa
          </Label>
          <Select onValueChange={(value) => form.setValue('company_sector', value)}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Tecnologia</SelectItem>
              <SelectItem value="retail">Varejo</SelectItem>
              <SelectItem value="healthcare">Saúde</SelectItem>
              <SelectItem value="education">Educação</SelectItem>
              <SelectItem value="finance">Financeiro</SelectItem>
              <SelectItem value="manufacturing">Indústria</SelectItem>
              <SelectItem value="services">Serviços</SelectItem>
              <SelectItem value="construction">Construção</SelectItem>
              <SelectItem value="food">Alimentação</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.company_sector && (
            <p className="text-sm text-destructive">
              {form.formState.errors.company_sector.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="main_challenge">
            Qual é o principal desafio da sua empresa atualmente? (opcional)
          </Label>
          <Textarea
            id="main_challenge"
            placeholder="Ex: Aumentar vendas, melhorar eficiência, reduzir custos..."
            {...form.register('main_challenge')}
            className="min-h-[100px]"
          />
        </div>
      </form>
    </div>
  );
};