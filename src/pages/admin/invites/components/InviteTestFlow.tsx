
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestTube, Mail, UserX, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useDeleteUser } from '@/hooks/admin/useDeleteUser';
import { useInviteCreate } from '@/hooks/admin/invites/useInviteCreate';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
}

interface InviteTestFlowProps {
  roles: Role[];
  onInviteCreated?: () => void;
}

export const InviteTestFlow: React.FC<InviteTestFlowProps> = ({ roles, onInviteCreated }) => {
  const [testEmail, setTestEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [flowStep, setFlowStep] = useState<'idle' | 'cleaning' | 'inviting' | 'complete'>('idle');
  
  const { deleteUser, isDeleting, canReceiveNewInvite } = useDeleteUser();
  const { createInvite, isCreating } = useInviteCreate();

  const handleTestFlow = async () => {
    if (!testEmail || !selectedRole) {
      toast.error('Preencha email e papel');
      return;
    }

    try {
      setFlowStep('cleaning');
      
      // Primeiro, verificar se o email pode receber convite
      const canReceive = await canReceiveNewInvite(testEmail);
      
      if (canReceive) {
        console.log("✅ Email já está limpo, prosseguindo para envio");
        setFlowStep('inviting');
      } else {
        console.log("🧹 Email precisa ser limpo primeiro");
        
        // Buscar o usuário pelo email
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('email', testEmail)
          .maybeSingle();

        if (userData) {
          console.log("🗑️ Limpando usuário encontrado:", userData);
          const deleteSuccess = await deleteUser(userData.id, testEmail, true); // Soft delete sempre
          
          if (!deleteSuccess) {
            throw new Error('Falha na limpeza do usuário');
          }
          
          // Aguardar um momento para garantir limpeza
          await new Promise(resolve => setTimeout(resolve, 1000));
          setFlowStep('inviting');
        } else {
          console.log("👤 Usuário não encontrado, prosseguindo direto");
          setFlowStep('inviting');
        }
      }
      
      // Criar novo convite
      console.log("📧 Criando novo convite...");
      const inviteResult = await createInvite(testEmail, selectedRole, `Convite de teste via fluxo automatizado`);
      
      if (inviteResult) {
        setFlowStep('complete');
        toast.success('🎉 Fluxo de teste concluído!', {
          description: `Email limpo e novo convite enviado para ${testEmail}`,
          duration: 6000
        });
        
        if (onInviteCreated) {
          onInviteCreated();
        }
        
        // Reset após 3 segundos
        setTimeout(() => {
          setFlowStep('idle');
          setTestEmail('');
          setSelectedRole('');
        }, 3000);
      } else {
        throw new Error('Falha na criação do convite');
      }
      
    } catch (error: any) {
      console.error('❌ Erro no fluxo de teste:', error);
      setFlowStep('idle');
      toast.error('❌ Erro no fluxo de teste', {
        description: error.message || 'Processo interrompido'
      });
    }
  };

  const isProcessing = isDeleting || isCreating || flowStep !== 'idle';

  return (
    <Card className="border-strategy/20 bg-strategy/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TestTube className="h-4 w-4 text-strategy" />
          🧪 Fluxo de Teste Automatizado
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-xs text-muted-foreground">
          <p><strong>Função:</strong> Limpa usuário existente + Cria novo convite em um clique</p>
          <p><strong>Ideal para:</strong> Resolver "emails esgotados" durante desenvolvimento</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="test-email" className="text-xs">Email para teste</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="exemplo@teste.com"
              disabled={isProcessing}
              className="text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="test-role" className="text-xs">Papel</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isProcessing}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecionar papel" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id} className="text-sm">
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            onClick={handleTestFlow}
            disabled={!testEmail || !selectedRole || isProcessing}
            variant="outline"
            className="text-sm border-strategy/30 hover:bg-strategy/10"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {flowStep === 'cleaning' && 'Limpando...'}
                {flowStep === 'inviting' && 'Enviando...'}
                {flowStep === 'complete' && 'Concluído!'}
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                🧹➡️📧 Limpar + Convidar
              </>
            )}
          </Button>
          
          <div className="flex gap-1">
            {flowStep === 'cleaning' && (
              <Badge variant="outline" className="text-xs border-revenue/30 text-revenue">
                <UserX className="h-3 w-3 mr-1" />
                Limpando
              </Badge>
            )}
            {flowStep === 'inviting' && (
              <Badge variant="outline" className="text-xs border-status-info/30 text-status-info">
                <Mail className="h-3 w-3 mr-1" />
                Enviando
              </Badge>
            )}
            {flowStep === 'complete' && (
              <Badge variant="outline" className="text-xs border-status-success/30 text-status-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sucesso
              </Badge>
            )}
          </div>
        </div>
        
        <div className="bg-strategy/20 dark:bg-strategy/20 p-3 rounded border border-strategy/30 dark:border-strategy/30">
          <p className="text-xs text-strategy-dark dark:text-strategy-light">
            <strong>🔄 Processo Automatizado:</strong>
          </p>
          <ol className="text-xs text-strategy-dark dark:text-strategy-light mt-1 space-y-1">
            <li>1. 🔍 Verifica se email precisa ser limpo</li>
            <li>2. 🧹 Executa soft delete se necessário</li>
            <li>3. ✨ Aguarda limpeza completar</li>
            <li>4. 📧 Cria e envia novo convite</li>
            <li>5. 🎉 Confirma sucesso do processo</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
