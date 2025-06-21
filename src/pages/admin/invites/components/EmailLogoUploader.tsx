
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, Image } from 'lucide-react';
import { uploadEmailLogo, EMAIL_LOGO_URL } from '@/utils/logoUploader';
import { toast } from 'sonner';

const EmailLogoUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleUploadLogo = async () => {
    try {
      setIsUploading(true);
      setUploadStatus('idle');

      console.log('🖼️ Iniciando upload da logo para bucket "images"...');

      const logoUrl = await uploadEmailLogo();

      if (logoUrl) {
        setUploadStatus('success');
        toast.success('Logo enviada com sucesso para o Supabase Storage!');
        console.log('✅ Logo disponível em:', logoUrl);
      } else {
        throw new Error('Falha no upload da logo');
      }

    } catch (error: any) {
      console.error('❌ Erro no upload da logo:', error);
      setUploadStatus('error');
      toast.error('Erro ao enviar logo: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Upload da Logo para Emails
        </CardTitle>
        <CardDescription>
          Envie a logo do Viver de IA para o Supabase Storage para uso nos templates de email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleUploadLogo} 
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Enviando Logo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Logo para Storage
              </>
            )}
          </Button>

          {uploadStatus === 'success' && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Upload concluído!</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Erro no upload</span>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="font-semibold mb-2">Informações da Logo</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>URL atual:</strong>
              <code className="ml-2 text-xs bg-background px-2 py-1 rounded">
                {EMAIL_LOGO_URL}
              </code>
            </div>
            <div>
              <strong>Bucket:</strong> images
            </div>
            <div>
              <strong>Caminho:</strong> email/viver-de-ia-logo.png
            </div>
            <div>
              <strong>Formato:</strong> PNG
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Preview da Logo</h4>
          <div className="flex items-center justify-center p-4 bg-gradient-to-r from-cyan-300 to-teal-500 rounded">
            <img 
              src={EMAIL_LOGO_URL} 
              alt="Viver de IA Logo Preview" 
              className="h-14 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden text-white text-sm">
              Logo não carregada (faça o upload primeiro)
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Como funciona:</strong></p>
          <p>• A logo será enviada para o bucket 'images' no Supabase Storage</p>
          <p>• O template de email usará a URL pública do Storage</p>
          <p>• Melhor compatibilidade com clientes de email</p>
          <p>• A logo ficará disponível em: storage/v1/object/public/images/email/</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailLogoUploader;
