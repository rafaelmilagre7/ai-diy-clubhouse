
import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Briefcase, Users, DollarSign, Globe } from 'lucide-react';
import { OnboardingData } from '../types/onboardingTypes';

interface OnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  onNext: () => Promise<void>;
  onPrev: () => void;
  memberType: 'club' | 'formacao';
  validationErrors: Array<{ field: string; message: string }>;
  getFieldError: (field: string) => string | undefined;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  data,
  onUpdateData,
  onNext,
  onPrev,
  memberType,
  validationErrors,
  getFieldError
}) => {
  const companySizeOptions = [
    { value: 'micro', label: 'Microempresa (1-9 funcionários)' },
    { value: 'small', label: 'Pequena empresa (10-49 funcionários)' },
    { value: 'medium', label: 'Média empresa (50-249 funcionários)' },
    { value: 'large', label: 'Grande empresa (250+ funcionários)' },
    { value: 'enterprise', label: 'Corporação/Multinacional (1000+ funcionários)' }
  ];

  const businessSectorOptions = [
    { value: 'technology', label: 'Tecnologia e Software' },
    { value: 'financial', label: 'Serviços Financeiros' },
    { value: 'healthcare', label: 'Saúde e Medicina' },
    { value: 'education', label: 'Educação e Treinamento' },
    { value: 'retail', label: 'Varejo e E-commerce' },
    { value: 'manufacturing', label: 'Manufatura e Indústria' },
    { value: 'consulting', label: 'Consultoria e Serviços' },
    { value: 'marketing', label: 'Marketing e Publicidade' },
    { value: 'construction', label: 'Construção e Imobiliário' },
    { value: 'agriculture', label: 'Agronegócio' },
    { value: 'logistics', label: 'Logística e Transporte' },
    { value: 'energy', label: 'Energia e Sustentabilidade' },
    { value: 'entertainment', label: 'Entretenimento e Mídia' },
    { value: 'food', label: 'Alimentação e Bebidas' },
    { value: 'automotive', label: 'Automotivo' },
    { value: 'other', label: 'Outro' }
  ];

  const positionOptions = [
    // C-Level & Executivos
    { category: 'C-Level & Executivos', value: 'ceo', label: 'CEO/Presidente' },
    { category: 'C-Level & Executivos', value: 'cfo', label: 'CFO/Diretor Financeiro' },
    { category: 'C-Level & Executivos', value: 'coo', label: 'COO/Diretor de Operações' },
    { category: 'C-Level & Executivos', value: 'cto', label: 'CTO/Diretor de Tecnologia' },
    { category: 'C-Level & Executivos', value: 'chro', label: 'CHRO/Diretor de RH' },
    { category: 'C-Level & Executivos', value: 'cmo', label: 'CMO/Diretor de Marketing' },
    { category: 'C-Level & Executivos', value: 'cpo', label: 'CPO/Diretor de Produto' },
    { category: 'C-Level & Executivos', value: 'cso', label: 'CSO/Diretor de Vendas' },
    { category: 'C-Level & Executivos', value: 'cio', label: 'CIO/Diretor de TI' },
    
    // Diretoria & VP
    { category: 'Diretoria & VP', value: 'vp', label: 'Vice-Presidente' },
    { category: 'Diretoria & VP', value: 'regional-director', label: 'Diretor Regional' },
    { category: 'Diretoria & VP', value: 'area-director', label: 'Diretor de Área' },
    { category: 'Diretoria & VP', value: 'commercial-director', label: 'Diretor Comercial' },
    { category: 'Diretoria & VP', value: 'operations-director', label: 'Diretor de Operações' },
    
    // Gerência
    { category: 'Gerência', value: 'general-manager', label: 'Gerente Geral' },
    { category: 'Gerência', value: 'project-manager', label: 'Gerente de Projeto' },
    { category: 'Gerência', value: 'product-manager', label: 'Gerente de Produto' },
    { category: 'Gerência', value: 'marketing-manager', label: 'Gerente de Marketing' },
    { category: 'Gerência', value: 'sales-manager', label: 'Gerente de Vendas' },
    { category: 'Gerência', value: 'operations-manager', label: 'Gerente de Operações' },
    { category: 'Gerência', value: 'it-manager', label: 'Gerente de TI' },
    { category: 'Gerência', value: 'hr-manager', label: 'Gerente de RH' },
    { category: 'Gerência', value: 'finance-manager', label: 'Gerente Financeiro' },
    
    // Coordenação & Supervisão
    { category: 'Coordenação & Supervisão', value: 'coordinator', label: 'Coordenador de Área' },
    { category: 'Coordenação & Supervisão', value: 'supervisor', label: 'Supervisor' },
    { category: 'Coordenação & Supervisão', value: 'team-lead', label: 'Team Lead' },
    { category: 'Coordenação & Supervisão', value: 'scrum-master', label: 'Scrum Master' },
    { category: 'Coordenação & Supervisão', value: 'tech-lead', label: 'Tech Lead' },
    
    // Especialistas & Analistas
    { category: 'Especialistas & Analistas', value: 'senior-analyst', label: 'Analista Sênior' },
    { category: 'Especialistas & Analistas', value: 'business-analyst', label: 'Analista de Negócios' },
    { category: 'Especialistas & Analistas', value: 'data-analyst', label: 'Analista de Dados' },
    { category: 'Especialistas & Analistas', value: 'systems-analyst', label: 'Analista de Sistemas' },
    { category: 'Especialistas & Analistas', value: 'specialist', label: 'Especialista' },
    { category: 'Especialistas & Analistas', value: 'consultant', label: 'Consultor' },
    { category: 'Especialistas & Analistas', value: 'solution-architect', label: 'Arquiteto de Soluções' },
    { category: 'Especialistas & Analistas', value: 'product-owner', label: 'Product Owner' },
    { category: 'Especialistas & Analistas', value: 'ux-designer', label: 'UX/UI Designer' },
    { category: 'Especialistas & Analistas', value: 'data-scientist', label: 'Cientista de Dados' },
    { category: 'Especialistas & Analistas', value: 'developer', label: 'Desenvolvedor' },
    
    // Outros
    { category: 'Outros', value: 'entrepreneur', label: 'Empresário/Sócio' },
    { category: 'Outros', value: 'freelancer', label: 'Freelancer/Autônomo' },
    { category: 'Outros', value: 'student', label: 'Estudante' },
    { category: 'Outros', value: 'intern', label: 'Estagiário' },
    { category: 'Outros', value: 'other', label: 'Outro' }
  ];

  const annualRevenueOptions = [
    { value: 'startup', label: 'Startup/Pré-receita' },
    { value: 'under-100k', label: 'Até R$ 100 mil' },
    { value: '100k-500k', label: 'R$ 100 mil - R$ 500 mil' },
    { value: '500k-1m', label: 'R$ 500 mil - R$ 1 milhão' },
    { value: '1m-5m', label: 'R$ 1 milhão - R$ 5 milhões' },
    { value: '5m-10m', label: 'R$ 5 milhões - R$ 10 milhões' },
    { value: '10m-50m', label: 'R$ 10 milhões - R$ 50 milhões' },
    { value: 'over-50m', label: 'Acima de R$ 50 milhões' },
    { value: 'prefer-not-say', label: 'Prefiro não informar' }
  ];

  // Group positions by category
  const groupedPositions = positionOptions.reduce((groups, position) => {
    const category = position.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(position);
    return groups;
  }, {} as Record<string, typeof positionOptions>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-2xl flex items-center justify-center">
          <Building2 className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-white">
          Perfil Empresarial
        </h2>
        <p className="text-neutral-300 text-lg max-w-2xl mx-auto">
          Conte-nos sobre sua empresa e posição para personalizarmos sua experiência
        </p>
      </div>

      <div className="grid gap-6">
        {/* Nome da Empresa */}
        <Card className="bg-[#151823] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-5 h-5 text-viverblue" />
              <Label htmlFor="companyName" className="text-white font-semibold">
                Nome da Empresa *
              </Label>
            </div>
            <Input
              id="companyName"
              value={data.companyName || ''}
              onChange={(e) => onUpdateData({ companyName: e.target.value })}
              placeholder="Digite o nome da sua empresa"
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
            />
            {getFieldError('companyName') && (
              <p className="text-red-400 text-sm mt-2">{getFieldError('companyName')}</p>
            )}
          </CardContent>
        </Card>

        {/* Website da Empresa */}
        <Card className="bg-[#151823] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-viverblue" />
              <Label htmlFor="companyWebsite" className="text-white font-semibold">
                Website da Empresa
              </Label>
            </div>
            <Input
              id="companyWebsite"
              value={data.companyWebsite || ''}
              onChange={(e) => onUpdateData({ companyWebsite: e.target.value })}
              placeholder="https://www.exemplo.com.br"
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500"
            />
          </CardContent>
        </Card>

        {/* Setor e Tamanho */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-[#151823] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-5 h-5 text-viverblue" />
                <Label className="text-white font-semibold">Setor *</Label>
              </div>
              <Select 
                value={data.businessSector || ''} 
                onValueChange={(value) => onUpdateData({ businessSector: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {businessSectorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('businessSector') && (
                <p className="text-red-400 text-sm mt-2">{getFieldError('businessSector')}</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#151823] border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-viverblue" />
                <Label className="text-white font-semibold">Tamanho da Empresa *</Label>
              </div>
              <Select 
                value={data.companySize || ''} 
                onValueChange={(value) => onUpdateData({ companySize: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError('companySize') && (
                <p className="text-red-400 text-sm mt-2">{getFieldError('companySize')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Faturamento Anual */}
        <Card className="bg-[#151823] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-5 h-5 text-viverblue" />
              <Label className="text-white font-semibold">Faturamento Anual *</Label>
            </div>
            <Select 
              value={data.annualRevenue || ''} 
              onValueChange={(value) => onUpdateData({ annualRevenue: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a faixa de faturamento" />
              </SelectTrigger>
              <SelectContent>
                {annualRevenueOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('annualRevenue') && (
              <p className="text-red-400 text-sm mt-2">{getFieldError('annualRevenue')}</p>
            )}
          </CardContent>
        </Card>

        {/* Cargo/Posição */}
        <Card className="bg-[#151823] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="w-5 h-5 text-viverblue" />
              <Label className="text-white font-semibold">Seu Cargo/Posição *</Label>
            </div>
            <Select 
              value={data.position || ''} 
              onValueChange={(value) => onUpdateData({ position: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu cargo" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {Object.entries(groupedPositions).map(([category, positions]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                    {positions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('position') && (
              <p className="text-red-400 text-sm mt-2">{getFieldError('position')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep2;
