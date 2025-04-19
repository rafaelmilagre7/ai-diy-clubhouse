
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { UseFormReturn } from 'react-hook-form';
import { ToolFormValues } from '../types/toolFormTypes';

interface BasicInfoProps {
  form: UseFormReturn<ToolFormValues>;
}

export const BasicInfo = ({ form }: BasicInfoProps) => {
  return (
    <div className="grid gap-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da Ferramenta</FormLabel>
            <FormControl>
              <Input placeholder="Ex: ChatGPT" {...field} />
            </FormControl>
            <FormDescription>
              Nome da ferramenta como é conhecido no mercado.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="logo_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Logo da Ferramenta</FormLabel>
            <FormControl>
              <FileUpload
                bucketName="tool_logos"
                accept="image/*"
                maxSize={2}
                onUploadComplete={(url) => form.setValue('logo_url', url)}
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

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descreva o que a ferramenta faz..." 
                {...field} 
                rows={4}
              />
            </FormControl>
            <FormDescription>
              Descrição clara e objetiva da ferramenta
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IA">IA</SelectItem>
                  <SelectItem value="Automação">Automação</SelectItem>
                  <SelectItem value="No-Code">No-Code</SelectItem>
                  <SelectItem value="Integração">Integração</SelectItem>
                  <SelectItem value="Produtividade">Produtividade</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Status</FormLabel>
                <FormDescription>
                  Ativa para exibir aos membros
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="official_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Oficial</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://exemplo.com" 
                type="url"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Website oficial da ferramenta
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
