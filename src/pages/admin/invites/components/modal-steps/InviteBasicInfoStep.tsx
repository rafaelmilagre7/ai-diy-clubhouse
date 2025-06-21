
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { Mail, UserCheck } from 'lucide-react';
import { useRoles } from '@/hooks/admin/useRoles';

interface InviteBasicInfoStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteBasicInfoStep = ({ formData, onUpdate }: InviteBasicInfoStepProps) => {
  const { roles, loading } = useRoles();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">Informações do Convidado</h3>
        <p className="text-neutral-400">Insira os dados básicos para o convite</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-neutral-200 flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#0ABAB5]" />
            Email do convidado
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="exemplo@empresa.com"
            value={formData.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-[#0ABAB5] focus-visible:border-[#0ABAB5]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-neutral-200 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#0ABAB5]" />
            Função/Permissão
          </Label>
          <Select value={formData.roleId || ''} onValueChange={(value) => onUpdate({ roleId: value })}>
            <SelectTrigger className="bg-[#1A1E2E] border-neutral-700 text-white focus:ring-[#0ABAB5] focus:border-[#0ABAB5]">
              <SelectValue placeholder="Selecione uma função" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1E2E] border-neutral-700">
              {loading ? (
                <SelectItem value="loading" disabled>Carregando...</SelectItem>
              ) : (
                roles.map((role) => (
                  <SelectItem 
                    key={role.id} 
                    value={role.id}
                    className="text-white hover:bg-neutral-700 focus:bg-neutral-700"
                  >
                    {role.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
