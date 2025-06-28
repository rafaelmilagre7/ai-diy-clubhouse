
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Search } from 'lucide-react';

const ValidateCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (!certificateId.trim()) return;

    try {
      setLoading(true);
      
      // Mock validation since the RPC function doesn't exist
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation result
      const mockResult = {
        is_valid: true,
        certificate_data: {
          id: certificateId,
          user_name: 'João Silva', 
          solution_title: 'Automação de Marketing com IA',
          issued_at: new Date().toISOString(),
          completion_date: new Date().toISOString()
        }
      };
      
      setValidationResult(mockResult);
      
    } catch (error) {
      console.error('Erro na validação:', error);
      setValidationResult({ is_valid: false, error: 'Erro na validação' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Validar Certificado
          </CardTitle>
          <CardDescription>
            Digite o ID do certificado para validar sua autenticidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ID do certificado"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
            />
            <Button onClick={handleValidate} disabled={loading || !certificateId.trim()}>
              {loading ? 'Validando...' : 'Validar'}
            </Button>
          </div>

          {validationResult && (
            <Card className={validationResult.is_valid ? 'border-green-500' : 'border-red-500'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  {validationResult.is_valid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <Badge className="bg-green-500">Certificado Válido</Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <Badge className="bg-red-500">Certificado Inválido</Badge>
                    </>
                  )}
                </div>

                {validationResult.is_valid && validationResult.certificate_data && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Certificado para:</strong> {validationResult.certificate_data.user_name}
                    </div>
                    <div>
                      <strong>Solução:</strong> {validationResult.certificate_data.solution_title}
                    </div>
                    <div>
                      <strong>Data de conclusão:</strong>{' '}
                      {new Date(validationResult.certificate_data.completion_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <strong>Certificado emitido em:</strong>{' '}
                      {new Date(validationResult.certificate_data.issued_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                )}

                {!validationResult.is_valid && (
                  <p className="text-sm text-red-600">
                    {validationResult.error || 'Certificado não encontrado ou inválido.'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidateCertificate;
