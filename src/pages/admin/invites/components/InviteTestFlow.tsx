
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useInviteCreate } from "@/hooks/admin/invites/useInviteCreate";
import { useAdminUserDelete } from "@/hooks/admin/users/useAdminUserDelete";

interface InviteTestFlowProps {
  roles: any[];
  onTestComplete: () => void;
}

const InviteTestFlow = ({ roles, onTestComplete }: InviteTestFlowProps) => {
  const [testEmail, setTestEmail] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [testResults, setTestResults] = useState<any[]>([]);
  
  const { deleteUser, isDeleting } = useAdminUserDelete();
  const { createInvite, loading } = useInviteCreate();

  const runInviteTest = async () => {
    if (!testEmail || !selectedRoleId) return;

    try {
      // Tentar criar convite
      const result = await createInvite({
        email: testEmail,
        roleId: selectedRoleId
      });

      setTestResults(prev => [...prev, {
        type: 'invite_created',
        success: !!result,
        message: result ? 'Convite criado com sucesso' : 'Falha ao criar convite',
        timestamp: new Date().toISOString()
      }]);

      onTestComplete();
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'error',
        success: false,
        message: `Erro: ${error}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const cleanupTestUser = async (userEmail: string) => {
    try {
      await deleteUser("test-user-id", userEmail);
      setTestResults(prev => [...prev, {
        type: 'cleanup',
        success: true,
        message: 'Usuário de teste removido',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'cleanup_error',
        success: false,
        message: `Erro na limpeza: ${error}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Teste de Convites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="test-email">Email de Teste</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="teste@exemplo.com"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="test-role">Papel</Label>
          <select 
            id="test-role"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione um papel</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={runInviteTest}
            disabled={loading || !testEmail || !selectedRoleId}
          >
            {loading ? "Testando..." : "Executar Teste"}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => cleanupTestUser(testEmail)}
            disabled={isDeleting || !testEmail}
          >
            {isDeleting ? "Limpando..." : "Limpar Teste"}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Resultados do Teste:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "✓" : "✗"}
                </Badge>
                <span className="text-sm">{result.message}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteTestFlow;
