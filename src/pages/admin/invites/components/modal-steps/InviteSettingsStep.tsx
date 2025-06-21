
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { Clock, FileText } from 'lucide-react';

interface InviteSettingsStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteSettingsStep = ({ formData, onUpdate }: InviteSettingsStepProps) => {
  const expirationOptions = [
    { value: '1 day', label: '1 dia' },
    { value: '3 days', label: '3 dias' },
    { value: '7 days', label: '7 dias' },
    { value: '15 days', label: '15 dias' },
    { value: '30 days', label: '30 dias' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">Configurações Avançadas</h3>
        <p className="text-neutral-400">Defina prazo e observações adicionais</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="expires-in" className="text-neutral-200 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#0ABAB5]" />
            Prazo de validade
          </Label>
          <Select 
            value={formData.expiresIn || '7 days'} 
            onValueChange={(value) => onUpdate({ expiresIn: value })}
          >
            <SelectTrigger className="bg-[#1A1E2E] border-neutral-700 text-white focus:ring-[#0ABAB5] focus:border-[#0ABAB5]">
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1E2E] border-neutral-700">
              {expirationOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-white hover:bg-neutral-700 focus:bg-neutral-700"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-400">
            Tempo que o convite ficará válido para aceite
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-neutral-200 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0ABAB5]" />
            Observações (opcional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Adicione observações ou instruções especiais para o convidado..."
            value={formData.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-[#0ABAB5] focus-visible:border-[#0ABAB5] min-h-[100px] resize-none"
          />
          <p className="text-xs text-neutral-400">
            Estas observações serão incluídas no email de convite
          </p>
        </div>
      </div>
    </div>
  );
};
