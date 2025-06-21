
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Clock, User, Shield, FileText, CheckCircle } from 'lucide-react';
import { CreateInviteParams } from '@/hooks/admin/invites/types';
import { useRoles } from '@/hooks/admin/useRoles';

interface InvitePreviewStepProps {
  formData: Partial<CreateInviteParams>;
}

export const InvitePreviewStep = ({ formData }: InvitePreviewStepProps) => {
  const { roles } = useRoles();
  
  const selectedRole = roles.find(role => role.id === formData.roleId);
  const emailEnabled = formData.channels?.includes('email') ?? true;
  const whatsappEnabled = formData.channels?.includes('whatsapp') ?? false;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Confirmação do Convite</h3>
        <p className="text-sm text-gray-600 mt-1">
          Revise as informações antes de enviar
        </p>
      </div>

      {/* Status de Validação */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Convite pronto para envio!</p>
              <p className="text-sm text-green-700">Todas as informações necessárias foram preenchidas.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-viverblue" />
              Dados do Convidado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email:</span>
              <span className="font-mono text-sm">{formData.email}</span>
            </div>
            
            {formData.userName && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nome:</span>
                <span className="text-sm">{formData.userName}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Função:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {selectedRole?.name || 'Não selecionado'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Canais de Comunicação */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-5 w-5 text-viverblue" />
              Canais de Envio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className={`h-4 w-4 ${emailEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">Email</span>
              <Badge variant={emailEnabled ? "default" : "secondary"}>
                {emailEnabled ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              <MessageSquare className={`h-4 w-4 ${whatsappEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">WhatsApp</span>
              <Badge variant={whatsappEnabled ? "default" : "secondary"}>
                {whatsappEnabled ? 'Ativo' : 'Inativo'}
              </Badge>
              {whatsappEnabled && formData.whatsappNumber && (
                <span className="text-xs text-gray-500 font-mono">
                  {formData.whatsappNumber}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-viverblue" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expira em:</span>
              <Badge variant="outline">
                {formData.expiresIn || '7 days'}
              </Badge>
            </div>
            
            {formData.notes && (
              <div className="space-y-2">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Mensagem personalizada:
                </span>
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-viverblue">
                  <p className="text-sm text-gray-700 italic">
                    "{formData.notes}"
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo do que acontecerá */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-blue-900">
            O que acontecerá após o envio:
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-medium">1.</span>
              <span>Um token único será gerado para este convite</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">2.</span>
              <span>
                {emailEnabled && whatsappEnabled 
                  ? 'Emails e mensagens do WhatsApp serão enviados'
                  : emailEnabled 
                  ? 'Um email será enviado'
                  : 'Uma mensagem do WhatsApp será enviada'
                }
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">3.</span>
              <span>O usuário poderá aceitar o convite clicando no link recebido</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-medium">4.</span>
              <span>Após aceitar, a conta será criada automaticamente com as permissões definidas</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
