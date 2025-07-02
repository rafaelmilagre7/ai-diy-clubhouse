
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';
import { Briefcase } from 'lucide-react';

interface MockOnboardingStep2Props {
  data: OnboardingData;
  onUpdateData: (newData: Partial<OnboardingData>) => void;
  getFieldError?: (field: string) => string | undefined;
}

const MockOnboardingStep2: React.FC<MockOnboardingStep2Props> = ({
  data,
  onUpdateData,
  getFieldError
}) => {
  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    onUpdateData({ [field]: value });
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-viverblue" />
            Informações Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome da Empresa onde trabalha */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-slate-200 font-medium">
              Empresa onde trabalha
            </Label>
            <Input
              id="companyName"
              value={data.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Nome da empresa atual"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
          </div>

          {/* Cargo/Posição */}
          <div className="space-y-2">
            <Label htmlFor="position" className="text-slate-200 font-medium">
              Cargo/Posição *
            </Label>
            <Select 
              value={data.position || ''} 
              onValueChange={(value) => handleInputChange('position', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione seu cargo/posição" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="ceo" className="text-white hover:bg-slate-700">CEO</SelectItem>
                <SelectItem value="diretor" className="text-white hover:bg-slate-700">Diretor</SelectItem>
                <SelectItem value="gerente" className="text-white hover:bg-slate-700">Gerente</SelectItem>
                <SelectItem value="coordenador" className="text-white hover:bg-slate-700">Coordenador</SelectItem>
                <SelectItem value="analista" className="text-white hover:bg-slate-700">Analista</SelectItem>
                <SelectItem value="consultor" className="text-white hover:bg-slate-700">Consultor</SelectItem>
                <SelectItem value="empreendedor" className="text-white hover:bg-slate-700">Empreendedor</SelectItem>
                <SelectItem value="estudante" className="text-white hover:bg-slate-700">Estudante</SelectItem>
                <SelectItem value="outros" className="text-white hover:bg-slate-700">Outros</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('position') && (
              <p className="text-red-400 text-sm">{getFieldError('position')}</p>
            )}
          </div>

          {/* Setor de Atuação */}
          <div className="space-y-2">
            <Label htmlFor="businessSector" className="text-slate-200 font-medium">
              Setor de Atuação *
            </Label>
            <Select 
              value={data.businessSector || ''} 
              onValueChange={(value) => handleInputChange('businessSector', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione o setor principal" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="inteligencia-artificial" className="text-white hover:bg-slate-700">Inteligência Artificial</SelectItem>
                <SelectItem value="tecnologia" className="text-white hover:bg-slate-700">Tecnologia</SelectItem>
                <SelectItem value="marketing-digital" className="text-white hover:bg-slate-700">Marketing Digital</SelectItem>
                <SelectItem value="e-commerce" className="text-white hover:bg-slate-700">E-commerce</SelectItem>
                <SelectItem value="financeiro" className="text-white hover:bg-slate-700">Financeiro</SelectItem>
                <SelectItem value="saude" className="text-white hover:bg-slate-700">Saúde</SelectItem>
                <SelectItem value="educacao" className="text-white hover:bg-slate-700">Educação</SelectItem>
                <SelectItem value="consultoria" className="text-white hover:bg-slate-700">Consultoria</SelectItem>
                <SelectItem value="juridico" className="text-white hover:bg-slate-700">Jurídico</SelectItem>
                <SelectItem value="recursos-humanos" className="text-white hover:bg-slate-700">Recursos Humanos</SelectItem>
                <SelectItem value="varejo" className="text-white hover:bg-slate-700">Varejo</SelectItem>
                <SelectItem value="servicos" className="text-white hover:bg-slate-700">Serviços</SelectItem>
                <SelectItem value="industrial" className="text-white hover:bg-slate-700">Industrial</SelectItem>
                <SelectItem value="logistica" className="text-white hover:bg-slate-700">Logística</SelectItem>
                <SelectItem value="imobiliario" className="text-white hover:bg-slate-700">Imobiliário</SelectItem>
                <SelectItem value="alimenticio" className="text-white hover:bg-slate-700">Alimentício</SelectItem>
                <SelectItem value="energia" className="text-white hover:bg-slate-700">Energia</SelectItem>
                <SelectItem value="telecomunicacoes" className="text-white hover:bg-slate-700">Telecomunicações</SelectItem>
                <SelectItem value="agronegocio" className="text-white hover:bg-slate-700">Agronegócio</SelectItem>
                <SelectItem value="construcao" className="text-white hover:bg-slate-700">Construção</SelectItem>
                <SelectItem value="governo" className="text-white hover:bg-slate-700">Governo</SelectItem>
                <SelectItem value="ongs" className="text-white hover:bg-slate-700">ONGs</SelectItem>
                <SelectItem value="outros" className="text-white hover:bg-slate-700">Outros</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('businessSector') && (
              <p className="text-red-400 text-sm">{getFieldError('businessSector')}</p>
            )}
          </div>

          {/* Porte da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="companySize" className="text-slate-200 font-medium">
              Número de Funcionários da Empresa
            </Label>
            <Select 
              value={data.companySize || ''} 
              onValueChange={(value) => handleInputChange('companySize', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione o número de funcionários" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="1" className="text-white hover:bg-slate-700">1 funcionário</SelectItem>
                <SelectItem value="2-5" className="text-white hover:bg-slate-700">2-5 funcionários</SelectItem>
                <SelectItem value="6-10" className="text-white hover:bg-slate-700">6-10 funcionários</SelectItem>
                <SelectItem value="11-25" className="text-white hover:bg-slate-700">11-25 funcionários</SelectItem>
                <SelectItem value="26-50" className="text-white hover:bg-slate-700">26-50 funcionários</SelectItem>
                <SelectItem value="51-100" className="text-white hover:bg-slate-700">51-100 funcionários</SelectItem>
                <SelectItem value="101-250" className="text-white hover:bg-slate-700">101-250 funcionários</SelectItem>
                <SelectItem value="251-500" className="text-white hover:bg-slate-700">251-500 funcionários</SelectItem>
                <SelectItem value="501-1000" className="text-white hover:bg-slate-700">501-1000 funcionários</SelectItem>
                <SelectItem value="1001+" className="text-white hover:bg-slate-700">1001+ funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Faturamento Anual da Empresa */}
          <div className="space-y-2">
            <Label htmlFor="annualRevenue" className="text-slate-200 font-medium">
              Faturamento Anual da Empresa
            </Label>
            <Select 
              value={data.annualRevenue || ''} 
              onValueChange={(value) => handleInputChange('annualRevenue', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione o faturamento anual" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="ate-100k" className="text-white hover:bg-slate-700">Até R$ 100 mil</SelectItem>
                <SelectItem value="100k-500k" className="text-white hover:bg-slate-700">R$ 100 mil - R$ 500 mil</SelectItem>
                <SelectItem value="500k-1m" className="text-white hover:bg-slate-700">R$ 500 mil - R$ 1 milhão</SelectItem>
                <SelectItem value="1m-5m" className="text-white hover:bg-slate-700">R$ 1 milhão - R$ 5 milhões</SelectItem>
                <SelectItem value="5m-10m" className="text-white hover:bg-slate-700">R$ 5 milhões - R$ 10 milhões</SelectItem>
                <SelectItem value="10m-25m" className="text-white hover:bg-slate-700">R$ 10 milhões - R$ 25 milhões</SelectItem>
                <SelectItem value="25m-50m" className="text-white hover:bg-slate-700">R$ 25 milhões - R$ 50 milhões</SelectItem>
                <SelectItem value="50m-100m" className="text-white hover:bg-slate-700">R$ 50 milhões - R$ 100 milhões</SelectItem>
                <SelectItem value="100m-500m" className="text-white hover:bg-slate-700">R$ 100 milhões - R$ 500 milhões</SelectItem>
                <SelectItem value="500m+" className="text-white hover:bg-slate-700">Acima de R$ 500 milhões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Website da Empresa (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="companyWebsite" className="text-slate-200 font-medium">
              Website da Empresa
            </Label>
            <Input
              id="companyWebsite"
              value={data.companyWebsite || ''}
              onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
              placeholder="https://www.empresa.com.br"
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep2;
