
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { Building, Briefcase, Users, TrendingUp, Globe, Target } from 'lucide-react';

interface ProfessionalInfoStepProps {
  data: QuickOnboardingData;
  onUpdate: (field: string, value: any) => void;
}

export const ProfessionalInfoStep: React.FC<ProfessionalInfoStepProps> = ({ data, onUpdate }) => {
  const { professional_info } = data;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building className="h-5 w-5 text-viverblue" />
          Informações Profissionais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name" className="text-white">Nome da empresa *</Label>
            <Input
              id="company_name"
              type="text"
              value={professional_info?.company_name || ''}
              onChange={(e) => onUpdate('company_name', e.target.value)}
              placeholder="Nome da sua empresa"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">Seu cargo *</Label>
            <Input
              id="role"
              type="text"
              value={professional_info?.role || ''}
              onChange={(e) => onUpdate('role', e.target.value)}
              placeholder="Ex: CEO, Diretor, Gerente..."
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_size" className="text-white">Tamanho da empresa *</Label>
            <Select
              value={professional_info?.company_size || ''}
              onValueChange={(value) => onUpdate('company_size', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="1-10">1-10 funcionários</SelectItem>
                <SelectItem value="11-50">11-50 funcionários</SelectItem>
                <SelectItem value="51-200">51-200 funcionários</SelectItem>
                <SelectItem value="201-500">201-500 funcionários</SelectItem>
                <SelectItem value="501-1000">501-1000 funcionários</SelectItem>
                <SelectItem value="1000+">Mais de 1000 funcionários</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_segment" className="text-white">Segmento da empresa *</Label>
            <Select
              value={professional_info?.company_segment || ''}
              onValueChange={(value) => onUpdate('company_segment', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="varejo">Varejo</SelectItem>
                <SelectItem value="servicos">Serviços</SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="saude">Saúde</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="consultoria">Consultoria</SelectItem>
                <SelectItem value="industria">Indústria</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_revenue_range" className="text-white">Faturamento anual *</Label>
            <Select
              value={professional_info?.annual_revenue_range || ''}
              onValueChange={(value) => onUpdate('annual_revenue_range', value)}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="ate-100k">Até R$ 100 mil</SelectItem>
                <SelectItem value="100k-500k">R$ 100 mil - R$ 500 mil</SelectItem>
                <SelectItem value="500k-1m">R$ 500 mil - R$ 1 milhão</SelectItem>
                <SelectItem value="1m-5m">R$ 1 milhão - R$ 5 milhões</SelectItem>
                <SelectItem value="5m-10m">R$ 5 milhões - R$ 10 milhões</SelectItem>
                <SelectItem value="10m+">Mais de R$ 10 milhões</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website" className="text-white">Website da empresa</Label>
            <Input
              id="company_website"
              type="url"
              value={professional_info?.company_website || ''}
              onChange={(e) => onUpdate('company_website', e.target.value)}
              placeholder="https://www.suaempresa.com"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="main_challenge" className="text-white">Qual o principal desafio da sua empresa? *</Label>
          <Textarea
            id="main_challenge"
            value={professional_info?.main_challenge || ''}
            onChange={(e) => onUpdate('main_challenge', e.target.value)}
            placeholder="Descreva o principal desafio que sua empresa enfrenta atualmente..."
            className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
            required
          />
        </div>
      </CardContent>
    </Card>
  );
};
