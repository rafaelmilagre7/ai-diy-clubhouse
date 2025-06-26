
import { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../../types/toolFormTypes';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface LogoUploadProps {
  form: UseFormReturn<ToolFormValues>;
  initialUrl?: string;
  onUploadComplete?: (url: string) => void;
  onRemove?: () => void;
}

export const LogoUpload = ({ form, initialUrl, onUploadComplete, onRemove }: LogoUploadProps) => {
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
    <div className="space-y-4">
      <Label htmlFor="logo-upload">Logo da Ferramenta</Label>
      
      {logoUrl ? (
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
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <FileUpload
              bucketName="TOOL_LOGOS"
              folder="logos"
              onUploadComplete={handleUploadComplete}
              accept="image/*"
              maxSize={5}
              buttonText="Escolher Logo"
              fieldLabel="Arraste e solte ou clique para selecionar"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            PNG, JPG, GIF até 5MB
          </p>
        </div>
      )}
    </div>
  );
};
