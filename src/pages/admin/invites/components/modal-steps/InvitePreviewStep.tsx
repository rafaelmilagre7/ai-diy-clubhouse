
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Clock, User, Shield, FileText, CheckCircle, Send, Calendar } from 'lucide-react';
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

  const getExpirationInfo = (expiresIn: string) => {
    const options: Record<string, { label: string; color: string; icon: string }> = {
      '1 day': { label: '1 dia', color: 'bg-red-100 text-red-800 border-red-200', icon: '🔥' },
      '3 days': { label: '3 dias', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚡' },
      '7 days': { label: '7 dias', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' },
      '14 days': { label: '14 dias', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📅' },
      '30 days': { label: '30 dias', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '📆' },
    };
    return options[expiresIn] || options['7 days'];
  };

  const expirationInfo = getExpirationInfo(formData.expiresIn || '7 days');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Confirmação do Convite</h3>
          <p className="text-gray-600 mt-1">
            Revise todas as informações antes de enviar o convite
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-900 text-lg">Convite pronto para envio!</p>
              <p className="text-sm text-green-700">Todas as informações necessárias foram preenchidas corretamente.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Dados do Convidado */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              Dados do Convidado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="font-mono text-sm text-[#0ABAB5] font-medium">{formData.email}</span>
              </div>
              
              {formData.userName && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Nome:</span>
                  <span className="text-sm text-gray-900 font-medium">{formData.userName}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Função:</span>
                <Badge variant="outline" className="flex items-center gap-2 border-[#0ABAB5] text-[#0ABAB5]">
                  <Shield className="h-3 w-3" />
                  {selectedRole?.name || 'Não selecionado'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canais de Comunicação */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 text-white" />
              </div>
              Canais de Envio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Email</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className={`h-4 w-4 ${whatsappEnabled ? 'text-[#0ABAB5]' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-900">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={whatsappEnabled ? "bg-[#0ABAB5]/10 text-[#0ABAB5] border-[#0ABAB5]/20" : "bg-gray-100 text-gray-600 border-gray-200"}>
                    {whatsappEnabled ? 'Ativo' : 'Inativo'}
                  </Badge>
                  {whatsappEnabled && formData.whatsappNumber && (
                    <span className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border">
                      {formData.whatsappNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
              <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Expira em:</span>
              <Badge className={`${expirationInfo.color} border font-medium`}>
                {expirationInfo.icon} {expirationInfo.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem Personalizada */}
        {formData.notes && (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-lg text-gray-900">
                <div className="w-10 h-10 bg-[#0ABAB5] rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Mensagem Personalizada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-[#0ABAB5]">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  "{formData.notes}"
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* What happens next */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            O que acontecerá após o envio:
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-2 gap-6">
            <ol className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                <span>Um token único será gerado para este convite</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                <span>
                  {emailEnabled && whatsappEnabled 
                    ? 'Emails e mensagens do WhatsApp serão enviados simultaneamente'
                    : emailEnabled 
                    ? 'Um email profissional será enviado'
                    : 'Uma mensagem do WhatsApp será enviada'
                  }
                </span>
              </li>
            </ol>
            <ol className="space-y-3 text-sm text-blue-800" start={3}>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                <span>O usuário poderá aceitar o convite clicando no link recebido</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                <span>Após aceitar, a conta será criada automaticamente com as permissões definidas</span>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
