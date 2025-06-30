import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingStepProps } from '../types/onboardingTypes';

const businessSectors = [
  'Tecnologia e Software',
  'E-commerce e Varejo Online',
  'Serviços Financeiros',
  'Saúde e Medicina',
  'Educação e Treinamento',
  'Marketing e Publicidade',
  'Consultoria Empresarial',
  'Recursos Humanos',
  'Logística e Transporte',
  'Manufatura e Indústria',
  'Imobiliário',
  'Alimentação e Bebidas',
  'Energia e Sustentabilidade',
  'Mídia e Entretenimento',
  'Turismo e Hospitalidade',
  'Agricultura e Agronegócios',
  'Construção Civil',
  'Telecomunicações',
  'Farmacêutico',
  'Automotivo',
  'Governo e Setor Público',
  'ONGs e Terceiro Setor',
  'Outros'
];

const positions = [
  // C-Level & Executivos
  'CEO/Presidente',
  'COO/Diretor de Operações',
  'CTO/Diretor de Tecnologia',
  'CFO/Diretor Financeiro',
  'CMO/Diretor de Marketing',
  'CHRO/Diretor de RH',
  'CDO/Diretor de Dados',
  'Sócio/Fundador',
  
  // Diretores & VPs
  'Vice-Presidente',
  'Diretor Executivo',
  'Diretor de Vendas',
  'Diretor de Produto',
  'Diretor de Inovação',
  'Diretor Comercial',
  'Diretor de Projetos',
  
  // Gerência
  'Gerente Geral',
  'Gerente de Vendas',
  'Gerente de Marketing',
  'Gerente de Operações',
  'Gerente de Produto',
  'Gerente de Projetos',
  'Gerente de TI',
  'Gerente de RH',
  'Gerente Financeiro',
  'Gerente de Qualidade',
  'Gerente de Compras',
  'Gerente de Logística',
  
  // Coordenação & Supervisão
  'Coordenador',
  'Supervisor',
  'Team Leader',
  'Scrum Master',
  'Product Owner',
  
  // Especialistas & Analistas
  'Analista',
  'Especialista',
  'Consultor',
  'Desenvolvedor',
  'Designer',
  'Engenheiro',
  'Arquiteto de Software',
  'Data Scientist',
  'Business Intelligence',
  'UX/UI Designer',
  'DevOps Engineer',
  
  // Outros
  'Freelancer/Autônomo',
  'Estudante',
  'Professor/Instrutor',
  'Pesquisador',
  'Outros'
];

const companySizes = [
  'Só eu (1 colaborador)',
  '2-5 colaboradores',
  '6-10 colaboradores',
  '11-25 colaboradores',
  '26-50 colaboradores',
  '51-100 colaboradores',
  '101-250 colaboradores',
  '251-500 colaboradores',
  '501-1.000 colaboradores',
  '1.001-2.500 colaboradores',
  '2.501-5.000 colaboradores',
  'Mais de 5.000 colaboradores'
];

const annualRevenues = [
  'Até R$ 100 mil',
  'R$ 100 mil - R$ 500 mil',
  'R$ 500 mil - R$ 1 milhão',
  'R$ 1 milhão - R$ 5 milhões',
  'R$ 5 milhões - R$ 10 milhões',
  'R$ 10 milhões - R$ 50 milhões',
  'R$ 50 milhões - R$ 100 milhões',
  'Acima de R$ 100 milhões',
  'Prefiro não informar'
];

const OnboardingStep2: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
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
          <Building2 className="w-8 h-8 text-viverblue" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Perfil Empresarial
        </h2>
        <p className="text-slate-400">
          Conte-nos sobre sua empresa e posição para personalizarmos sua experiência
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações da Empresa */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div>
              <Label className="text-slate-200 text-base font-medium">
                Nome da empresa {memberType === 'club' ? '(opcional)' : '*'}
              </Label>
              <Input
                type="text"
                value={data.companyName || ''}
                onChange={(e) => onUpdateData({ companyName: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                placeholder="Ex: Minha Empresa Ltda"
              />
              {getFieldError?.('companyName') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('companyName')}</p>
              )}
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Website da empresa (opcional)
              </Label>
              <Input
                type="url"
                value={data.companyWebsite || ''}
                onChange={(e) => onUpdateData({ companyWebsite: e.target.value })}
                className="mt-3 bg-[#151823] border-white/20 text-white placeholder:text-slate-500"
                placeholder="https://minhaempresa.com.br"
              />
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Setor de atuação *
              </Label>
              <Select 
                value={data.businessSector || ''} 
                onValueChange={(value) => onUpdateData({ businessSector: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20 max-h-60">
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
          </div>
        </Card>

        {/* Informações do Colaborador */}
        <Card className="p-6 bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-viverblue" />
              <h3 className="text-lg font-semibold text-white">Sobre você na empresa</h3>
            </div>

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Tamanho da empresa *
              </Label>
              <Select 
                value={data.companySize || ''} 
                onValueChange={(value) => onUpdateData({ companySize: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione o tamanho" />
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
                Faturamento anual aproximado *
              </Label>
              <Select 
                value={data.annualRevenue || ''} 
                onValueChange={(value) => onUpdateData({ annualRevenue: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione a faixa" />
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

            <div>
              <Label className="text-slate-200 text-base font-medium">
                Seu cargo/posição *
              </Label>
              <Select 
                value={data.position || ''} 
                onValueChange={(value) => onUpdateData({ position: value })}
              >
                <SelectTrigger className="mt-3 bg-[#151823] border-white/20 text-white">
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent className="bg-[#151823] border-white/20 max-h-60">
                  {positions.map((position) => (
                    <SelectItem key={position} value={position} className="text-white hover:bg-white/10">
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError?.('position') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default OnboardingStep2;
