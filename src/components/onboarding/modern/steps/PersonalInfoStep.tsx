
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuickOnboardingData } from '@/types/quickOnboarding';
import { User, Mail, Phone, Globe, Instagram, Linkedin } from 'lucide-react';

interface PersonalInfoStepProps {
  data: QuickOnboardingData;
  onUpdate: (field: string, value: any) => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ data, onUpdate }) => {
  const { personal_info } = data;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <User className="h-5 w-5 text-viverblue" />
          Informações Pessoais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome completo *</Label>
            <Input
              id="name"
              type="text"
              value={personal_info?.name || ''}
              onChange={(e) => onUpdate('name', e.target.value)}
              placeholder="Seu nome completo"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={personal_info?.email || ''}
              onChange={(e) => onUpdate('email', e.target.value)}
              placeholder="seu@email.com"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-white">WhatsApp *</Label>
            <div className="flex gap-2">
              <Select
                value={personal_info?.country_code || '+55'}
                onValueChange={(value) => onUpdate('country_code', value)}
              >
                <SelectTrigger className="w-24 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="+55">🇧🇷 +55</SelectItem>
                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                  <SelectItem value="+44">🇬🇧 +44</SelectItem>
                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="whatsapp"
                type="tel"
                value={personal_info?.whatsapp || ''}
                onChange={(e) => onUpdate('whatsapp', e.target.value)}
                placeholder="(11) 99999-9999"
                className="flex-1 bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date" className="text-white">Data de nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={personal_info?.birth_date || ''}
              onChange={(e) => onUpdate('birth_date', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="text-white">LinkedIn</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="linkedin_url"
                type="url"
                value={personal_info?.linkedin_url || ''}
                onChange={(e) => onUpdate('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram_url" className="text-white">Instagram</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="instagram_url"
                type="url"
                value={personal_info?.instagram_url || ''}
                onChange={(e) => onUpdate('instagram_url', e.target.value)}
                placeholder="@seu_perfil"
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="how_found_us" className="text-white">Como nos conheceu? *</Label>
          <Select
            value={personal_info?.how_found_us || ''}
            onValueChange={(value) => onUpdate('how_found_us', value)}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="indicacao">Indicação de amigo</SelectItem>
              <SelectItem value="evento">Evento</SelectItem>
              <SelectItem value="podcast">Podcast</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="referred_by" className="text-white">Quem te indicou? (opcional)</Label>
          <Input
            id="referred_by"
            type="text"
            value={personal_info?.referred_by || ''}
            onChange={(e) => onUpdate('referred_by', e.target.value)}
            placeholder="Nome da pessoa que te indicou"
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </CardContent>
    </Card>
  );
};
