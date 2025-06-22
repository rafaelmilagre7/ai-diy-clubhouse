
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { Mail, UserCheck, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRoles } from '@/hooks/admin/useRoles';
import { parseEmailPattern, findRelatedEmails } from '@/utils/emailUtils';
import { supabase } from '@/integrations/supabase/client';

interface InviteBasicInfoStepProps {
  formData: Partial<CreateInviteParams>;
  onUpdate: (updates: Partial<CreateInviteParams>) => void;
}

export const InviteBasicInfoStep = ({ formData, onUpdate }: InviteBasicInfoStepProps) => {
  const { roles, loading } = useRoles();
  const [emailValidation, setEmailValidation] = useState<{
    isChecking: boolean;
    isValid: boolean;
    message?: string;
    relatedEmails?: string[];
  }>({ isChecking: false, isValid: true });

  const validateEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailValidation({ isChecking: false, isValid: true });
      return;
    }

    setEmailValidation({ isChecking: true, isValid: true });

    try {
      const { baseEmail } = parseEmailPattern(email);
      
      // Buscar emails relacionados
      const { data: profiles } = await supabase
        .from('profiles')
        .select('email')
        .or(`email.like.${baseEmail.replace('@', '+%@')},email.eq.${baseEmail}`);
      
      const { data: invites } = await supabase
        .from('invites')
        .select('email')
        .or(`email.like.${baseEmail.replace('@', '+%@')},email.eq.${baseEmail}`);
      
      const allEmails = [
        ...(profiles?.map(p => p.email) || []),
        ...(invites?.map(i => i.email) || [])
      ].filter(Boolean);
      
      const relatedEmails = findRelatedEmails(allEmails, email);
      
      if (relatedEmails.length > 0) {
        setEmailValidation({
          isChecking: false,
          isValid: false,
          message: `Email base já existe com ${relatedEmails.length} variação(ões)`,
          relatedEmails
        });
      } else {
        setEmailValidation({
          isChecking: false,
          isValid: true,
          message: 'Email disponível'
        });
      }
    } catch (error) {
      console.error('Erro ao validar email:', error);
      setEmailValidation({ isChecking: false, isValid: true });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        validateEmail(formData.email);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

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
            className={`bg-[#1A1E2E] border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-[#0ABAB5] focus-visible:border-[#0ABAB5] ${
              !emailValidation.isValid ? 'border-red-500' : ''
            }`}
          />
          
          {/* Status de validação do email */}
          {formData.email && (
            <div className="flex items-center gap-2 mt-2">
              {emailValidation.isChecking ? (
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <div className="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                  Verificando disponibilidade...
                </div>
              ) : emailValidation.isValid ? (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle className="h-3 w-3" />
                  {emailValidation.message}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    {emailValidation.message}
                  </div>
                  {emailValidation.relatedEmails && (
                    <div className="flex flex-wrap gap-1">
                      {emailValidation.relatedEmails.map((relatedEmail, index) => {
                        const { hasSuffix } = parseEmailPattern(relatedEmail);
                        return (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className={`text-xs ${hasSuffix ? 'bg-orange-100 border-orange-300' : 'bg-red-100 border-red-300'}`}
                          >
                            {hasSuffix ? '🔄' : '📧'} {relatedEmail}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="userName" className="text-neutral-200 flex items-center gap-2">
            <User className="h-4 w-4 text-[#0ABAB5]" />
            Nome da pessoa
            <span className="text-xs text-orange-400">(obrigatório para WhatsApp)</span>
          </Label>
          <Input
            id="userName"
            type="text"
            placeholder="Nome completo da pessoa"
            value={formData.userName || ''}
            onChange={(e) => onUpdate({ userName: e.target.value })}
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
