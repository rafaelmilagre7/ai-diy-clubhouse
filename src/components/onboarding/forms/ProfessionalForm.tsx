
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OnboardingData, OnboardingFormData } from '@/types/onboarding';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface ProfessionalFormProps {
  data: OnboardingData | null;
  onSubmit: (data: Partial<OnboardingFormData>) => Promise<boolean>;
  isSaving: boolean;
}

export const ProfessionalForm: React.FC<ProfessionalFormProps> = ({ data, onSubmit, isSaving }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Partial<OnboardingFormData>>({
    defaultValues: {
      company_name: data?.company_name || '',
      company_size: data?.company_size || '',
      company_sector: data?.company_sector || '',
      company_website: data?.company_website || '',
      current_position: data?.current_position || '',
      annual_revenue: data?.annual_revenue || '',
    }
  });

  const companySizes = [
    { value: "1-10", label: "1-10 funcionários" },
    { value: "11-50", label: "11-50 funcionários" },
    { value: "51-200", label: "51-200 funcionários" },
    { value: "201-500", label: "201-500 funcionários" },
    { value: "501-1000", label: "501-1000 funcionários" },
    { value: "1001+", label: "Mais de 1000 funcionários" },
  ];

  const sectors = [
    { value: "tecnologia", label: "Tecnologia / TI" },
    { value: "inteligencia-artificial", label: "Inteligência Artificial" },
    { value: "educacao", label: "Educação" },
    { value: "saude", label: "Saúde" },
    { value: "financas", label: "Financeiro" },
    { value: "varejo", label: "E-commerce / Varejo" },
    { value: "servicos", label: "Serviços Profissionais" },
    { value: "marketing", label: "Marketing / Publicidade" },
    { value: "industria", label: "Manufatura / Indústria" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "construcao", label: "Construção Civil" },
    { value: "imobiliario", label: "Imobiliário" },
    { value: "logistica", label: "Transporte / Logística" },
    { value: "agronegocio", label: "Agronegócio" },
    { value: "energia", label: "Energia / Sustentabilidade" },
    { value: "juridico", label: "Jurídico" },
    { value: "rh", label: "Recursos Humanos / Recrutamento" },
    { value: "consultoria", label: "Consultoria" },
    { value: "governo", label: "Governo / Setor Público" },
    { value: "outros", label: "Outro" },
  ];

  const positions = [
    { value: "ceo", label: "CEO" },
    { value: "founder", label: "Founder" },
    { value: "socio", label: "Sócio" },
    { value: "diretor-executivo", label: "Diretor(a) Executivo(a)" },
    { value: "diretor-operacoes", label: "Diretor(a) de Operações (COO)" },
    { value: "diretor-financeiro", label: "Diretor(a) Financeiro(a) (CFO)" },
    { value: "diretor-marketing", label: "Diretor(a) de Marketing (CMO)" },
    { value: "diretor-tecnologia", label: "Diretor(a) de Tecnologia (CTO)" },
    { value: "gerente-projetos", label: "Gerente de Projetos" },
    { value: "gerente-marketing", label: "Gerente de Marketing" },
    { value: "gerente-vendas", label: "Gerente de Vendas" },
    { value: "analista", label: "Analista" },
    { value: "desenvolvedor", label: "Desenvolvedor(a)" },
    { value: "designer", label: "Designer" },
    { value: "consultor", label: "Consultor(a)" },
    { value: "freelancer", label: "Freelancer" },
    { value: "outro", label: "Outro" },
  ];

  const revenueOptions = [
    { value: "ate100k", label: "Até R$ 100 mil" },
    { value: "100k-500k", label: "R$ 100 mil a R$ 500 mil" },
    { value: "500k-1m", label: "R$ 500 mil a R$ 1 milhão" },
    { value: "1m-5m", label: "R$ 1 milhão a R$ 5 milhões" },
    { value: "5m-10m", label: "R$ 5 milhões a R$ 10 milhões" },
    { value: "10m-50m", label: "R$ 10 milhões a R$ 50 milhões" },
    { value: "50m-100m", label: "R$ 50 milhões a R$ 100 milhões" },
    { value: "mais100m", label: "Mais de R$ 100 milhões" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_name">Nome da Empresa <span className="text-red-500">*</span></Label>
            <Input
              id="company_name"
              placeholder="Nome da sua empresa"
              {...register('company_name', { required: 'Nome da empresa é obrigatório' })}
              className={errors.company_name ? 'border-red-500' : ''}
            />
            {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website">Website da Empresa</Label>
            <Input
              id="company_website"
              placeholder="www.suaempresa.com.br"
              {...register('company_website')}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company_size">Tamanho da Empresa <span className="text-red-500">*</span></Label>
            <Select 
              defaultValue={data?.company_size || ''} 
              onValueChange={(value) => setValue('company_size', value)}
            >
              <SelectTrigger id="company_size" className={errors.company_size ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tamanho da empresa" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.company_size && <p className="text-red-500 text-sm">{errors.company_size.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_sector">Setor de Atuação <span className="text-red-500">*</span></Label>
            <Select 
              defaultValue={data?.company_sector || ''} 
              onValueChange={(value) => setValue('company_sector', value)}
            >
              <SelectTrigger id="company_sector" className={errors.company_sector ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o setor de atuação" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.company_sector && <p className="text-red-500 text-sm">{errors.company_sector.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="current_position">Seu Cargo <span className="text-red-500">*</span></Label>
            <Select 
              defaultValue={data?.current_position || ''} 
              onValueChange={(value) => setValue('current_position', value)}
            >
              <SelectTrigger id="current_position" className={errors.current_position ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione seu cargo" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.current_position && <p className="text-red-500 text-sm">{errors.current_position.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_revenue">Faturamento Anual <span className="text-red-500">*</span></Label>
            <Select 
              defaultValue={data?.annual_revenue || ''} 
              onValueChange={(value) => setValue('annual_revenue', value)}
            >
              <SelectTrigger id="annual_revenue" className={errors.annual_revenue ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o faturamento anual" />
              </SelectTrigger>
              <SelectContent>
                {revenueOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.annual_revenue && <p className="text-red-500 text-sm">{errors.annual_revenue.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => navigate('/onboarding')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>
        
        <Button 
          type="submit" 
          disabled={isSaving}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSaving ? (
            "Salvando..."
          ) : (
            <>
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
