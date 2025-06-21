
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { useRoles } from '@/hooks/admin/useRoles';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  UserCheck, 
  FileText,
  CheckCircle 
} from 'lucide-react';

interface InvitePreviewStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InvitePreviewStep = ({ formData }: InvitePreviewStepProps) => {
  const { roles } = useRoles();
  const selectedRole = roles.find(role => role.id === formData.roleId);
  const channels = formData.channels || ['email'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-[#0ABAB5] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Revisar Convite</h3>
        <p className="text-neutral-400">Confirme os dados antes de enviar</p>
      </div>

      <div className="bg-[#151823] rounded-lg border border-neutral-700 p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-[#0ABAB5] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-300">Email</p>
              <p className="text-white">{formData.email}</p>
            </div>
          </div>

          {/* Função */}
          <div className="flex items-start gap-3">
            <UserCheck className="h-5 w-5 text-[#0ABAB5] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-300">Função</p>
              <p className="text-white">{selectedRole?.name || 'Não selecionada'}</p>
            </div>
          </div>

          {/* Canais */}
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-[#0ABAB5] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-300">Canais de Envio</p>
              <div className="flex gap-2 mt-1">
                {channels.includes('email') && (
                  <Badge variant="secondary" className="bg-[#0ABAB5]/20 text-[#0ABAB5] border-[#0ABAB5]/30">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Badge>
                )}
                {channels.includes('whatsapp') && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Badge>
                )}
              </div>
              {channels.includes('whatsapp') && formData.whatsappNumber && (
                <p className="text-sm text-neutral-400 mt-1">{formData.whatsappNumber}</p>
              )}
            </div>
          </div>

          {/* Prazo */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-[#0ABAB5] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-300">Prazo de Validade</p>
              <p className="text-white">{formData.expiresIn || '7 days'}</p>
            </div>
          </div>

          {/* Observações */}
          {formData.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-[#0ABAB5] mt-0.5" />
              <div>
                <p className="text-sm font-medium text-neutral-300">Observações</p>
                <p className="text-white text-sm leading-relaxed">{formData.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0ABAB5]/10 border border-[#0ABAB5]/20 rounded-lg p-4">
        <p className="text-sm text-[#0ABAB5] text-center">
          ✓ Tudo pronto! O convite será enviado imediatamente após a confirmação.
        </p>
      </div>
    </div>
  );
};
