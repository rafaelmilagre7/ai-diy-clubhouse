
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { FileUpload } from '@/components/ui/file-upload';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../../types/toolFormTypes';

interface LogoUploadProps {
  form: UseFormReturn<ToolFormValues>;
}

export const LogoUpload = ({ form }: LogoUploadProps) => {
  return (
    <FormField
      control={form.control}
      name="logo_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Logo da Ferramenta</FormLabel>
          <FormControl>
            <FileUpload
              bucketName="tool_logos"
              onUploadComplete={(url) => form.setValue('logo_url', url)}
              accept="image/*"
              maxSize={2}
              buttonText="Upload do Logo"
              fieldLabel="Selecione uma imagem para o logo"
            />
          </FormControl>
          <FormDescription>
            Logo da ferramenta (formato quadrado recomendado, PNG ou JPG)
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
