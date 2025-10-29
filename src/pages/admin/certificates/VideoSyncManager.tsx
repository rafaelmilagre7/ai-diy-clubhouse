import { VideoDurationSyncDashboard } from '@/components/admin/VideoDurationSyncDashboard';
import { VideosDurationUpdater } from '@/components/admin/VideosDurationUpdater';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, TrendingUp, Database, Award } from 'lucide-react';
import { useDynamicSEO } from '@/hooks/seo/useDynamicSEO';

export default function VideoSyncManager() {
  useDynamicSEO({
    title: 'Sincronização de Durações de Vídeos',
    description: 'Controle e sincronização das durações dos vídeos com a API do Panda Video.',
    keywords: 'vídeos, durações, sincronização, certificados'
  });

  return (
    <div className="container mx-auto py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Clock className="h-8 w-8 text-strategy" />
          Sincronização de Durações de Vídeos
        </h1>
        <p className="text-muted-foreground mt-2">
          Controle e sincronização das durações dos vídeos com a API do Panda Video para certificados precisos
        </p>
      </div>

      <div className="grid gap-6">
        {/* Dashboard Principal */}
        <VideoDurationSyncDashboard />
        
        <Separator />
        
        {/* Ferramentas Avançadas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Atualizador Simples */}
          <VideosDurationUpdater />
          
          {/* Informações e Ajuda */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Como Funciona
              </CardTitle>
              <CardDescription>
                Entenda o processo de sincronização das durações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Database className="w-4 h-4 mt-1 text-status-info" />
                  <div className="text-sm">
                    <strong>1. Identificação:</strong> O sistema busca vídeos sem duration_seconds no banco
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Clock className="w-4 h-4 mt-1 text-status-success" />
                  <div className="text-sm">
                    <strong>2. Sincronização:</strong> Consulta a API do Panda Video para obter durações reais
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Award className="w-4 h-4 mt-1 text-strategy" />
                  <div className="text-sm">
                    <strong>3. Atualização:</strong> Certificados passam a mostrar cargas horárias precisas
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="bg-status-info/10 p-3 rounded-lg">
                <h5 className="font-medium mb-2">💡 Dicas Importantes:</h5>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Execute a sincronização sempre que adicionar novos vídeos</li>
                  <li>• Vídeos com erro 404 não são encontrados na API do Panda</li>
                  <li>• A sincronização é incremental - só processa vídeos sem duração</li>
                  <li>• Certificados são atualizados automaticamente após a sincronização</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
