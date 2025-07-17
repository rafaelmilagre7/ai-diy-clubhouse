import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Upload, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BucketStatus {
  name: string;
  exists: boolean;
  public: boolean;
  file_size_limit: number;
  file_count?: number;
  total_size?: number;
}

export const UploadStatusCard: React.FC = () => {
  const [bucketStatus, setBucketStatus] = useState<BucketStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkBucketStatus = async () => {
    try {
      setLoading(true);
      
      // Listar buckets existentes
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        throw error;
      }
      
      const essentialBuckets = [
        'profile_images',
        'solution_files', 
        'learning_materials',
        'learning_videos',
        'learning_covers',
        'tool_logos'
      ];
      
      const statuses: BucketStatus[] = [];
      
      for (const bucketName of essentialBuckets) {
        const existingBucket = buckets?.find(b => b.name === bucketName);
        
        let fileCount = 0;
        let totalSize = 0;
        
        if (existingBucket) {
          try {
            // Contar arquivos no bucket (limitado para performance)
            const { data: files } = await supabase.storage
              .from(bucketName)
              .list('', { limit: 100 });
              
            if (files) {
              fileCount = files.length;
              totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
            }
          } catch (listError) {
            console.warn(`Erro ao listar arquivos do bucket ${bucketName}:`, listError);
          }
        }
        
        statuses.push({
          name: bucketName,
          exists: !!existingBucket,
          public: existingBucket?.public || false,
          file_size_limit: existingBucket?.file_size_limit || 0,
          file_count: fileCount,
          total_size: totalSize
        });
      }
      
      setBucketStatus(statuses);
      setLastCheck(new Date());
      
    } catch (error: any) {
      console.error('Erro ao verificar status dos buckets:', error);
      toast({
        title: 'Erro ao verificar armazenamento',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fixBucket = async (bucketName: string) => {
    try {
      const { data, error } = await supabase.rpc('ensure_bucket_exists', {
        p_bucket_name: bucketName
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Bucket corrigido',
        description: `${bucketName}: ${data.message}`,
      });
      
      // Atualizar status
      await checkBucketStatus();
      
    } catch (error: any) {
      toast({
        title: 'Erro ao corrigir bucket',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    checkBucketStatus();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (bucket: BucketStatus) => {
    if (!bucket.exists) {
      return <Badge variant="destructive">Não existe</Badge>;
    }
    if (!bucket.public) {
      return <Badge variant="secondary">Privado</Badge>;
    }
    return <Badge variant="default">OK</Badge>;
  };

  const problemBuckets = bucketStatus.filter(b => !b.exists || !b.public);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Status do Armazenamento
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkBucketStatus}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {problemBuckets.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                {problemBuckets.length} bucket(s) com problema
              </div>
            </div>
          )}

          <div className="space-y-2">
            {bucketStatus.map((bucket) => (
              <div
                key={bucket.name}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{bucket.name}</span>
                    {getStatusBadge(bucket)}
                  </div>
                  {bucket.exists && (
                    <div className="text-xs text-gray-500 mt-1">
                      {bucket.file_count} arquivos • {formatBytes(bucket.total_size || 0)}
                      {bucket.file_size_limit > 0 && 
                        ` • Limite: ${formatBytes(bucket.file_size_limit)}`
                      }
                    </div>
                  )}
                </div>
                {(!bucket.exists || !bucket.public) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fixBucket(bucket.name)}
                  >
                    Corrigir
                  </Button>
                )}
              </div>
            ))}
          </div>

          {lastCheck && (
            <div className="text-xs text-gray-500 text-center pt-2">
              Última verificação: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};