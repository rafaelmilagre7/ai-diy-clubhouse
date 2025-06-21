
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, MessageSquare, Phone, Info } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';

interface InviteChannelsStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteChannelsStep = ({ formData, onUpdate }: InviteChannelsStepProps) => {
  const handleChannelChange = (channel: 'email' | 'whatsapp', checked: boolean) => {
    const currentChannels = formData.channels || ['email'];
    
    if (checked) {
      if (!currentChannels.includes(channel)) {
        onUpdate({ channels: [...currentChannels, channel] });
      }
    } else {
      if (channel === 'email') {
        // Email é obrigatório
        return;
      }
      onUpdate({ channels: currentChannels.filter(c => c !== channel) });
    }
  };

  const emailEnabled = formData.channels?.includes('email') ?? true;
  const whatsappEnabled = formData.channels?.includes('whatsapp') ?? false;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Canais de Comunicação</h3>
        <p className="text-sm text-gray-600 mt-1">
          Escolha como enviar o convite para o usuário
        </p>
      </div>

      <div className="grid gap-6">
        {/* Email */}
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                Email
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="email-channel"
                  checked={emailEnabled}
                  onCheckedChange={(checked) => handleChannelChange('email', checked as boolean)}
                  disabled={true} // Email sempre obrigatório
                />
                <Label htmlFor="email-channel" className="text-sm font-medium cursor-pointer">
                  Ativo
                </Label>
              </div>
            </CardTitle>
            <CardDescription>
              Envio via email (obrigatório)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm text-gray-600">
                ✅ Email configurado: <span className="font-mono text-xs">{formData.email || 'Não informado'}</span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Template profissional com logo da marca
              </p>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className={`border-2 transition-all ${
          whatsappEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                whatsappEnabled ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                WhatsApp
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="whatsapp-channel"
                  checked={whatsappEnabled}
                  onCheckedChange={(checked) => handleChannelChange('whatsapp', checked as boolean)}
                />
                <Label htmlFor="whatsapp-channel" className="text-sm font-medium cursor-pointer">
                  Ativo
                </Label>
              </div>
            </CardTitle>
            <CardDescription>
              Envio via WhatsApp (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {whatsappEnabled && (
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium">
                  Número do WhatsApp *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="whatsapp"
                    placeholder="+55 11 99999-9999"
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => onUpdate({ whatsappNumber: e.target.value })}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Formato: +55 11 99999-9999 (com código do país)
                </p>
              </div>
            )}
            
            {!whatsappEnabled && (
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  Marque a opção acima para enviar também via WhatsApp
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações importantes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                Informações sobre os canais:
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>Email:</strong> Sempre obrigatório, usado para login e recuperação</li>
                <li>• <strong>WhatsApp:</strong> Opcional, útil para comunicação mais direta</li>
                <li>• O convite será enviado nos canais selecionados simultaneamente</li>
                <li>• Se o WhatsApp estiver ativo, o nome da pessoa é obrigatório</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
