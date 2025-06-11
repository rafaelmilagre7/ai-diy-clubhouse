
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, DollarSign, Users, Briefcase, Sparkles } from 'lucide-react';
import { OnboardingStepProps } from '../types/onboardingTypes';
import { AIMessageDisplay } from '../components/AIMessageDisplay';
import { useAIMessageGeneration } from '../hooks/useAIMessageGeneration';

const OnboardingStep2: React.FC<OnboardingStepProps> = ({
  data,
  onUpdateData,
  memberType,
  getFieldError
}) => {
  const { generateMessage, isGenerating, generatedMessage } = useAIMessageGeneration();
  const [shouldGenerateMessage, setShouldGenerateMessage] = useState(false);

  const setores = [
    'Tecnologia', 'E-commerce', 'Saúde', 'Educação', 'Financeiro', 'Marketing', 
    'Consultoria', 'Imobiliário', 'Varejo', 'Indústria', 'Serviços', 'Agronegócio', 'Outros'
  ];

  const tamanhoEmpresas = [
    'Freelancer/Autônomo', 'Microempresa (até 9 funcionários)', 
    'Pequena empresa (10-49 funcionários)', 'Média empresa (50-249 funcionários)', 
    'Grande empresa (250+ funcionários)'
  ];

  const faturamentos = [
    'Até R$ 81.000/ano', 'R$ 81.000 - R$ 360.000/ano', 
    'R$ 360.000 - R$ 4.8M/ano', 'R$ 4.8M - R$ 300M/ano', 'Acima de R$ 300M/ano'
  ];

  const cargos = [
    'CEO/Fundador', 'Diretor', 'Gerente', 'Coordenador', 'Analista', 
    'Especialista', 'Consultor', 'Autônomo', 'Outros'
  ];

  // Gerar mensagem quando dados empresariais estiverem preenchidos
  useEffect(() => {
    const hasBusinessInfo = data.businessSector && data.position;
    if (hasBusinessInfo && !generatedMessage && !isGenerating && !shouldGenerateMessage) {
      setShouldGenerateMessage(true);
      generateMessage(data, memberType);
    }
  }, [data.businessSector, data.position, generatedMessage, isGenerating, shouldGenerateMessage, generateMessage, data, memberType]);

  const handleInputChange = (field: string, value: string) => {
    onUpdateData({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto bg-viverblue/20 rounded-full flex items-center justify-center">
          <Building2 className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Perfil Empresarial
        </h2>
        <p className="text-slate-300">
          Entenda melhor seu contexto profissional e empresarial para personalizar suas soluções
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Coluna Esquerda - Empresa */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Dados da Empresa */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Dados da Empresa</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName" className="text-slate-200">Nome da empresa</Label>
                  <Input
                    id="companyName"
                    value={data.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="companyWebsite" className="text-slate-200">Website da empresa</Label>
                  <Input
                    id="companyWebsite"
                    value={data.companyWebsite || ''}
                    onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    placeholder="https://suaempresa.com.br"
                    className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="businessSector" className="text-slate-200">Setor/Segmento *</Label>
                  <Select value={data.businessSector || ''} onValueChange={(value) => handleInputChange('businessSector', value)}>
                    <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                      <SelectValue placeholder="Selecione o setor" />
                    </SelectTrigger>
                    <SelectContent>
                      {setores.map((setor) => (
                        <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldError?.('businessSector') && (
                    <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Tamanho da Empresa */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Porte da Empresa</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="companySize" className="text-slate-200">Tamanho da empresa</Label>
                  <Select value={data.companySize || ''} onValueChange={(value) => handleInputChange('companySize', value)}>
                    <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                      <SelectValue placeholder="Selecione o tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {tamanhoEmpresas.map((tamanho) => (
                        <SelectItem key={tamanho} value={tamanho}>{tamanho}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="annualRevenue" className="text-slate-200">Faturamento anual</Label>
                  <Select value={data.annualRevenue || ''} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
                    <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                      <SelectValue placeholder="Selecione o faturamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {faturamentos.map((faturamento) => (
                        <SelectItem key={faturamento} value={faturamento}>{faturamento}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Coluna Direita - Cargo e Posição */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Seu Papel */}
          <Card className="p-6 bg-[#1A1E2E]/60 backdrop-blur-sm border-white/10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Seu Papel</h3>
              </div>

              <div>
                <Label htmlFor="position" className="text-slate-200">Cargo/Posição *</Label>
                <Select value={data.position || ''} onValueChange={(value) => handleInputChange('position', value)}>
                  <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                    <SelectValue placeholder="Selecione seu cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError?.('position') && (
                  <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Mensagem da IA */}
          {(generatedMessage || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-viverblue" />
                <h3 className="text-lg font-semibold text-white">Insights para seu Negócio</h3>
              </div>
              <AIMessageDisplay 
                message={generatedMessage || ''} 
                isLoading={isGenerating}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingStep2;
