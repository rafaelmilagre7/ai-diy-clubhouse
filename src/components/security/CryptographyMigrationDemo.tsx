/**
 * Demonstração da Migração de Criptografia
 * 
 * Mostra a diferença entre criptografia falsa e AES real
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth';
import { secureTokenStorage } from '@/utils/secureTokenStorage';
import { runCompleteCryptographyMigration, auditDataSecurity } from '@/utils/security/cryptographyMigrationHelper';
import { useSecureTokenStorage } from '@/hooks/useSecureTokenStorage';
import { AlertTriangle, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CryptographyMigrationDemo: React.FC = () => {
  const { user } = useAuth();
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demonstração do novo hook seguro
  const { 
    value: secureData, 
    setValue: setSecureData, 
    isSecure,
    error 
  } = useSecureTokenStorage('demo_data', null, {
    autoMigrate: true,
    showMigrationToast: true
  });

  const executeMigration = async () => {
    if (!user) {
      toast({
        title: "❌ Usuário necessário",
        description: "Faça login para executar a migração",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await runCompleteCryptographyMigration(user.id);
      setMigrationResult(result);
      
      toast({
        title: result.success ? "✅ Migração concluída" : "⚠️ Migração parcial",
        description: `${result.migratedKeys.length} itens migrados com sucesso`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "❌ Erro na migração",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runAudit = () => {
    const result = auditDataSecurity();
    setAuditResult(result);
  };

  const detectInsecureData = () => {
    const insecureKeys = secureTokenStorage.detectInsecureData();
    toast({
      title: `🔍 Auditoria concluída`,
      description: `Encontrados ${insecureKeys.length} itens com criptografia falsa`,
      variant: insecureKeys.length > 0 ? "destructive" : "default",
    });
  };

  const testSecureStorage = async () => {
    const testData = {
      token: "exemplo_token_secreto",
      data: new Date().toISOString(),
      sensitive: "dados_muito_sensíveis"
    };

    await setSecureData(testData);
    toast({
      title: "✅ Dados salvos com AES-256-GCM",
      description: "Dados criptografados e armazenados com segurança",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🔒 Migração de Criptografia Completa</h2>
        <p className="text-muted-foreground">
          Sistema agora protegido com AES-256-GCM real ao invés de base64 (criptografia falsa)
        </p>
      </div>

      {/* Status da Criptografia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              ❌ Antes (Vulnerável)
            </CardTitle>
            <CardDescription>Criptografia falsa com base64</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <Badge variant="destructive">Base64 Only</Badge>
              <div className="font-mono text-xs bg-muted p-2 rounded">
                btoa("dados_sensíveis")<br />
                <span className="text-destructive">↓ Facilmente decodificado:</span><br />
                atob("dados_criptografados") ❌
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Qualquer atacante podia executar <code>atob()</code> e ver todos os dados!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              ✅ Depois (Seguro)
            </CardTitle>
            <CardDescription>AES-256-GCM com Web Crypto API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <Badge variant="default">AES-256-GCM</Badge>
              <div className="font-mono text-xs bg-muted p-2 rounded">
                await realCryptography.encryptData()<br />
                <span className="text-green-600">↓ Impossível quebrar:</span><br />
                atob("dados_aes") ❌ Impossível quebrar!
              </div>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Criptografia real com salt único, IV e autenticação integrada
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ferramentas de Migração */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Ferramentas de Migração</CardTitle>
          <CardDescription>
            Execute migração e auditoria de segurança dos dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={detectInsecureData} variant="outline">
              🔍 Detectar Dados Inseguros
            </Button>
            
            <Button 
              onClick={executeMigration} 
              disabled={isLoading}
              variant={isLoading ? "secondary" : "default"}
            >
              {isLoading ? "🔄 Migrando..." : "🔄 Migrar Tudo"}
            </Button>
            
            <Button onClick={runAudit} variant="outline">
              📊 Auditar Segurança
            </Button>
            
            <Button onClick={testSecureStorage} variant="outline">
              🧪 Testar AES-256-GCM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status do Hook Seguro */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Status do Hook Seguro</CardTitle>
          <CardDescription>useSecureTokenStorage em ação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isSecure ? "default" : "destructive"}>
                {isSecure ? "🔒 Seguro" : "❌ Inseguro"}
              </Badge>
              <span className="text-sm">Status da Criptografia</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={secureData ? "default" : "secondary"}>
                {secureData ? "✅ Com dados" : "📭 Vazio"}
              </Badge>
              <span className="text-sm">Dados armazenados</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={error ? "destructive" : "default"}>
                {error ? "❌ Erro" : "✅ OK"}
              </Badge>
              <span className="text-sm">Status de operação</span>
            </div>
          </div>

          {secureData && (
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Dados criptografados (preview):</p>
              <pre className="text-xs mt-1">
                {JSON.stringify(secureData, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Migração */}
      {migrationResult && (
        <Card>
          <CardHeader>
            <CardTitle>
              📋 Resultado da Migração 
              {migrationResult.success ? "✅" : "⚠️"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Total Encontrado:</p>
                  <Badge variant="secondary">{migrationResult.totalFound}</Badge>
                </div>
                <div>
                  <p className="font-medium">Migrados:</p>
                  <Badge variant="default">{migrationResult.migratedKeys.length}</Badge>
                </div>
                <div>
                  <p className="font-medium">Falharam:</p>
                  <Badge variant={migrationResult.failedKeys.length > 0 ? "destructive" : "secondary"}>
                    {migrationResult.failedKeys.length}
                  </Badge>
                </div>
              </div>

              {migrationResult.migratedKeys.length > 0 && (
                <div>
                  <p className="text-sm font-medium">✅ Chaves migradas para AES-256-GCM:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {migrationResult.migratedKeys.map((key: string) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {migrationResult.failedKeys.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-destructive">❌ Chaves que falharam:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {migrationResult.failedKeys.map((key: string) => (
                      <Badge key={key} variant="destructive" className="text-xs">
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {migrationResult.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium">📋 Recomendações:</p>
                  <ul className="text-xs mt-1 space-y-1">
                    {migrationResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-muted-foreground">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado da Auditoria */}
      {auditResult && (
        <Card>
          <CardHeader>
            <CardTitle>🔍 Auditoria de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">✅ Seguros:</p>
                <Badge variant="default">{auditResult.secure.length}</Badge>
              </div>
              <div>
                <p className="font-medium">🚨 Inseguros:</p>
                <Badge variant="destructive">{auditResult.insecure.length}</Badge>
              </div>
              <div>
                <p className="font-medium">❓ Desconhecidos:</p>
                <Badge variant="secondary">{auditResult.unknown.length}</Badge>
              </div>
            </div>

            {auditResult.recommendations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">📋 Recomendações da auditoria:</p>
                <ul className="text-xs mt-1 space-y-1">
                  {auditResult.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-muted-foreground">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instruções de Uso */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Como Usar a Nova Criptografia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-medium">✅ Nova implementação segura:</p>
              <pre className="bg-muted p-2 rounded mt-1 text-xs">
{`import { useSecureTokenStorage } from '@/hooks/useSecureTokenStorage';

const { value, setValue, isSecure } = useSecureTokenStorage('chave', {}, {
  autoMigrate: true // Migra dados antigos automaticamente
});`}
              </pre>
            </div>

            <div>
              <p className="font-medium">🔄 Migração automática disponível:</p>
              <pre className="bg-muted p-2 rounded mt-1 text-xs">
{`import { runCompleteCryptographyMigration } from '@/utils/security/cryptographyMigrationHelper';

const resultado = await runCompleteCryptographyMigration(userId);
console.log(\`Migrados: \${resultado.migratedKeys.length} itens\`);`}
              </pre>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Migração transparente:</strong> Os usuários não percebem a mudança. 
                Dados antigos são automaticamente convertidos para AES-256-GCM quando acessados.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptographyMigrationDemo;