
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, AlertTriangle, RefreshCw, Sparkles, Zap, TestTube, Settings } from 'lucide-react';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';
import { Button } from '@/components/ui/button';

export const EmailStatusMonitor: React.FC = () => {
  const { isSending, sendError } = useInviteEmailService();

  if (sendError) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Sistema de E-mail com Problemas
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Erro detectado no sistema</span>
            </div>
            
            <Badge variant="destructive">
              Erro
            </Badge>
          </div>
          
          <p className="text-xs text-red-600 bg-red-100 p-2 rounded">
            {sendError.message}
          </p>
          
          <div className="bg-amber-50 border border-amber-200 p-3 rounded">
            <p className="text-xs text-amber-800 font-medium mb-2">💡 Como resolver:</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Verifique se a chave RESEND_API_KEY está configurada</li>
              <li>• Confirme se o domínio está validado no Resend.com</li>
              <li>• Use a aba "Diagnóstico" para testar o sistema</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSending) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Enviando Convite...
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm font-medium">Processando convite profissional</span>
          </div>
          
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>📧 <strong>Template Premium:</strong> Design personalizado em português</p>
            <p>🚀 <strong>Sistema Híbrido:</strong> 3 métodos de fallback automático</p>
            <p>🎯 <strong>Resend + Supabase:</strong> Máxima entregabilidade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-green-500" />
          Sistema de E-mail Operacional
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Pronto para enviar convites</span>
          </div>
          
          <div className="flex gap-1">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Pro
            </Badge>
            <Badge variant="outline" className="border-blue-200 text-blue-700">
              <Settings className="h-3 w-3 mr-1" />
              Configurado
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <p className="font-medium text-green-700">✨ Features Premium:</p>
            <ul className="text-green-600 space-y-0.5">
              <li>• Template visual profissional</li>
              <li>• Headers anti-spam otimizados</li>
              <li>• Logs detalhados de envio</li>
            </ul>
          </div>
          
          <div className="space-y-1">
            <p className="font-medium text-blue-700">🛡️ Sistema Robusto:</p>
            <ul className="text-blue-600 space-y-0.5">
              <li>• 3 métodos de fallback</li>
              <li>• Retry automático inteligente</li>
              <li>• Monitoramento em tempo real</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-2 rounded">
          <p className="text-xs text-blue-700">
            💡 <strong>Dica:</strong> Use a aba "Diagnóstico" para testar o sistema e verificar a saúde dos e-mails
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
