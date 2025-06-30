
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
            <Input
              id="position"
              value={data.position || ''}
              onChange={(e) => handleInputChange('position', e.target.value)}
              placeholder="CEO, Diretor, Gerente, Coordenador..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-viverblue"
            />
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
                <SelectItem value="tecnologia" className="text-white hover:bg-slate-700">Tecnologia</SelectItem>
                <SelectItem value="saude" className="text-white hover:bg-slate-700">Saúde</SelectItem>
                <SelectItem value="educacao" className="text-white hover:bg-slate-700">Educação</SelectItem>
                <SelectItem value="varejo" className="text-white hover:bg-slate-700">Varejo</SelectItem>
                <SelectItem value="servicos" className="text-white hover:bg-slate-700">Serviços</SelectItem>
                <SelectItem value="financeiro" className="text-white hover:bg-slate-700">Financeiro</SelectItem>
                <SelectItem value="industrial" className="text-white hover:bg-slate-700">Industrial</SelectItem>
                <SelectItem value="consultoria" className="text-white hover:bg-slate-700">Consultoria</SelectItem>
                <SelectItem value="agronegocio" className="text-white hover:bg-slate-700">Agronegócio</SelectItem>
                <SelectItem value="construcao" className="text-white hover:bg-slate-700">Construção</SelectItem>
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
              Porte da Empresa onde trabalha
            </Label>
            <Select 
              value={data.companySize || ''} 
              onValueChange={(value) => handleInputChange('companySize', value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-viverblue">
                <SelectValue placeholder="Selecione o porte da empresa" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="1-10" className="text-white hover:bg-slate-700">Microempresa (1-10 funcionários)</SelectItem>
                <SelectItem value="11-50" className="text-white hover:bg-slate-700">Pequena empresa (11-50 funcionários)</SelectItem>
                <SelectItem value="51-200" className="text-white hover:bg-slate-700">Média empresa (51-200 funcionários)</SelectItem>
                <SelectItem value="201-500" className="text-white hover:bg-slate-700">Grande empresa (201-500 funcionários)</SelectItem>
                <SelectItem value="500+" className="text-white hover:bg-slate-700">Corporação (+500 funcionários)</SelectItem>
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
