import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, PlayCircle, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { useMasterMemberSync } from '@/hooks/useMasterMemberSync';
import { CSVPreview } from './CSVPreview';
import { DryRunResults } from './DryRunResults';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export const MasterMemberSyncPanel: React.FC = () => {
  const { toast } = useToast();
  const { 
    syncing, 
    progress, 
    syncResult, 
    validationResult,
    validateCSV,
    syncFromCSV 
  } = useMasterMemberSync();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setShowPreview(false);
    
    await validateCSV(file);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDryRun = async () => {
    if (!selectedFile) return;
    await syncFromCSV(selectedFile, true);
  };

  const handleRealSync = async () => {
    if (!selectedFile) return;
    
    const confirm = window.confirm(
      `Você está prestes a sincronizar ${validationResult?.stats.uniqueMasters || 0} masters e ${validationResult?.stats.uniqueMembers || 0} membros.\n\nEsta ação irá modificar o banco de dados.\n\nDeseja continuar?`
    );
    
    if (!confirm) return;
    
    // ============================================
    // FASE 3: Validação robusta após sincronização
    // ============================================
    const result = await syncFromCSV(selectedFile, false);
    
    // ✅ Verificar se a sincronização foi bem-sucedida
    if (result?.success) {
      const logsSavedToDb = result.logsSavedToDb || 0;
      const mastersProcessed = result.stats?.masters_processed || 0;
      const membersProcessed = result.stats?.members_processed || 0;
      
      // Validação principal: verificar se logs foram salvos
      if (logsSavedToDb > 0) {
        toast({
          title: '✅ Sincronização concluída com sucesso!',
          description: `${mastersProcessed} masters e ${membersProcessed} membros processados. ${logsSavedToDb} operações registradas.`,
          duration: 5000
        });
      } else if (mastersProcessed > 0 || membersProcessed > 0) {
        // Dados processados mas logs não salvos
        toast({
          title: '⚠️ Sincronização realizada com aviso',
          description: `Dados processados (${mastersProcessed} masters, ${membersProcessed} membros), mas logs podem não ter sido salvos completamente.`,
          variant: 'default',
          duration: 7000
        });
      } else {
        toast({
          title: '❌ Sincronização sem alterações',
          description: 'Nenhum dado foi processado. Verifique se os emails do CSV existem no sistema.',
          variant: 'destructive',
          duration: 5000
        });
      }
    } else {
      toast({
        title: '❌ Erro na sincronização',
        description: result?.error || 'Ocorreu um erro desconhecido',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = 'usuario_master,usuario_adicional\n' +
      ',master1@example.com\n' +
      'master1@example.com,membro1@example.com\n' +
      'master1@example.com,membro2@example.com\n' +
      ',master2@example.com\n' +
      'master2@example.com,membro3@example.com\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo_master_membros.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Instruções
          </CardTitle>
          <CardDescription>
            Como preparar o arquivo CSV para sincronização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              O CSV deve conter duas colunas:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-4">
              <li><strong>usuario_master</strong>: Email do master (deixe vazio se o adicional for master)</li>
              <li><strong>usuario_adicional</strong>: Email do membro OU do master (se usuario_master vazio)</li>
            </ul>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Formato aceito:</strong><br/>
              • Se <strong>usuario_master vazio</strong>: usuario_adicional é tratado como MASTER<br/>
              • Se <strong>usuario_master preenchido</strong>: usuario_adicional é MEMBRO desse master<br/>
              • Masters com múltiplos membros: repita o master em várias linhas
            </AlertDescription>
          </Alert>

          <Button onClick={downloadSampleCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Baixar CSV de Exemplo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Selecionar Arquivo CSV</CardTitle>
          <CardDescription>
            Faça upload do arquivo com a estrutura de masters e membros
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
              disabled={syncing}
            />
            <label htmlFor="csv-upload">
              <Button asChild variant="outline" disabled={syncing}>
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar CSV
                </span>
              </Button>
            </label>
            
            {selectedFile && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
            )}
          </div>

          {validationResult && (
            <div className="space-y-3">
              {validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validationResult.errors.map((error, i) => (
                        <div key={i} className="text-sm">{error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validationResult.warnings.map((warning, i) => (
                        <div key={i} className="text-sm">{warning}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.isValid && (
                <Alert>
                  <CheckCircle className="h-4 w-4 text-status-success" />
                  <AlertDescription>
                    <div className="space-y-1 text-sm">
                      <div>✅ CSV válido e pronto para sincronização</div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-muted-foreground">
                        <div>Masters: <strong>{validationResult.stats.uniqueMasters}</strong></div>
                        <div>Membros: <strong>{validationResult.stats.uniqueMembers}</strong></div>
                        <div>Total de linhas: <strong>{validationResult.stats.totalRows}</strong></div>
                        <div>Linhas vazias: <strong>{validationResult.stats.emptyRows}</strong></div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {selectedFile && validationResult?.isValid && (
            <div className="flex gap-2">
              <Button onClick={handlePreview} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Ver Preview
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showPreview && selectedFile && validationResult && (
        <CSVPreview file={selectedFile} validation={validationResult} />
      )}

      {selectedFile && validationResult?.isValid && (
        <Card>
          <CardHeader>
            <CardTitle>2. Executar Sincronização</CardTitle>
            <CardDescription>
              Escolha entre simulação (dry-run) ou sincronização real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={handleDryRun}
                disabled={syncing}
                variant="secondary"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Simular (Dry-Run)
              </Button>

              <Button 
                onClick={handleRealSync}
                disabled={syncing || syncResult?.dryRun !== true}
                variant="default"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Sincronizar (Real)
              </Button>
            </div>

            {!syncResult?.dryRun && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  ⚠️ Recomendado: Execute primeiro a <strong>Simulação (Dry-Run)</strong> para validar os dados antes da sincronização real.
                </AlertDescription>
              </Alert>
            )}

            {syncing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Processando... {progress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {syncResult && (
        <DryRunResults result={syncResult} />
      )}
    </div>
  );
};