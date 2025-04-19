
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
  
  // Garantir que o logoUrl seja atualizado quando o valor do formulário mudar
  useEffect(() => {
    setLogoUrl(form.getValues('logo_url'));
  }, [form]);
  
  // Função para atualizar o logo no formulário quando o upload for concluído
  const handleUploadComplete = (url: string) => {
    console.log('Logo enviado com sucesso:', url);
    
    // Atualizar o estado local
    setLogoUrl(url);
    
    // Atualizar o valor no formulário
    form.setValue('logo_url', url, { 
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true 
    });
    
    // Notificar o formulário que houve mudança
    form.trigger('logo_url');
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
