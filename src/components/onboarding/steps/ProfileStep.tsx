
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building, Briefcase, Award } from 'lucide-react';

interface ProfileStepProps {
  data: any;
  onUpdate: (data: any) => void;
}

/**
 * Step de perfil profissional - FASE 5
 * Coleta informações básicas do usuário
 */
export const ProfileStep: React.FC<ProfileStepProps> = ({ data, onUpdate }) => {
  const handleInputChange = (field: string, value: string) => {
    onUpdate({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="w-12 h-12 text-viverblue mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Conte-nos sobre você</h2>
        <p className="text-gray-600">
          Essas informações nos ajudam a personalizar sua experiência na plataforma
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={data.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currentPosition">Cargo atual</Label>
              <Input
                id="currentPosition"
                placeholder="Ex: CEO, Gerente de Marketing, Consultor..."
                value={data.currentPosition || ''}
                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="experience">Nível de experiência com IA</Label>
              <Select 
                value={data.experience || ''} 
                onValueChange={(value) => handleInputChange('experience', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Iniciante - Nunca usei IA</SelectItem>
                  <SelectItem value="intermediate">Intermediário - Uso básico (ChatGPT, etc)</SelectItem>
                  <SelectItem value="advanced">Avançado - Integro IA no trabalho</SelectItem>
                  <SelectItem value="expert">Expert - Desenvolvo soluções de IA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="w-5 h-5" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Nome da empresa</Label>
              <Input
                id="companyName"
                placeholder="Nome da sua empresa"
                value={data.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="companySize">Tamanho da empresa</Label>
              <Select 
                value={data.companySize || ''} 
                onValueChange={(value) => handleInputChange('companySize', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Startup (1-10 funcionários)</SelectItem>
                  <SelectItem value="small">Pequena (11-50 funcionários)</SelectItem>
                  <SelectItem value="medium">Média (51-200 funcionários)</SelectItem>
                  <SelectItem value="large">Grande (201-1000 funcionários)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (1000+ funcionários)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redes Sociais (Opcional) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5" />
            Redes Sociais <span className="text-sm font-normal text-gray-500">(Opcional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/seuperfil"
              value={data.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              placeholder="@seuusuario"
              value={data.instagram || ''}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
