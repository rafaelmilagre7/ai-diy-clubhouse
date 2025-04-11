
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { SolutionFormValues } from "./solutionFormSchema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";

interface BasicInfoLeftColumnProps {
  form: UseFormReturn<SolutionFormValues>;
}

const BasicInfoLeftColumn: React.FC<BasicInfoLeftColumnProps> = ({ form }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUploadComplete = (url: string) => {
    form.setValue("thumbnail_url", url, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Assistente de Vendas com IA" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Nome da solução que aparecerá no dashboard dos membros.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="Ex: assistente-vendas-ia" {...field} />
            </FormControl>
            <FormDescription>
              Identificador único para URLs (gerado automaticamente do título).
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
                placeholder="Descreva brevemente esta solução e seus benefícios..."
                rows={4}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Uma descrição curta que aparecerá no card da solução.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="thumbnail_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Imagem da Solução</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <FileUpload
                  bucketName="solution_files"
                  folder="thumbnails"
                  onUploadComplete={handleUploadComplete}
                  accept="image/*"
                  buttonText="Upload de Imagem"
                  fieldLabel=""
                  maxSize={5} // 5MB
                />
                
                {field.value && (
                  <div className="mt-2 border rounded overflow-hidden">
                    <img 
                      src={field.value}
                      alt="Preview da imagem"
                      className="max-h-[200px] max-w-full object-cover"
                    />
                  </div>
                )}
                
                <Input
                  type="hidden"
                  {...field}
                />
              </div>
            </FormControl>
            <FormDescription>
              Uma imagem representativa para a solução (recomendado: 600x400px).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoLeftColumn;
