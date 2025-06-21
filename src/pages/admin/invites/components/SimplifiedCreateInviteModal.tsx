
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MessageSquare, User, UserCheck, Phone, AlertTriangle, Send } from 'lucide-react';
import { useRoles } from '@/hooks/admin/useRoles';
import { CreateInviteParams } from '@/hooks/admin/invites/types';

interface SimplifiedCreateInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (params: CreateInviteParams) => Promise<void>;
  isLoading: boolean;
}

export const SimplifiedCreateInviteModal = ({ 
  open, 
  onOpenChange, 
  onCreate, 
  isLoading 
}: SimplifiedCreateInviteModalProps) => {
  const { roles, loading: rolesLoading } = useRoles();
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateInviteParams>>({
    email: '',
    roleId: '',
    userName: '',
    whatsappNumber: '',
    channels: ['email'],
    expiresIn: '7 days',
    notes: ''
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isWhatsAppEnabled = formData.channels?.includes('whatsapp') || false;

  // Real-time validation
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email':
        if (!value?.trim()) {
          newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'roleId':
        if (!value?.trim()) {
          newErrors.roleId = 'Função é obrigatória';
        } else {
          delete newErrors.roleId;
        }
        break;
      
      case 'userName':
        if (isWhatsAppEnabled && !value?.trim()) {
          newErrors.userName = 'Nome é obrigatório para WhatsApp';
        } else {
          delete newErrors.userName;
        }
        break;
      
      case 'whatsappNumber':
        if (isWhatsAppEnabled && value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s/g, ''))) {
          newErrors.whatsappNumber = 'Número do WhatsApp inválido';
        } else {
          delete newErrors.whatsappNumber;
        }
        break;
    }

    setErrors(newErrors);
  };

  const updateFormData = (updates: Partial<CreateInviteParams>) => {
    console.log('🔄 Atualizando dados do formulário:', updates);
    const newData = { ...formData, ...updates };
    setFormData(newData);
    
    // Validate affected fields
    Object.keys(updates).forEach(field => {
      validateField(field, updates[field as keyof CreateInviteParams]);
    });

    // Re-validate userName when WhatsApp channel changes
    if (updates.channels) {
      validateField('userName', newData.userName);
    }
  };

  const handleChannelChange = (channel: 'email' | 'whatsapp', checked: boolean) => {
    let newChannels = formData.channels || ['email'];
    
    if (checked) {
      if (!newChannels.includes(channel)) {
        newChannels = [...newChannels, channel];
      }
    } else {
      newChannels = newChannels.filter(c => c !== channel);
    }
    
    // Ensure email is always included
    if (!newChannels.includes('email')) {
      newChannels.push('email');
    }

    console.log('📱 Canais alterados:', newChannels);
    updateFormData({ channels: newChannels });
  };

  const handleSubmit = async () => {
    console.log('🚀 Iniciando criação de convite com dados:', formData);
    
    // Final validation
    const requiredFields = ['email', 'roleId'];
    if (isWhatsAppEnabled) {
      requiredFields.push('userName');
    }

    const missingFields = requiredFields.filter(field => !formData[field as keyof CreateInviteParams]);
    
    if (missingFields.length > 0) {
      console.error('❌ Campos obrigatórios faltando:', missingFields);
      return;
    }

    if (Object.keys(errors).length > 0) {
      console.error('❌ Erros de validação:', errors);
      return;
    }

    try {
      await onCreate(formData as CreateInviteParams);
      console.log('✅ Convite criado com sucesso');
      
      // Reset form
      setFormData({
        email: '',
        roleId: '',
        userName: '',
        whatsappNumber: '',
        channels: ['email'],
        expiresIn: '7 days',
        notes: ''
      });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erro ao criar convite:', error);
    }
  };

  const isFormValid = () => {
    const hasRequiredFields = formData.email && formData.roleId;
    const hasUserNameIfWhatsApp = !isWhatsAppEnabled || formData.userName;
    const hasNoErrors = Object.keys(errors).length === 0;
    
    return hasRequiredFields && hasUserNameIfWhatsApp && hasNoErrors;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Criar Novo Convite
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card className="bg-[#151823] border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-[#0ABAB5]" />
                Informações do Convidado
              </CardTitle>
              <CardDescription>Dados básicos da pessoa que será convidada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-neutral-200">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@empresa.com"
                    value={formData.email || ''}
                    onChange={(e) => updateFormData({ email: e.target.value })}
                    className={`bg-[#1A1E2E] border-neutral-700 text-white ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-neutral-200">
                    Nome da Pessoa {isWhatsAppEnabled && <span className="text-red-400">*</span>}
                  </Label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Nome completo"
                    value={formData.userName || ''}
                    onChange={(e) => updateFormData({ userName: e.target.value })}
                    className={`bg-[#1A1E2E] border-neutral-700 text-white ${
                      errors.userName ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.userName && (
                    <p className="text-sm text-red-400">{errors.userName}</p>
                  )}
                  {isWhatsAppEnabled && (
                    <p className="text-xs text-neutral-400">
                      Nome obrigatório para personalização do WhatsApp
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-neutral-200">
                  Função/Permissão *
                </Label>
                <Select 
                  value={formData.roleId || ''} 
                  onValueChange={(value) => updateFormData({ roleId: value })}
                >
                  <SelectTrigger className={`bg-[#1A1E2E] border-neutral-700 text-white ${
                    errors.roleId ? 'border-red-500' : ''
                  }`}>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1E2E] border-neutral-700">
                    {rolesLoading ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : (
                      roles.map((role) => (
                        <SelectItem 
                          key={role.id} 
                          value={role.id}
                          className="text-white hover:bg-neutral-700"
                        >
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.roleId && (
                  <p className="text-sm text-red-400">{errors.roleId}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Canais de Envio */}
          <Card className="bg-[#151823] border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="h-5 w-5 text-[#0ABAB5]" />
                Canais de Envio
              </CardTitle>
              <CardDescription>Escolha como enviar o convite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* Email Channel */}
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-neutral-700 bg-[#1A1E2E]">
                  <Checkbox
                    id="email-channel"
                    checked={formData.channels?.includes('email') ?? true}
                    onCheckedChange={(checked) => handleChannelChange('email', checked as boolean)}
                    disabled
                  />
                  <div className="flex-1">
                    <Label htmlFor="email-channel" className="text-neutral-200 flex items-center gap-2 cursor-pointer">
                      <Mail className="h-4 w-4 text-[#0ABAB5]" />
                      Email (obrigatório)
                    </Label>
                    <p className="text-sm text-neutral-400">
                      Envio por email sempre incluído
                    </p>
                  </div>
                </div>

                {/* WhatsApp Channel */}
                <div className={`flex items-start space-x-3 p-3 rounded-lg border bg-[#1A1E2E] ${
                  isWhatsAppEnabled ? 'border-[#0ABAB5]/30' : 'border-neutral-700'
                }`}>
                  <Checkbox
                    id="whatsapp-channel"
                    checked={isWhatsAppEnabled}
                    onCheckedChange={(checked) => handleChannelChange('whatsapp', checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="whatsapp-channel" className="text-neutral-200 flex items-center gap-2 cursor-pointer">
                      <MessageSquare className="h-4 w-4 text-[#0ABAB5]" />
                      WhatsApp
                    </Label>
                    <p className="text-sm text-neutral-400">
                      Envio adicional via WhatsApp
                    </p>
                    
                    {isWhatsAppEnabled && (
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="whatsapp-number" className="text-neutral-200 text-sm">
                          Número do WhatsApp
                        </Label>
                        <Input
                          id="whatsapp-number"
                          type="tel"
                          placeholder="+55 (11) 99999-9999"
                          value={formData.whatsappNumber || ''}
                          onChange={(e) => updateFormData({ whatsappNumber: e.target.value })}
                          className={`bg-[#1A1E2E] border-neutral-700 text-white ${
                            errors.whatsappNumber ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.whatsappNumber && (
                          <p className="text-sm text-red-400">{errors.whatsappNumber}</p>
                        )}
                        <p className="text-xs text-neutral-400">
                          Formato: +55 (código do país)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Warning */}
              {isWhatsAppEnabled && !formData.userName && (
                <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-orange-400 font-medium text-sm">Nome obrigatório</p>
                    <p className="text-orange-300 text-sm">
                      Preencha o nome da pessoa para enviar via WhatsApp
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações Adicionais */}
          <Card className="bg-[#151823] border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Configurações Opcionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expires" className="text-neutral-200 text-sm">
                    Expira em
                  </Label>
                  <Select 
                    value={formData.expiresIn || '7 days'} 
                    onValueChange={(value) => updateFormData({ expiresIn: value })}
                  >
                    <SelectTrigger className="bg-[#1A1E2E] border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1E2E] border-neutral-700">
                      <SelectItem value="1 day" className="text-white">1 dia</SelectItem>
                      <SelectItem value="3 days" className="text-white">3 dias</SelectItem>
                      <SelectItem value="7 days" className="text-white">7 dias</SelectItem>
                      <SelectItem value="30 days" className="text-white">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-neutral-200 text-sm">
                  Observações
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o convite..."
                  value={formData.notes || ''}
                  onChange={(e) => updateFormData({ notes: e.target.value })}
                  className="bg-[#1A1E2E] border-neutral-700 text-white resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Debug Info (desenvolvimento) */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="bg-yellow-900/20 border-yellow-600/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs text-yellow-300 overflow-auto">
                  {JSON.stringify({ formData, errors, isFormValid: isFormValid() }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid()}
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/80 text-white"
            >
              {isLoading ? 'Criando...' : 'Criar e Enviar Convite'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
