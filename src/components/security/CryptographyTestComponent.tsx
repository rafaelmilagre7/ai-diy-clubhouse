/**
 * Componente para demonstrar a diferença entre criptografia falsa e real
 */

import React, { useState } from 'react';
import { realCryptography } from '@/utils/security/realCryptography';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Shield, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

export const CryptographyTestComponent: React.FC = () => {
  const { user } = useAuth();
  const [testData, setTestData] = useState('Dados sensíveis de teste');
  const [fakeEncrypted, setFakeEncrypted] = useState('');
  const [realEncrypted, setRealEncrypted] = useState('');
  const [showDecrypted, setShowDecrypted] = useState(false);

  // Demonstração da criptografia falsa (base64)
  const demonstrateFakeEncryption = () => {
    // Simular a implementação antiga
    const fakeKey = btoa(`${user?.id || 'test'}-storage`).substring(0, 32);
    const timestamp = Date.now();
    
    const dataWithTimestamp = JSON.stringify({
      data: JSON.stringify(testData),
      timestamp,
      userId: (user?.id || 'test').substring(0, 8)
    });
    
    // ❌ FAKE - Apenas base64!
    const fake = btoa(encodeURIComponent(fakeKey + ':' + dataWithTimestamp));
    setFakeEncrypted(fake);
  };

  // Demonstração da criptografia real (AES-GCM)
  const demonstrateRealEncryption = async () => {
    if (!user) return;
    
    try {
      // ✅ REAL - AES-256-GCM!
      const real = await realCryptography.encryptData(testData, user.id);
      setRealEncrypted(real);
    } catch (error) {
      console.error('Erro na criptografia real:', error);
    }
  };

  // Demonstrar como a fake é facilmente quebrada
  const demonstrateVulnerability = () => {
    if (!fakeEncrypted) return;
    
    try {
      // ❌ QUALQUER PESSOA PODE FAZER ISSO:
      const decoded = decodeURIComponent(atob(fakeEncrypted));
      const [, dataWithTimestamp] = decoded.split(':', 2);
      const parsed = JSON.parse(dataWithTimestamp);
      const originalData = JSON.parse(parsed.data);
      
      console.log('🚨 DADOS "CRIPTOGRAFADOS" EXPOSTOS:', originalData);
      alert(`VULNERABILIDADE: Seus dados "criptografados" são: ${originalData}`);
    } catch (error) {
      console.error('Erro ao quebrar fake encryption:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Card className="border-status-error/30 bg-status-error/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-status-error">
            <AlertTriangle className="w-5 h-5" />
            Demonstração: Criptografia Falsa vs Real
          </CardTitle>
          <CardDescription className="text-status-error/90">
            Veja como a implementação anterior era vulnerável
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Input de teste */}
      <Card>
        <CardHeader>
          <CardTitle>Dados para Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="test-data">Digite dados sensíveis para testar:</Label>
            <Input
              id="test-data"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              placeholder="ex: senha123, CPF, dados bancários..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de teste */}
      <div className="flex gap-4">
        <Button 
          onClick={demonstrateFakeEncryption}
          variant="destructive"
          className="flex-1"
        >
          <Unlock className="w-4 h-4 mr-2" />
          Testar "Criptografia" Falsa
        </Button>
        
        <Button 
          onClick={demonstrateRealEncryption}
          variant="default"
          className="flex-1"
          disabled={!user}
        >
          <Lock className="w-4 h-4 mr-2" />
          Testar Criptografia Real
        </Button>
      </div>

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Criptografia Falsa */}
        <Card className="border-status-error/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-status-error">
              <Unlock className="w-4 h-4" />
              "Criptografia" Falsa (Vulnerável)
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="destructive">Base64 Only</Badge>
              <Badge variant="destructive">Facilmente Quebrada</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dados "Criptografados":</Label>
              <Textarea
                value={fakeEncrypted}
                readOnly
                className="font-mono text-xs"
                placeholder="Execute o teste para ver a ofuscação..."
              />
            </div>
            
            {fakeEncrypted && (
              <Button 
                onClick={demonstrateVulnerability}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Quebrar "Criptografia" (Demonstrar Vulnerabilidade)
              </Button>
            )}
            
            <div className="text-sm text-status-error bg-status-error/20 p-3 rounded">
              <strong>Problema:</strong> Qualquer pessoa pode abrir o console do browser e executar:
              <code className="block mt-1 bg-status-error/30 p-1 rounded">
                atob("dados_criptografados") // Dados expostos!
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Criptografia Real */}
        <Card className="border-operational/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-operational">
              <Shield className="w-4 h-4" />
              Criptografia Real (Segura)
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="default">AES-256-GCM</Badge>
              <Badge variant="default">PBKDF2</Badge>
              <Badge variant="default">Militarmente Segura</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dados Criptografados:</Label>
              <Textarea
                value={realEncrypted}
                readOnly
                className="font-mono text-xs"
                placeholder={user ? "Execute o teste para ver a criptografia real..." : "Faça login para testar"}
              />
            </div>
            
            {realEncrypted && (
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setShowDecrypted(!showDecrypted)}
                  variant="outline"
                  size="sm"
                >
                  {showDecrypted ? (
                    <><EyeOff className="w-4 h-4 mr-2" /> Ocultar</>
                  ) : (
                    <><Eye className="w-4 h-4 mr-2" /> Mostrar Dados Originais</>
                  )}
                </Button>
                
                {showDecrypted && (
                  <Badge variant="outline" className="font-mono">
                    {testData}
                  </Badge>
                )}
              </div>
            )}

            <div className="text-sm text-operational bg-operational/20 p-3 rounded">
              <strong>Segurança:</strong> Mesmo com acesso ao código, é impossível descriptografar:
              <code className="block mt-1 bg-operational/30 p-1 rounded">
                // Tentativa no console = dados binários inúteis
                atob("dados_aes") ❌ Impossível quebrar!
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Especificações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Especificações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-red-600 mb-2">❌ Implementação Antiga (Insegura)</h4>
              <ul className="space-y-1 text-red-700">
                <li>• <strong>Algoritmo:</strong> Base64 encoding (não é criptografia)</li>
                <li>• <strong>Segurança:</strong> Zero - facilmente reversível</li>
                <li>• <strong>Chave:</strong> Predictable (btoa simples)</li>
                <li>• <strong>Tempo para quebrar:</strong> Segundos no console</li>
                <li>• <strong>Resistência:</strong> Nenhuma</li>
                <li>• <strong>Integridade:</strong> Sem verificação</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-600 mb-2">✅ Implementação Nova (Segura)</h4>
              <ul className="space-y-1 text-green-700">
                <li>• <strong>Algoritmo:</strong> AES-256-GCM (padrão militar)</li>
                <li>• <strong>Segurança:</strong> Máxima - criptografia real</li>
                <li>• <strong>Chave:</strong> PBKDF2 + Salt (100k iterações)</li>
                <li>• <strong>Tempo para quebrar:</strong> Bilhões de anos</li>
                <li>• <strong>Resistência:</strong> Quantum-safe</li>
                <li>• <strong>Integridade:</strong> Autenticação integrada (GCM)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status do Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Web Crypto API:</span>
              <Badge variant={typeof crypto?.subtle !== 'undefined' ? "default" : "destructive"}>
                {typeof crypto?.subtle !== 'undefined' ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Protocolo Seguro:</span>
              <Badge variant={window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? "default" : "destructive"}>
                {window.location.protocol === 'https:' ? "HTTPS" : window.location.hostname === 'localhost' ? "Localhost" : "HTTP (Inseguro)"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Usuário Autenticado:</span>
              <Badge variant={user ? "default" : "secondary"}>
                {user ? "Sim" : "Não"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Ambiente Seguro:</span>
              <Badge variant={realCryptography.isSecureEnvironment() ? "default" : "destructive"}>
                {realCryptography.isSecureEnvironment() ? "Seguro" : "Inseguro"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};