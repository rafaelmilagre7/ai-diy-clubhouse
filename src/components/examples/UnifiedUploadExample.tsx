import React from 'react';
import { UnifiedFileUpload } from '@/components/ui/UnifiedFileUpload';
import { useUnifiedFileUpload } from '@/hooks/useUnifiedFileUpload';
import { STORAGE_BUCKETS } from '@/lib/supabase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Exemplo de como usar o novo sistema unificado de upload
export const UnifiedUploadExample: React.FC = () => {
  const materialUpload = useUnifiedFileUpload({
    bucketName: STORAGE_BUCKETS.LEARNING_MATERIALS,
    folder: 'examples',
    onUploadComplete: (url, fileName, fileSize) => {
      console.log('Material uploaded:', { url, fileName, fileSize });
    },
  });

  const imageUpload = useUnifiedFileUpload({
    bucketName: STORAGE_BUCKETS.COURSE_IMAGES,
    folder: 'examples',
    onUploadComplete: (url, fileName, fileSize) => {
      console.log('Image uploaded:', { url, fileName, fileSize });
    },
  });

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Sistema Unificado de Upload - Exemplos</h2>
      
      {/* Exemplo 1: Upload de documentos com dropzone */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Materiais (Dropzone)</CardTitle>
        </CardHeader>
        <CardContent>
          <UnifiedFileUpload
            bucketName={STORAGE_BUCKETS.LEARNING_MATERIALS}
            folder="examples"
            variant="dropzone"
            accept=".pdf,.doc,.docx,.txt"
            maxSize={200} // 200MB
            fieldLabel="Selecione materiais de aprendizado"
            onUploadComplete={(url, fileName, fileSize) => {
              console.log('Upload completo:', { url, fileName, fileSize });
            }}
          />
          
          {materialUpload.uploadedFile && (
            <div className="mt-4 p-3 bg-success/10 rounded-md">
              <p className="text-sm text-success">
                Arquivo enviado: {materialUpload.uploadedFile.name}
              </p>
              <a 
                href={materialUpload.uploadedFile.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm"
              >
                Visualizar arquivo
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exemplo 2: Upload de imagens com botão */}
      <Card>
        <CardHeader>
          <CardTitle>Upload de Imagens (Botão)</CardTitle>
        </CardHeader>
        <CardContent>
          <UnifiedFileUpload
            bucketName={STORAGE_BUCKETS.COURSE_IMAGES}
            folder="examples"
            variant="button"
            accept="image/*"
            maxSize={5} // 5MB
            buttonText="Selecionar Imagem"
            fieldLabel="Imagem do curso"
            onUploadComplete={(url, fileName, fileSize) => {
              console.log('Imagem uploaded:', { url, fileName, fileSize });
            }}
          />
          
          {imageUpload.uploadedFile && (
            <div className="mt-4">
              <img 
                src={imageUpload.uploadedFile.url} 
                alt="Uploaded image"
                className="max-w-xs rounded-md border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exemplo 3: Hook customizado */}
      <Card>
        <CardHeader>
          <CardTitle>Hook Customizado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    materialUpload.uploadFile(file);
                  }
                }}
                disabled={materialUpload.isUploading}
              />
              
              {materialUpload.isUploading && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={materialUpload.cancelUpload}
                >
                  Cancelar ({materialUpload.progress}%)
                </Button>
              )}
            </div>

            {materialUpload.error && (
              <div className="text-destructive text-sm">
                Erro: {materialUpload.error}
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={materialUpload.clearError}
                  className="ml-2"
                >
                  Limpar erro
                </Button>
              </div>
            )}

            {materialUpload.uploadedFile && (
              <div className="text-success text-sm">
                Arquivo enviado: {materialUpload.uploadedFile.name}
                <Button 
                  variant="link" 
                  size="sm"
                  onClick={materialUpload.clearUploadedFile}
                  className="ml-2"
                >
                  Limpar
                </Button>
              </div>
            )}

            <Button 
              variant="outline"
              onClick={materialUpload.reset}
              disabled={materialUpload.isUploading}
            >
              Reset completo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};