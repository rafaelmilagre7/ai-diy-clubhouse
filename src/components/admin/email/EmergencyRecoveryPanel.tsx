
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { 
  Heart, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Mail,
  Zap,
  Clock,
  Users
} from 'lucide-react';

export const EmergencyRecoveryPanel: React.FC = () => {
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [orphanInvites, setOrphanInvites] = useState<any[]>([]);
  const [isLoadingOrphans, setIsLoadingOrphans] = useState(false);
  const { toast } = useToast();

  const findOrphanInvites = async () => {
    setIsLoadingOrphans(true);
    try {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          id,
          email,
          created_at,
          send_attempts,
          last_sent_at,
          token,
          role:user_roles(name)
        `)
        .eq('send_attempts', 0)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrphanInvites(data || []);
      console.log('📋 Convites órfãos encontrados:', data?.length || 0);
      
      toast({
        title: `${data?.length || 0} convites órfãos encontrados`,
        description: data?.length ? 'Convites criados mas nunca enviados' : 'Nenhum convite órfão encontrado',
        variant: data?.length ? 'destructive' : 'default'
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar convites órfãos:', error);
      toast({
        title: "Erro ao buscar convites",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoadingOrphans(false);
    }
  };

  const recoveryOrphanInvites = async () => {
    if (orphanInvites.length === 0) {
      toast({
        title: "Nenhum convite para recuperar",
        description: "Execute a busca primeiro",
        variant: "default"
      });
      return;
    }

    setIsRecovering(true);
    setRecoveryProgress(0);
    
    try {
      console.log(`🚀 Iniciando recuperação de ${orphanInvites.length} convites órfãos...`);
      
      let recovered = 0;
      let failed = 0;

      for (let i = 0; i < orphanInvites.length; i++) {
        const invite = orphanInvites[i];
        const progress = ((i + 1) / orphanInvites.length) * 100;
        setRecoveryProgress(progress);

        try {
          console.log(`📧 Processando convite ${i + 1}/${orphanInvites.length}: ${invite.email}`);
          
          // Tentar reenviar via sistema principal
          const { data, error } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email: invite.email,
              inviteUrl: `${window.location.origin}/convite/${invite.token}`,
              roleName: invite.role?.name || 'Membro',
              expiresAt: invite.expires_at,
              inviteId: invite.id,
              forceResend: true,
              recoveryMode: true
            }
          });

          if (error) {
            console.error(`❌ Falha no convite para ${invite.email}:`, error);
            failed++;
          } else if (data?.success) {
            console.log(`✅ Convite recuperado para ${invite.email}`);
            recovered++;
            
            // Atualizar tentativa no banco
            await supabase.rpc('update_invite_send_attempt', {
              invite_id: invite.id
            });
          } else {
            console.warn(`⚠️ Resposta inesperada para ${invite.email}:`, data);
            failed++;
          }

          // Pequena pausa para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (emailError: any) {
          console.error(`❌ Erro crítico no convite para ${invite.email}:`, emailError);
          failed++;
        }
      }

      // Atualizar lista após recuperação
      await findOrphanInvites();

      toast({
        title: "Recuperação concluída! 🎉",
        description: `${recovered} enviados, ${failed} falharam`,
        duration: 8000,
        variant: recovered > 0 ? "default" : "destructive"
      });

      console.log(`🎯 Recuperação finalizada: ${recovered} sucessos, ${failed} falhas`);

    } catch (error: any) {
      console.error('❌ Erro na recuperação:', error);
      toast({
        title: "Erro na recuperação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRecovering(false);
      setRecoveryProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Sistema de Recuperação de Emergência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Recupere convites que foram criados mas nunca enviados por falhas no sistema.
          </p>
        </CardContent>
      </Card>

      {/* Busca de Convites Órfãos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Diagnóstico de Convites Órfãos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              onClick={findOrphanInvites}
              disabled={isLoadingOrphans}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingOrphans ? 'animate-spin' : ''}`} />
              {isLoadingOrphans ? 'Buscando...' : 'Buscar Convites Órfãos'}
            </Button>
            
            {orphanInvites.length > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {orphanInvites.length} órfãos encontrados
              </Badge>
            )}
          </div>

          {orphanInvites.length > 0 && (
            <div className="space-y-3">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Convites Órfãos Detectados
                </h4>
                <div className="space-y-2">
                  {orphanInvites.slice(0, 5).map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between bg-white p-2 rounded text-sm">
                      <div>
                        <span className="font-medium">{invite.email}</span>
                        <span className="text-gray-500 ml-2">
                          {new Date(invite.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <Badge variant="outline">{invite.role?.name || 'Sem papel'}</Badge>
                    </div>
                  ))}
                  {orphanInvites.length > 5 && (
                    <p className="text-xs text-gray-500">
                      + {orphanInvites.length - 5} convites adicionais
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recuperação Automática */}
      {orphanInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Recuperação Automática
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRecovering && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processando convites...</span>
                  <span>{Math.round(recoveryProgress)}%</span>
                </div>
                <Progress value={recoveryProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Button 
                onClick={recoveryOrphanInvites}
                disabled={isRecovering || orphanInvites.length === 0}
                className="flex items-center gap-2"
                variant="default"
              >
                <Heart className="h-4 w-4" />
                {isRecovering ? 'Recuperando...' : `Recuperar ${orphanInvites.length} Convites`}
              </Button>
              
              {!isRecovering && (
                <div className="text-sm text-gray-600">
                  Tentará reenviar todos os convites órfãos automaticamente
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-1">Como funciona:</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Identifica convites com send_attempts = 0</li>
                <li>• Reenvia via sistema principal (Resend)</li>
                <li>• Atualiza contador de tentativas</li>
                <li>• Pausa entre envios para não sobrecarregar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Protocolo de Recuperação
            </h4>
            <ol className="space-y-2 text-gray-700">
              <li>1. <strong>Buscar:</strong> Localiza convites com send_attempts = 0</li>
              <li>2. <strong>Verificar:</strong> Confirma se ainda estão válidos e não utilizados</li>
              <li>3. <strong>Reenviar:</strong> Processa cada convite individualmente</li>
              <li>4. <strong>Atualizar:</strong> Registra tentativas no banco de dados</li>
              <li>5. <strong>Reportar:</strong> Apresenta estatísticas finais</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
