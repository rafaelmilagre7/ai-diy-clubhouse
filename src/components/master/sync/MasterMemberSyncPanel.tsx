import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Users,
  Building2,
  UserPlus,
  Download,
  Info
} from 'lucide-react';
import { useMasterMemberSync } from '@/hooks/useMasterMemberSync';
import { cn } from '@/lib/utils';

export const MasterMemberSyncPanel: React.FC = () => {
  const { syncing, progress, syncResult, syncFromCSV } = useMasterMemberSync();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Por favor, selecione um arquivo CSV válido');
    }
  };

  const handleSync = async () => {
    if (!selectedFile) return;
    await syncFromCSV(selectedFile);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getOperationLabel = (operation: string) => {
    const labels: Record<string, string> = {
      'master_created': 'Master Criado',
      'master_updated': 'Master Atualizado',
      'member_created': 'Membro Criado',
      'member_updated': 'Membro Atualizado',
      'organization_created': 'Organização Criada',
      'skipped': 'Ignorado',
      'error': 'Erro'
    };
    return labels[operation] || operation;
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sistema de Sincronização Master/Membros</AlertTitle>
        <AlertDescription>
          Faça upload do arquivo CSV com as colunas <code>usuario_master</code> e <code>usuario_adicional</code> 
          para sincronizar a estrutura de masters e seus membros de equipe.
        </AlertDescription>
      </Alert>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload do CSV
          </CardTitle>
          <CardDescription>
            Selecione o arquivo CSV exportado da planilha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
              disabled={syncing}
            />
            <label htmlFor="csv-upload">
              <Button
                variant="outline"
                disabled={syncing}
                className="cursor-pointer"
                asChild
              >
                <span>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Selecionar CSV
                </span>
              </Button>
            </label>
            
            {selectedFile && (
              <div className="flex items-center gap-2 flex-1">
                <Badge variant="secondary" className="gap-1">
                  <FileSpreadsheet className="w-3 h-3" />
                  {selectedFile.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFile}
                  disabled={syncing}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {selectedFile && !syncing && !syncResult && (
            <Button 
              onClick={handleSync} 
              className="w-full gap-2"
              size="lg"
            >
              <Upload className="w-4 h-4" />
              Iniciar Sincronização
            </Button>
          )}

          {syncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sincronizando...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {syncResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {syncResult.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Sincronização Concluída
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  Sincronização com Erros
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
                <Users className="w-8 h-8 text-primary mb-2" />
                <div className="text-2xl font-bold">{syncResult.stats.masters_processed}</div>
                <div className="text-xs text-muted-foreground">Masters</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-blue-500/5 rounded-lg">
                <UserPlus className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-2xl font-bold">{syncResult.stats.members_processed}</div>
                <div className="text-xs text-muted-foreground">Membros</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-green-500/5 rounded-lg">
                <Building2 className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-2xl font-bold">{syncResult.stats.organizations_created}</div>
                <div className="text-xs text-muted-foreground">Organizations</div>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-red-500/5 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600 mb-2" />
                <div className="text-2xl font-bold">{syncResult.stats.errors}</div>
                <div className="text-xs text-muted-foreground">Erros</div>
              </div>
            </div>

            <Separator />

            {/* Logs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Log de Operações</h4>
                <Badge variant="outline">
                  {syncResult.logs.length} operações
                </Badge>
              </div>

              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {syncResult.logs.map((log, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg text-sm",
                        log.status === 'success' && "bg-green-50 dark:bg-green-950/20",
                        log.status === 'error' && "bg-red-50 dark:bg-red-950/20",
                        log.status === 'warning' && "bg-yellow-50 dark:bg-yellow-950/20"
                      )}
                    >
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{log.master_email}</div>
                        {log.member_email && (
                          <div className="text-xs text-muted-foreground truncate">
                            → {log.member_email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getOperationLabel(log.operation)}
                          </Badge>
                          {log.message && (
                            <span className="text-xs text-muted-foreground">{log.message}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => {
                handleClearFile();
                window.location.reload();
              }}
            >
              <Download className="w-4 h-4" />
              Nova Sincronização
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};