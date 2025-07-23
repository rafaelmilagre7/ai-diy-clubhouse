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
  current_position: z.string().min(1, 'Selecione seu cargo'),
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
            <Label className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Cargo Atual
            </Label>
            <Select onValueChange={(value) => form.setValue('current_position', value)} defaultValue={form.getValues('current_position')}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione seu cargo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CEO">CEO / Presidente</SelectItem>
                <SelectItem value="CTO">CTO / Diretor de Tecnologia</SelectItem>
                <SelectItem value="CFO">CFO / Diretor Financeiro</SelectItem>
                <SelectItem value="CMO">CMO / Diretor de Marketing</SelectItem>
                <SelectItem value="COO">COO / Diretor de Operações</SelectItem>
                <SelectItem value="Diretor">Diretor</SelectItem>
                <SelectItem value="Gerente">Gerente</SelectItem>
                <SelectItem value="Coordenador">Coordenador</SelectItem>
                <SelectItem value="Analista Senior">Analista Sênior</SelectItem>
                <SelectItem value="Analista Pleno">Analista Pleno</SelectItem>
                <SelectItem value="Analista Junior">Analista Júnior</SelectItem>
                <SelectItem value="Assistente">Assistente</SelectItem>
                <SelectItem value="Consultor">Consultor</SelectItem>
                <SelectItem value="Especialista">Especialista</SelectItem>
                <SelectItem value="Supervisor">Supervisor</SelectItem>
                <SelectItem value="Empreendedor">Empreendedor / Fundador</SelectItem>
                <SelectItem value="Freelancer">Freelancer / Autônomo</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
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
            <Select onValueChange={(value) => form.setValue('company_size', value)} defaultValue={form.getValues('company_size')}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Solo">Apenas eu (Solo)</SelectItem>
                <SelectItem value="2-5">2-5 funcionários</SelectItem>
                <SelectItem value="6-10">6-10 funcionários</SelectItem>
                <SelectItem value="11-25">11-25 funcionários</SelectItem>
                <SelectItem value="26-50">26-50 funcionários</SelectItem>
                <SelectItem value="51-100">51-100 funcionários</SelectItem>
                <SelectItem value="101-250">101-250 funcionários</SelectItem>
                <SelectItem value="251-500">251-500 funcionários</SelectItem>
                <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                <SelectItem value="1001-5000">1001-5000 funcionários</SelectItem>
                <SelectItem value="5000+">Mais de 5000 funcionários</SelectItem>
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
            <Select onValueChange={(value) => form.setValue('annual_revenue', value)} defaultValue={form.getValues('annual_revenue')}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione o faturamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-50k">Até R$ 50 mil</SelectItem>
                <SelectItem value="50k-100k">R$ 50 mil - R$ 100 mil</SelectItem>
                <SelectItem value="100k-250k">R$ 100 mil - R$ 250 mil</SelectItem>
                <SelectItem value="250k-500k">R$ 250 mil - R$ 500 mil</SelectItem>
                <SelectItem value="500k-1m">R$ 500 mil - R$ 1 milhão</SelectItem>
                <SelectItem value="1m-2m">R$ 1 milhão - R$ 2 milhões</SelectItem>
                <SelectItem value="2m-5m">R$ 2 milhões - R$ 5 milhões</SelectItem>
                <SelectItem value="5m-10m">R$ 5 milhões - R$ 10 milhões</SelectItem>
                <SelectItem value="10m-50m">R$ 10 milhões - R$ 50 milhões</SelectItem>
                <SelectItem value="50m-100m">R$ 50 milhões - R$ 100 milhões</SelectItem>
                <SelectItem value="100m+">Mais de R$ 100 milhões</SelectItem>
                <SelectItem value="nao-divulgar">Prefiro não divulgar</SelectItem>
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
          <Select onValueChange={(value) => form.setValue('company_sector', value)} defaultValue={form.getValues('company_sector')}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tecnologia">Tecnologia / Software</SelectItem>
              <SelectItem value="E-commerce">E-commerce / Varejo Online</SelectItem>
              <SelectItem value="Varejo">Varejo / Comércio</SelectItem>
              <SelectItem value="Saúde">Saúde / Medicina</SelectItem>
              <SelectItem value="Educação">Educação / Ensino</SelectItem>
              <SelectItem value="Financeiro">Financeiro / Bancos</SelectItem>
              <SelectItem value="Seguros">Seguros</SelectItem>
              <SelectItem value="Consultoria">Consultoria</SelectItem>
              <SelectItem value="Marketing">Marketing / Publicidade</SelectItem>
              <SelectItem value="Advocacia">Advocacia / Jurídico</SelectItem>
              <SelectItem value="Contabilidade">Contabilidade</SelectItem>
              <SelectItem value="Imobiliário">Imobiliário</SelectItem>
              <SelectItem value="Construção">Construção Civil</SelectItem>
              <SelectItem value="Indústria">Indústria / Manufatura</SelectItem>
              <SelectItem value="Logística">Logística / Transporte</SelectItem>
              <SelectItem value="Alimentação">Alimentação / Restaurantes</SelectItem>
              <SelectItem value="Turismo">Turismo / Hospitalidade</SelectItem>
              <SelectItem value="Beleza">Beleza / Estética</SelectItem>
              <SelectItem value="Fitness">Fitness / Esportes</SelectItem>
              <SelectItem value="Agricultura">Agricultura / Agronegócio</SelectItem>
              <SelectItem value="ONG">ONG / Terceiro Setor</SelectItem>
              <SelectItem value="Governo">Governo / Público</SelectItem>
              <SelectItem value="Energia">Energia / Utilities</SelectItem>
              <SelectItem value="Telecomunicações">Telecomunicações</SelectItem>
              <SelectItem value="Mídia">Mídia / Entretenimento</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.company_sector && (
            <p className="text-sm text-destructive">
              {form.formState.errors.company_sector.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Principal Desafio da Empresa (opcional)
          </Label>
          <Select onValueChange={(value) => form.setValue('main_challenge', value)} defaultValue={form.getValues('main_challenge')}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Selecione o principal desafio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aumentar vendas">Aumentar vendas / Faturamento</SelectItem>
              <SelectItem value="Reduzir custos">Reduzir custos operacionais</SelectItem>
              <SelectItem value="Melhorar eficiência">Melhorar eficiência dos processos</SelectItem>
              <SelectItem value="Automatizar processos">Automatizar processos manuais</SelectItem>
              <SelectItem value="Atrair clientes">Atrair novos clientes</SelectItem>
              <SelectItem value="Reter clientes">Reter clientes existentes</SelectItem>
              <SelectItem value="Melhorar atendimento">Melhorar atendimento ao cliente</SelectItem>
              <SelectItem value="Contratar talentos">Contratar e reter talentos</SelectItem>
              <SelectItem value="Capacitar equipe">Capacitar a equipe</SelectItem>
              <SelectItem value="Transformação digital">Transformação digital</SelectItem>
              <SelectItem value="Presença online">Melhorar presença online</SelectItem>
              <SelectItem value="Gestão financeira">Melhorar gestão financeira</SelectItem>
              <SelectItem value="Expandir negócio">Expandir o negócio</SelectItem>
              <SelectItem value="Inovação">Inovar produtos/serviços</SelectItem>
              <SelectItem value="Competitividade">Aumentar competitividade</SelectItem>
              <SelectItem value="Compliance">Questões regulatórias/compliance</SelectItem>
              <SelectItem value="Sustentabilidade">Sustentabilidade</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
    </div>
  );
};