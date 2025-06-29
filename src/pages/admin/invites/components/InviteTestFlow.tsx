
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
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TestTube className="h-4 w-4 text-purple-500" />
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
            className="text-sm border-purple-300 hover:bg-purple-100"
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
              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                <UserX className="h-3 w-3 mr-1" />
                Limpando
              </Badge>
            )}
            {flowStep === 'inviting' && (
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                <Mail className="h-3 w-3 mr-1" />
                Enviando
              </Badge>
            )}
            {flowStep === 'complete' && (
              <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Sucesso
              </Badge>
            )}
          </div>
        </div>
        
        <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-purple-700 dark:text-purple-300">
            <strong>🔄 Processo Automatizado:</strong>
          </p>
          <ol className="text-xs text-purple-600 dark:text-purple-400 mt-1 space-y-1">
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
