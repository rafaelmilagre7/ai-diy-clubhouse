
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Tool, ToolCategory } from '@/types/toolTypes';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const toolFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  official_url: z.string().url('URL inválida'),
  category: z.string(),
  status: z.boolean().default(true),
  logo_url: z.string().optional(),
  tags: z.array(z.string()).default([]),
  video_tutorials: z.array(
    z.object({
      title: z.string().min(1, 'Título é obrigatório'),
      url: z.string().url('URL inválida')
    })
  ).default([])
});

type ToolFormValues = z.infer<typeof toolFormSchema>;

interface ToolFormProps {
  initialData?: Tool;
  onSubmit: (data: ToolFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export const ToolForm: React.FC<ToolFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  const [tagInput, setTagInput] = useState('');
  const [videoTutorials, setVideoTutorials] = useState(initialData?.video_tutorials || []);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      official_url: initialData?.official_url || '',
      category: initialData?.category || '',
      status: initialData?.status ?? true,
      logo_url: initialData?.logo_url || '',
      tags: initialData?.tags || [],
      video_tutorials: initialData?.video_tutorials || []
    }
  });

  const handleLogoUpload = (url: string) => {
    form.setValue('logo_url', url);
  };

  const addTag = () => {
    const normalizedTag = tagInput.trim().toLowerCase();
    if (normalizedTag && !form.getValues('tags').includes(normalizedTag)) {
      form.setValue('tags', [...form.getValues('tags'), normalizedTag]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter((_, i) => i !== index));
  };

  const addVideoTutorial = () => {
    setVideoTutorials([...videoTutorials, { title: '', url: '' }]);
  };

  const updateVideoTutorial = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...videoTutorials];
    updated[index] = { ...updated[index], [field]: value };
    setVideoTutorials(updated);
    form.setValue('video_tutorials', updated);
  };

  const removeVideoTutorial = (index: number) => {
    const updated = videoTutorials.filter((_, i) => i !== index);
    setVideoTutorials(updated);
    form.setValue('video_tutorials', updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            render={() => (
              <FormItem>
                <FormLabel>Logo da Ferramenta</FormLabel>
                <FormControl>
                  <FileUpload
                    bucketName="tool_logos"
                    accept="image/*"
                    maxSize={2}
                    onUploadComplete={(url) => handleLogoUpload(url)}
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

          <div className="space-y-4">
            <FormLabel>Tags</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.watch('tags').map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Adicione tags..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tag
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Tutoriais em Vídeo</FormLabel>
              <Button type="button" variant="outline" onClick={addVideoTutorial}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tutorial
              </Button>
            </div>
            
            <div className="space-y-4">
              {videoTutorials.map((tutorial, index) => (
                <div key={index} className="flex gap-4 items-start border rounded-md p-4">
                  <div className="flex-1 space-y-4">
                    <Input
                      placeholder="Título do tutorial"
                      value={tutorial.title}
                      onChange={(e) => updateVideoTutorial(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="URL do vídeo do YouTube"
                      value={tutorial.url}
                      onChange={(e) => updateVideoTutorial(index, 'url', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeVideoTutorial(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Ferramenta'}
        </Button>
      </form>
    </Form>
  );
};
