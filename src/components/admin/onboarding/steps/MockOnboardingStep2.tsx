
import React from 'react';
import { motion } from 'framer-motion';
import { Building, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

interface MockOnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const jobRoles = [
  'CEO/Presidente',
  'COO/Diretor de Operações',
  'CTO/Diretor de Tecnologia',
  'CFO/Diretor Financeiro',
  'CMO/Diretor de Marketing',
  'CHRO/Diretor de RH',
  'Diretor Geral',
  'Diretor Comercial',
  'Diretor de Vendas',
  'Diretor de Produto',
  'Diretor de Inovação',
  'Gerente Geral',
  'Gerente de Operações',
  'Gerente de TI',
  'Gerente de Marketing',
  'Gerente de Vendas',
  'Gerente de RH',
  'Gerente de Produto',
  'Coordenador de TI',
  'Coordenador de Marketing',
  'Coordenador de Vendas',
  'Analista de Sistemas',
  'Analista de Marketing',
  'Analista de Dados',
  'Consultor',
  'Especialista em IA',
  'Desenvolvedor',
  'Designer',
  'Empreendedor/Sócio',
  'Freelancer/Autônomo',
  'Estudante',
  'Professor/Educador',
  'Pesquisador',
  'Outros'
];

const companySizes = [
  '1 colaborador (apenas eu)',
  '2-5 colaboradores',
  '6-10 colaboradores',
  '11-20 colaboradores',
  '21-50 colaboradores',
  '51-100 colaboradores',
  '101-250 colaboradores',
  '251-500 colaboradores',
  '501-1000 colaboradores',
  'Mais de 1000 colaboradores'
];

const annualRevenues = [
  'Até R$ 50.000',
  'R$ 50.001 - R$ 100.000',
  'R$ 100.001 - R$ 250.000',
  'R$ 250.001 - R$ 500.000',
  'R$ 500.001 - R$ 1 milhão',
  'R$ 1 milhão - R$ 2 milhões',
  'R$ 2 milhões - R$ 5 milhões',
  'R$ 5 milhões - R$ 10 milhões',
  'R$ 10 milhões - R$ 20 milhões',
  'R$ 20 milhões - R$ 50 milhões',
  'R$ 50 milhões - R$ 100 milhões',
  'Acima de R$ 100 milhões',
  'Prefiro não informar'
];

const MockOnboardingStep2: React.FC<MockOnboardingStep2Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Building className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Perfil Empresarial
        </h2>
        <p className="text-slate-400">
          Conte-nos sobre sua empresa e seu papel nela
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações da Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label htmlFor="company" className="text-slate-200 text-base font-medium">
                Nome da Empresa *
              </Label>
              <Input
                id="company"
                value={data.company || ''}
                onChange={(e) => onUpdateData({ company: e.target.value })}
                className="mt-2 bg-[#151823] border-white/20 text-white"
                placeholder="Digite o nome da sua empresa"
              />
              {getFieldError?.('company') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('company')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="jobRole" className="text-slate-200 text-base font-medium">
                Seu Cargo/Posição *
              </Label>
              <Select 
                value={data.jobRole || ''} 
                onValueChange={(value) => onUpdateData({ jobRole: value })}
              >
                <SelectTrigger className="mt-2 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {jobRoles.map((role) => (
                    <SelectItem key={role} value={role} className="text-white hover:bg-white/10">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('jobRole') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('jobRole')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Porte da Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Porte da Empresa</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Quantos colaboradores a empresa tem? *
              </Label>
              <Select 
                value={data.companySize || ''} 
                onValueChange={(value) => onUpdateData({ companySize: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o número de colaboradores" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size} className="text-white hover:bg-white/10">
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('companySize') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('companySize')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Faturamento Anual *
              </Label>
              <Select 
                value={data.annualRevenue || ''} 
                onValueChange={(value) => onUpdateData({ annualRevenue: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a faixa de faturamento" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {annualRevenues.map((revenue) => (
                    <SelectItem key={revenue} value={revenue} className="text-white hover:bg-white/10">
                      {revenue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('annualRevenue') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('annualRevenue')}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Segmento da Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Segmento</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Qual o segmento da sua empresa? *
              </Label>
              <Input
                value={data.businessSegment || ''}
                onChange={(e) => onUpdateData({ businessSegment: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white"
                placeholder="Ex: E-commerce, Consultoria, Tecnologia, Saúde..."
              />
              {getFieldError?.('businessSegment') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('businessSegment')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Descreva brevemente o que sua empresa faz
              </Label>
              <Textarea
                value={data.companyDescription || ''}
                onChange={(e) => onUpdateData({ companyDescription: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500 min-h-[100px]"
                placeholder="Conte um pouco sobre os produtos/serviços da sua empresa..."
              />
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep2;
