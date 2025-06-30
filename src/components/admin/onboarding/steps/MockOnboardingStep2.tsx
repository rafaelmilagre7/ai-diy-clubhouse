
import React from 'react';
import { motion } from 'framer-motion';
import { Building, User, Briefcase, DollarSign } from 'lucide-react';
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
  'CEO/Fundador(a)',
  'Diretor(a) Executivo(a)',
  'Diretor(a) de Operações',
  'Diretor(a) de Marketing',
  'Diretor(a) de Vendas',
  'Diretor(a) de TI',
  'Gerente de Projetos',
  'Gerente de Marketing',
  'Gerente de Vendas',
  'Coordenador(a) de TI',
  'Analista de Sistemas',
  'Consultor(a)',
  'Empreendedor(a)',
  'Freelancer',
  'Outros'
];

const companySizes = [
  '1 funcionário (apenas eu)',
  '2-5 funcionários',
  '6-10 funcionários',
  '11-25 funcionários',
  '26-50 funcionários',
  '51-100 funcionários',
  '101-250 funcionários',
  '251-500 funcionários',
  '501-1000 funcionários',
  'Mais de 1000 funcionários'
];

const annualRevenues = [
  'Até R$ 50.000',
  'R$ 50.001 - R$ 100.000',
  'R$ 100.001 - R$ 250.000',
  'R$ 250.001 - R$ 500.000',
  'R$ 500.001 - R$ 1 milhão',
  'R$ 1 - R$ 2 milhões',
  'R$ 2 - R$ 5 milhões',
  'R$ 5 - R$ 10 milhões',
  'R$ 10 - R$ 20 milhões',
  'R$ 20 - R$ 50 milhões',
  'R$ 50 - R$ 100 milhões',
  'Acima de R$ 100 milhões',
  'Prefiro não informar'
];

const businessSectors = [
  'Tecnologia e Software',
  'E-commerce e Varejo',
  'Serviços Profissionais',
  'Saúde e Bem-estar',
  'Educação e Treinamento',
  'Marketing e Publicidade',
  'Finanças e Contabilidade',
  'Imobiliário',
  'Alimentação e Bebidas',
  'Moda e Beleza',
  'Turismo e Hospitalidade',
  'Construção e Engenharia',
  'Automotivo',
  'Energia',
  'Logística e Transporte',
  'Agricultura',
  'Indústria',
  'Outros'
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
              <Label htmlFor="companyName" className="text-slate-200 text-base font-medium">
                Nome da Empresa *
              </Label>
              <div className="relative mt-3">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="companyName"
                  value={data.companyName || ''}
                  onChange={(e) => onUpdateData({ companyName: e.target.value })}
                  className="pl-10 bg-[#151823] border-white/20 text-white"
                  placeholder="Nome da sua empresa"
                />
              </div>
              {getFieldError?.('companyName') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('companyName')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="position" className="text-slate-200 text-base font-medium">
                Seu Cargo/Função *
              </Label>
              <Select 
                value={data.position || ''} 
                onValueChange={(value) => onUpdateData({ position: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
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
              {getFieldError?.('position') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
              )}
            </div>

            <div>
              <Label htmlFor="companyWebsite" className="text-slate-200 text-base font-medium">
                Site da Empresa
              </Label>
              <Input
                id="companyWebsite"
                value={data.companyWebsite || ''}
                onChange={(e) => onUpdateData({ companyWebsite: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white"
                placeholder="https://minhaempresa.com.br"
              />
            </div>
          </div>
        </Card>

        {/* Detalhes do Negócio */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Detalhes do Negócio</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Setor de Atuação *
              </Label>
              <Select 
                value={data.businessSector || ''} 
                onValueChange={(value) => onUpdateData({ businessSector: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20">
                  {businessSectors.map((sector) => (
                    <SelectItem key={sector} value={sector} className="text-white hover:bg-white/10">
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('businessSector') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Tamanho da Empresa *
              </Label>
              <Select 
                value={data.companySize || ''} 
                onValueChange={(value) => onUpdateData({ companySize: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Número de funcionários" />
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
          </div>
        </Card>

        {/* Faturamento */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Faturamento</h3>
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
      </div>
    </motion.div>
  );
};

export default MockOnboardingStep2;
