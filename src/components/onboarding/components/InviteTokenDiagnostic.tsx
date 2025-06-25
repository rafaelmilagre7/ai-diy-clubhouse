
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInviteDiagnostic } from '@/hooks/useInviteDiagnostic';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

const InviteTokenDiagnostic = () => {
  const [testToken, setTestToken] = useState('');
  const { runDiagnostic, isRunning, results } = useInviteDiagnostic();

  const handleTest = async () => {
    if (!testToken.trim()) return;
    await runDiagnostic(testToken.trim());
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-[#1A1E2E] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-viverblue" />
          Diagnóstico de Token de Convite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Digite o token do convite (ex: ZREVHJDGZTCE)"
            value={testToken}
            onChange={(e) => setTestToken(e.target.value)}
            className="bg-[#0F111A] border-gray-700 text-white"
          />
          <Button
            onClick={handleTest}
            disabled={isRunning || !testToken.trim()}
            className="bg-viverblue hover:bg-viverblue/90"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Testar'
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-white font-medium">Resultados do Diagnóstico:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-[#0F111A] p-3 rounded-lg border border-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">
                    {result.step}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.success)}
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.duration}ms
                    </Badge>
                  </div>
                </div>
                
                {result.error && (
                  <div className="text-red-400 text-xs mb-2">
                    Erro: {result.error}
                  </div>
                )}
                
                {result.data && (
                  <div className="text-neutral-300 text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteTokenDiagnostic;
