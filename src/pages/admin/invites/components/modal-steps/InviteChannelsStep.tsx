
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { Mail, MessageSquare, Phone, AlertTriangle } from 'lucide-react';

interface InviteChannelsStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteChannelsStep = ({ formData, onUpdate }: InviteChannelsStepProps) => {
  const channels = formData.channels || ['email'];
  const hasWhatsApp = channels.includes('whatsapp');

  const handleChannelChange = (channel: 'email' | 'whatsapp', checked: boolean) => {
    if (checked) {
      onUpdate({ channels: [...channels, channel] });
    } else {
      onUpdate({ channels: channels.filter(c => c !== channel) });
    }
  };

  // Validar se userName está preenchido quando WhatsApp é selecionado
  const isWhatsAppValidationError = hasWhatsApp && (!formData.userName || formData.userName.trim() === '');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">Canais de Envio</h3>
        <p className="text-neutral-400">Escolha como enviar o convite</p>
      </div>

      {isWhatsAppValidationError && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-orange-400 font-medium">Campo obrigatório</p>
            <p className="text-orange-300 text-sm">
              Para enviar convites via WhatsApp, é necessário preencher o nome da pessoa na etapa anterior.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 rounded-lg border border-neutral-700 bg-[#151823]">
            <Checkbox
              id="email"
              checked={channels.includes('email')}
              onCheckedChange={(checked) => handleChannelChange('email', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="email" className="text-neutral-200 flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4 text-[#0ABAB5]" />
                Email
              </Label>
              <p className="text-sm text-neutral-400 mt-1">
                Enviar convite por email (recomendado)
              </p>
            </div>
          </div>

          <div className={`flex items-start space-x-3 p-4 rounded-lg border bg-[#151823] ${
            isWhatsAppValidationError 
              ? 'border-orange-500/30 bg-orange-500/5' 
              : 'border-neutral-700'
          }`}>
            <Checkbox
              id="whatsapp"
              checked={hasWhatsApp}
              onCheckedChange={(checked) => handleChannelChange('whatsapp', checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="whatsapp" className="text-neutral-200 flex items-center gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4 text-[#0ABAB5]" />
                WhatsApp
                <span className="text-xs text-orange-400">*Nome obrigatório</span>
              </Label>
              <p className="text-sm text-neutral-400 mt-1">
                Enviar convite via WhatsApp
              </p>
            </div>
          </div>
        </div>

        {hasWhatsApp && (
          <div className="space-y-2 p-4 rounded-lg border border-[#0ABAB5]/20 bg-[#0ABAB5]/5">
            <Label htmlFor="whatsapp-number" className="text-neutral-200 flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#0ABAB5]" />
              Número do WhatsApp
            </Label>
            <Input
              id="whatsapp-number"
              type="tel"
              placeholder="+55 (11) 99999-9999"
              value={formData.whatsappNumber || ''}
              onChange={(e) => onUpdate({ whatsappNumber: e.target.value })}
              className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-[#0ABAB5] focus-visible:border-[#0ABAB5]"
            />
            <p className="text-xs text-neutral-400">
              Inclua o código do país (+55 para Brasil)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
