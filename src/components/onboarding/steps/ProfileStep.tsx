
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Building, TrendingUp } from 'lucide-react';

interface ProfileStepProps {
  onDataChange: (data: any) => void;
  data?: any;
}

/**
 * Step de perfil profissional do onboarding
 * FASE 3: Coleta de informações básicas do usuário
 */
export const ProfileStep: React.FC<ProfileStepProps> = ({ onDataChange, data = {} }) => {
  const updateField = (field: string, value: string) => {
    onDataChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Conte-nos sobre você</h2>
        <p className="text-gray-600">
          Essas informações nos ajudam a personalizar sua experiência
        </p>
      </div>

      <div className="space-y-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-viverblue" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={data.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Como você gostaria de ser chamado?"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="currentPosition">Cargo/Posição atual</Label>
              <Input
                id="currentPosition"
                value={data.currentPosition || ''}
                onChange={(e) => updateField('currentPosition', e.target.value)}
                placeholder="Ex: CEO, Diretor de Marketing, Freelancer..."
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5 text-viverblue" />
              Informações Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome da empresa (opcional)</Label>
              <Input
                id="companyName"
                value={data.companyName || ''}
                onChange={(e) => updateField('companyName', e.target.value)}
                placeholder="Sua empresa ou 'Autônomo/Freelancer'"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Tamanho da empresa</Label>
              <Select value={data.companySize || ''} onValueChange={(value) => updateField('companySize', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o porte da empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup (1-10 pessoas)</SelectItem>
                  <SelectItem value="small">Pequena (11-50 pessoas)</SelectItem>
                  <SelectItem value="medium">Média (51-200 pessoas)</SelectItem>
                  <SelectItem value="large">Grande (201-1000 pessoas)</SelectItem>
                  <SelectItem value="enterprise">Corporação (1000+ pessoas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Nível de Experiência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-viverblue" />
              Experiência com IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Qual seu nível de experiência com IA?</Label>
              <Select value={data.experience || ''} onValueChange={(value) => updateField('experience', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante - Novo no assunto</SelectItem>
                  <SelectItem value="intermediate">Intermediário - Já uso algumas ferramentas</SelectItem>
                  <SelectItem value="advanced">Avançado - Experiente em várias áreas</SelectItem>
                  <SelectItem value="expert">Expert - Implemento soluções complexas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Redes Sociais (Opcional) */}
        <Card className="border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="text-base text-gray-700">
              Redes Sociais (Opcional)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={data.linkedin || ''}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/seuperfil"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={data.instagram || ''}
                onChange={(e) => updateField('instagram', e.target.value)}
                placeholder="@seuinstagram"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
