
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LocationSelector } from '@/components/onboarding/components/LocationSelector';
import { BirthDateSelector } from '@/components/onboarding/components/BirthDateSelector';
import { WhatsAppInput } from '@/components/onboarding/components/WhatsAppInput';
import { OnboardingData } from '@/components/onboarding/types/onboardingTypes';

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

  const handleStateChange = (state: string) => {
    onUpdateData({ state, city: '' }); // Limpar cidade quando estado muda
  };

  const handleCityChange = (city: string) => {
    onUpdateData({ city });
  };

  const handleBirthDateChange = (day: string, month: string, year: string) => {
    onUpdateData({ 
      birthDay: day, 
      birthMonth: month, 
      birthYear: year,
      birthDate: day && month && year ? `${year}-${month}-${day}` : ''
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1f2e] border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-xl">
            🏢 Perfil Empresarial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Nome da Empresa */}
          <div>
            <Label htmlFor="companyName" className="text-slate-200">
              Nome da Empresa *
            </Label>
            <Input
              id="companyName"
              value={data.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Digite o nome da sua empresa"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
            {getFieldError?.('companyName') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('companyName')}</p>
            )}
          </div>

          {/* Website da Empresa */}
          <div>
            <Label htmlFor="companyWebsite" className="text-slate-200">
              Website da Empresa
            </Label>
            <Input
              id="companyWebsite"
              type="url"
              value={data.companyWebsite || ''}
              onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
              placeholder="https://www.suaempresa.com"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Setor da Empresa */}
          <div>
            <Label htmlFor="businessSector" className="text-slate-200">
              Setor da Empresa *
            </Label>
            <Select value={data.businessSector || ''} onValueChange={(value) => handleInputChange('businessSector', value)}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o setor da sua empresa" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="tecnologia" className="text-white hover:bg-white/10">Tecnologia</SelectItem>
                <SelectItem value="saude" className="text-white hover:bg-white/10">Saúde</SelectItem>
                <SelectItem value="educacao" className="text-white hover:bg-white/10">Educação</SelectItem>
                <SelectItem value="financeiro" className="text-white hover:bg-white/10">Financeiro</SelectItem>
                <SelectItem value="varejo" className="text-white hover:bg-white/10">Varejo</SelectItem>
                <SelectItem value="industria" className="text-white hover:bg-white/10">Indústria</SelectItem>
                <SelectItem value="servicos" className="text-white hover:bg-white/10">Serviços</SelectItem>
                <SelectItem value="consultoria" className="text-white hover:bg-white/10">Consultoria</SelectItem>
                <SelectItem value="marketing" className="text-white hover:bg-white/10">Marketing</SelectItem>
                <SelectItem value="agronegocio" className="text-white hover:bg-white/10">Agronegócio</SelectItem>
                <SelectItem value="outro" className="text-white hover:bg-white/10">Outro</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('businessSector') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('businessSector')}</p>
            )}
          </div>

          {/* Tamanho da Empresa */}
          <div>
            <Label htmlFor="companySize" className="text-slate-200">
              Tamanho da Empresa *
            </Label>
            <Select value={data.companySize || ''} onValueChange={(value) => handleInputChange('companySize', value)}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione o tamanho da sua empresa" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="mei" className="text-white hover:bg-white/10">MEI (1 pessoa)</SelectItem>
                <SelectItem value="micro" className="text-white hover:bg-white/10">Microempresa (2-9 funcionários)</SelectItem>
                <SelectItem value="pequena" className="text-white hover:bg-white/10">Pequena (10-49 funcionários)</SelectItem>
                <SelectItem value="media" className="text-white hover:bg-white/10">Média (50-249 funcionários)</SelectItem>
                <SelectItem value="grande" className="text-white hover:bg-white/10">Grande (250+ funcionários)</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('companySize') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('companySize')}</p>
            )}
          </div>

          {/* Faturamento Anual */}
          <div>
            <Label htmlFor="annualRevenue" className="text-slate-200">
              Faturamento Anual *
            </Label>
            <Select value={data.annualRevenue || ''} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione a faixa de faturamento" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="ate-81k" className="text-white hover:bg-white/10">Até R$ 81.000</SelectItem>
                <SelectItem value="81k-360k" className="text-white hover:bg-white/10">R$ 81.001 - R$ 360.000</SelectItem>
                <SelectItem value="360k-4-8mi" className="text-white hover:bg-white/10">R$ 360.001 - R$ 4,8 milhões</SelectItem>
                <SelectItem value="4-8mi-300mi" className="text-white hover:bg-white/10">R$ 4,8 milhões - R$ 300 milhões</SelectItem>
                <SelectItem value="acima-300mi" className="text-white hover:bg-white/10">Acima de R$ 300 milhões</SelectItem>
                <SelectItem value="nao-informar" className="text-white hover:bg-white/10">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('annualRevenue') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('annualRevenue')}</p>
            )}
          </div>

          {/* Cargo/Função */}
          <div>
            <Label htmlFor="position" className="text-slate-200">
              Cargo/Função *
            </Label>
            <Select value={data.position || ''} onValueChange={(value) => handleInputChange('position', value)}>
              <SelectTrigger className="mt-1 bg-[#151823] border-white/20 text-white">
                <SelectValue placeholder="Selecione seu cargo ou função" />
              </SelectTrigger>
              <SelectContent className="bg-[#151823] border-white/20">
                <SelectItem value="ceo" className="text-white hover:bg-white/10">CEO/Presidente</SelectItem>
                <SelectItem value="diretor" className="text-white hover:bg-white/10">Diretor(a)</SelectItem>
                <SelectItem value="gerente" className="text-white hover:bg-white/10">Gerente</SelectItem>
                <SelectItem value="coordenador" className="text-white hover:bg-white/10">Coordenador(a)</SelectItem>
                <SelectItem value="supervisor" className="text-white hover:bg-white/10">Supervisor(a)</SelectItem>
                <SelectItem value="analista" className="text-white hover:bg-white/10">Analista</SelectItem>
                <SelectItem value="consultor" className="text-white hover:bg-white/10">Consultor(a)</SelectItem>
                <SelectItem value="especialista" className="text-white hover:bg-white/10">Especialista</SelectItem>
                <SelectItem value="assistente" className="text-white hover:bg-white/10">Assistente</SelectItem>
                <SelectItem value="auxiliar" className="text-white hover:bg-white/10">Auxiliar</SelectItem>
                <SelectItem value="estagiario" className="text-white hover:bg-white/10">Estagiário(a)</SelectItem>
                <SelectItem value="freelancer" className="text-white hover:bg-white/10">Freelancer</SelectItem>
                <SelectItem value="autonomo" className="text-white hover:bg-white/10">Autônomo(a)</SelectItem>
                <SelectItem value="empreendedor" className="text-white hover:bg-white/10">Empreendedor(a)</SelectItem>
                <SelectItem value="proprietario" className="text-white hover:bg-white/10">Proprietário(a)</SelectItem>
                <SelectItem value="socio" className="text-white hover:bg-white/10">Sócio(a)</SelectItem>
                <SelectItem value="outro" className="text-white hover:bg-white/10">Outro</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError?.('position') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('position')}</p>
            )}
          </div>

          {/* Instagram */}
          <div>
            <Label htmlFor="instagram" className="text-slate-200">
              Instagram (opcional)
            </Label>
            <Input
              id="instagram"
              value={data.instagram || ''}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@seuusuario"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <Label htmlFor="linkedin" className="text-slate-200">
              LinkedIn (opcional)
            </Label>
            <Input
              id="linkedin"
              value={data.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/seuperfil"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
          </div>

          {/* Telefone/WhatsApp */}
          <div>
            <Label htmlFor="phone" className="text-slate-200">
              Telefone/WhatsApp *
            </Label>
            <WhatsAppInput
              value={data.phone || ''}
              onChange={(value) => handleInputChange('phone', value)}
              placeholder="(11) 99999-9999"
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400"
            />
            {getFieldError?.('phone') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('phone')}</p>
            )}
          </div>

          {/* Localização */}
          <LocationSelector
            selectedState={data.state || ''}
            selectedCity={data.city || ''}
            onStateChange={handleStateChange}
            onCityChange={handleCityChange}
            getFieldError={getFieldError}
          />

          {/* Data de Nascimento */}
          <BirthDateSelector
            birthDay={data.birthDay || ''}
            birthMonth={data.birthMonth || ''}
            birthYear={data.birthYear || ''}
            onChange={handleBirthDateChange}
            getFieldError={getFieldError}
          />

          {/* Curiosidade */}
          <div>
            <Label htmlFor="curiosity" className="text-slate-200">
              Conte uma curiosidade sobre você *
            </Label>
            <Textarea
              id="curiosity"
              value={data.curiosity || ''}
              onChange={(e) => handleInputChange('curiosity', e.target.value)}
              placeholder="Compartilhe algo interessante sobre você..."
              className="mt-1 bg-[#151823] border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
            />
            {getFieldError?.('curiosity') && (
              <p className="text-red-400 text-sm mt-1">{getFieldError('curiosity')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MockOnboardingStep2;
