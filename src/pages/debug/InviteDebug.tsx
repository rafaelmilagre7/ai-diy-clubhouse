
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';

const InviteDebug = () => {
  const [token, setToken] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const { getInviteLink } = useInviteEmailService();

  const handleGenerateLink = () => {
    if (token) {
      const url = getInviteLink(token);
      setGeneratedUrl(url);
    }
  };

  const testTokens = [
    'ABC123DEF456',
    'TEST123',
    'INVITE789XYZ',
    'SAMPLE456TOKEN'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug de Links de Convite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>Token do Convite:</label>
            <Input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Digite um token de teste"
            />
            <Button onClick={handleGenerateLink}>Gerar Link</Button>
          </div>

          {generatedUrl && (
            <div className="space-y-2">
              <label>URL Gerada:</label>
              <div className="p-2 bg-gray-100 rounded break-all">
                {generatedUrl}
              </div>
              <Button 
                onClick={() => window.open(generatedUrl, '_blank')}
                variant="outline"
              >
                Testar Link
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <label>Tokens de Teste:</label>
            <div className="space-y-2">
              {testTokens.map((testToken) => (
                <Button
                  key={testToken}
                  variant="outline"
                  onClick={() => {
                    setToken(testToken);
                    const url = getInviteLink(testToken);
                    setGeneratedUrl(url);
                  }}
                >
                  Testar: {testToken}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label>Informações do Ambiente:</label>
            <div className="p-2 bg-gray-100 rounded text-sm">
              <div><strong>Hostname:</strong> {window.location.hostname}</div>
              <div><strong>Origin:</strong> {window.location.origin}</div>
              <div><strong>É Produção:</strong> {
                window.location.hostname === 'app.viverdeia.ai' || 
                window.location.hostname === 'ai-diy-clubhouse.lovable.app' 
                  ? 'Sim' : 'Não'
              }</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteDebug;
