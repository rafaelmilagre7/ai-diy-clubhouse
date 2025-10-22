
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, ExternalLink } from 'lucide-react';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { STORAGE_BUCKETS } from '@/lib/supabase/config';
import { ToolFormValues } from '../../types/toolFormTypes';

interface LogoUploadProps {
  form: UseFormReturn<ToolFormValues>;
}

export const LogoUpload = ({ form }: LogoUploadProps) => {
  const [logoUrl, setLogoUrl] = useState(form.watch('logo_url') || '');
  
  const { uploadFile, isUploading, progress } = useUnifiedFileUpload({
    bucketName: STORAGE_BUCKETS.TOOL_LOGOS,
    folder: 'logos',
    onUploadComplete: (url) => {
      setLogoUrl(url);
      form.setValue('logo_url', url, { shouldDirty: true });
    },
    onUploadError: (error) => {
      console.error('[LOGO_UPLOAD] Erro no upload:', error);
    }
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoUrl(url);
    form.setValue('logo_url', url, { shouldDirty: true });
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    form.setValue('logo_url', '', { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Logo da Ferramenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="logo_url">URL do Logo</Label>
          <div className="flex gap-2">
            <Input
              id="logo_url"
              value={logoUrl}
              onChange={handleUrlChange}
              placeholder="https://exemplo.com/logo.png"
              className="flex-1"
            />
            {logoUrl && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.open(logoUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">ou</p>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                  Enviando... {progress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer upload do logo
                </>
              )}
            </Button>
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>
        </div>

        {logoUrl && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Preview do Logo</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveLogo}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Remover
            </Button>
          </div>
          <div className="border rounded-md p-4 bg-muted/30 flex items-center justify-center min-h-32">
              <img
                src={logoUrl}
                alt="Preview do logo"
                className="max-h-20 max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/200x80?text=Logo+não+encontrado";
                }}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Formatos aceitos: JPG, PNG, WebP, SVG, GIF. Tamanho máximo: 5MB.
        </p>
      </CardContent>
    </Card>
  );
};
