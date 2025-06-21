
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Mail, MessageSquare, Phone, Info, CheckCircle, Circle } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';

interface InviteChannelsStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteChannelsStep = ({ formData, onUpdate }: InviteChannelsStepProps) => {
  const handleChannelChange = (channel: 'email' | 'whatsapp', enabled: boolean) => {
    const currentChannels = formData.channels || ['email'];
    
    if (enabled) {
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">Canais de Comunicação</h3>
        <p className="text-gray-600">
          Escolha como enviar o convite para o usuário
        </p>
      </div>

      {/* Channel Selection */}
      <div className="space-y-6">
        {/* Email Channel */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-4 text-lg text-gray-900">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-green-700 font-normal">Canal principal (obrigatório)</div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <Switch
                  id="email-channel"
                  checked={emailEnabled}
                  disabled={true}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-white/60 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Email configurado: <span className="font-mono text-[#0ABAB5]">{formData.email || 'Não informado'}</span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Template profissional com identidade visual da marca
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Channel */}
        <Card className={`border-2 transition-all duration-300 shadow-sm ${
          whatsappEnabled 
            ? 'border-[#0ABAB5] bg-gradient-to-r from-cyan-50 to-teal-50' 
            : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-4 text-lg text-gray-900">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-colors duration-300 ${
                  whatsappEnabled ? 'bg-[#0ABAB5]' : 'bg-gray-400'
                }`}>
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-semibold">WhatsApp</div>
                  <div className={`text-sm font-normal ${whatsappEnabled ? 'text-teal-700' : 'text-gray-500'}`}>
                    Canal adicional (opcional)
                  </div>
                </div>
              </CardTitle>
              <div className="flex items-center gap-3">
                {whatsappEnabled ? (
                  <CheckCircle className="h-5 w-5 text-[#0ABAB5]" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
                <Switch
                  id="whatsapp-channel"
                  checked={whatsappEnabled}
                  onCheckedChange={(checked) => handleChannelChange('whatsapp', checked)}
                  className="data-[state=checked]:bg-[#0ABAB5]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {whatsappEnabled ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-900">
                    Número do WhatsApp *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="whatsapp"
                      placeholder="+55 11 99999-9999"
                      value={formData.whatsappNumber || ''}
                      onChange={(e) => onUpdate({ whatsappNumber: e.target.value })}
                      className="pl-10 border-gray-200 focus:border-[#0ABAB5] focus:ring-[#0ABAB5]/20 bg-white text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-gray-600">
                    Formato: +55 11 99999-9999 (com código do país)
                  </p>
                </div>
                
                <div className="bg-white/60 rounded-lg p-4 border border-teal-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[#0ABAB5]" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        WhatsApp ativo
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Mensagem personalizada será enviada via WhatsApp Business
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-200">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Ative o WhatsApp para envio adicional
                </p>
                <p className="text-xs text-gray-500">
                  Melhora a taxa de resposta em até 40%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-900">
                📋 Informações sobre os canais:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>Email:</strong> Sempre obrigatório para login e recuperação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span><strong>WhatsApp:</strong> Canal adicional para maior engajamento</span>
                  </li>
                </ul>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Convites são enviados simultaneamente nos canais ativos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>WhatsApp ativo requer número válido</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
