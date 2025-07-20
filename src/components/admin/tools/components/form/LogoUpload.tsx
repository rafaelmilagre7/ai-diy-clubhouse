
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../../types/toolFormTypes';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { STORAGE_BUCKETS } from '@/lib/supabase/config';

interface LogoUploadProps {
  form: UseFormReturn<ToolFormValues>;
}

export const LogoUpload = ({ form }: LogoUploadProps) => {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(form.getValues('logo_url'));
  
  useEffect(() => {
    setLogoUrl(form.getValues('logo_url'));
  }, [form]);
  
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
    
    // Marcar o formulário como modificado
    form.setValue('formModified', true);
    
    // Notificar o formulário que houve mudança
    form.trigger('logo_url');
  };

  const handleRemoveLogo = () => {
    setLogoUrl(undefined);
    form.setValue('logo_url', '', { 
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true 
    });
    form.setValue('formModified', true);
    form.trigger('logo_url');
  };

  return (
    <FormField
      control={form.control}
      name="logo_url"
      render={({ field }) => (
        <FormItem>
          <div className="space-y-4">
            {logoUrl && (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={logoUrl} alt="Logo da ferramenta" />
                    <AvatarFallback>Logo</AvatarFallback>
                  </Avatar>
                  <Button 
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Logo atual</p>
              </div>
            )}
            <FormControl>
              <FileUpload
                bucketName={STORAGE_BUCKETS.TOOL_LOGOS}
                folder="logos"
                onUploadComplete={handleUploadComplete}
                accept="image/*"
                maxSize={5}
                buttonText={logoUrl ? "Trocar logo" : "Upload do Logo"}
                fieldLabel="Selecione uma imagem para o logo"
                initialFileUrl={logoUrl}
              />
            </FormControl>
          </div>
          <FormDescription>
            Logo da ferramenta (formato quadrado recomendado, PNG ou JPG, máximo 5MB)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
