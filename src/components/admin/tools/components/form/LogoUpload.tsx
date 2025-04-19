
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../../types/toolFormTypes';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface LogoUploadProps {
  form: UseFormReturn<ToolFormValues>;
}

export const LogoUpload = ({ form }: LogoUploadProps) => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(form.getValues('logo_url'));

  // Função para atualizar o logo no formulário
  const handleUploadComplete = (url: string) => {
    console.log('Logo upload completo, URL:', url);
    
    // Verifica se o URL é diferente antes de atualizar
    if (url !== form.getValues('logo_url')) {
      console.log('Atualizando logo_url para:', url);
      
      // Usar setValue com as flags adequadas
      form.setValue('logo_url', url, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      });
      
      // Atualizar o estado local
      setLogoUrl(url);
      
      // Disparar evento de mudança para garantir que o formulário detecte a alteração
      const event = new Event('input', { bubbles: true });
      document.dispatchEvent(event);
      
      // Forçar renderização do formulário marcando-o explicitamente como dirty
      setTimeout(() => {
        console.log('FormState após upload:', form.formState);
      }, 100);
    }
  };

  return (
    <FormField
      control={form.control}
      name="logo_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Logo da Ferramenta</FormLabel>
          <div className="space-y-4">
            {logoUrl && (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={logoUrl} alt="Logo da ferramenta" />
                  <AvatarFallback>Logo</AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">Logo atual</p>
              </div>
            )}
            <FormControl>
              <FileUpload
                bucketName="tool_logos"
                onUploadComplete={handleUploadComplete}
                accept="image/*"
                maxSize={2}
                buttonText="Upload do Logo"
                fieldLabel="Selecione uma imagem para o logo"
                initialFileUrl={logoUrl}
              />
            </FormControl>
          </div>
          <FormDescription>
            Logo da ferramenta (formato quadrado recomendado, PNG ou JPG)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
