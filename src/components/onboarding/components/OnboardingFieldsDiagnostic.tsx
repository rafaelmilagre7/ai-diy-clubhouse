
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface OnboardingFieldsDiagnosticProps {
  isLoading: boolean;
  data: any;
  memberType: string;
  inviteToken?: string;
  isVisible?: boolean;
}

export const OnboardingFieldsDiagnostic: React.FC<OnboardingFieldsDiagnosticProps> = ({
  isLoading,
  data,
  memberType,
  inviteToken,
  isVisible = process.env.NODE_ENV === 'development'
}) => {
  if (!isVisible) return null;

  const fieldsEnabled = !isLoading;
  const hasBasicData = !!(data.email || data.name);
  const hasInvite = !!inviteToken;

  return (
    <Card className="mb-4 border-yellow-500/50 bg-yellow-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Diagnóstico dos Campos (Dev Mode)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {fieldsEnabled ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                Campos {fieldsEnabled ? 'Habilitados' : 'Bloqueados'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {hasBasicData ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">
                Dados Básicos {hasBasicData ? 'Carregados' : 'Pendentes'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Badge variant={isLoading ? "destructive" : "default"}>
              Loading: {isLoading ? 'SIM' : 'NÃO'}
            </Badge>
            
            <Badge variant={hasInvite ? "secondary" : "outline"}>
              Convite: {hasInvite ? 'SIM' : 'NÃO'}
            </Badge>
          </div>
        </div>

        <div className="pt-2 border-t border-yellow-500/20">
          <div className="text-xs space-y-1">
            <div>Email: {data.email || 'N/A'}</div>
            <div>Nome: {data.name || 'N/A'}</div>
            <div>Tipo: {memberType}</div>
            <div>Token: {inviteToken ? 'Presente' : 'Ausente'}</div>
          </div>
        </div>

        {!fieldsEnabled && (
          <div className="bg-red-950/20 border border-red-500/20 rounded p-2">
            <div className="text-xs text-red-400">
              ⚠️ CAMPOS BLOQUEADOS: {isLoading ? 'Aguardando carregamento' : 'Motivo desconhecido'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
