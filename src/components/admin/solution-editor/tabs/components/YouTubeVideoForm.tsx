
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Youtube, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const youtubeSchema = z.object({
  name: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  url: z.string().url({ message: "URL inválida" }).refine(
    (url) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      return regExp.test(url);
    },
    { message: "Informe uma URL válida do YouTube" }
  ),
  description: z.string().optional(),
});

type YouTubeFormValues = z.infer<typeof youtubeSchema>;

interface YouTubeVideoFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddYouTube: (data: { name: string; url: string; description: string; }) => Promise<void>;
  isUploading: boolean;
}

const YouTubeVideoForm: React.FC<YouTubeVideoFormProps> = ({
  isOpen,
  onOpenChange,
  onAddYouTube,
  isUploading,
}) => {
  const form = useForm<YouTubeFormValues>({
    resolver: zodResolver(youtubeSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
    },
  });

  const handleSubmit = async (data: YouTubeFormValues) => {
    try {
      await onAddYouTube({
        name: data.name,
        url: data.url,
        description: data.description || "",
      });
      form.reset();
    } catch (error) {
      console.error("Erro ao adicionar vídeo do YouTube:", error);
    }
  };

  // Extrair ID do YouTube para preview
  const url = form.watch("url");
  const youtubeId = React.useMemo(() => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [url]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Youtube className="h-5 w-5 text-red-500" />
            Adicionar vídeo do YouTube
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do vídeo*</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Como implementar IA no atendimento"
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do YouTube*</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://www.youtube.com/watch?v=..."
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormDescription>
                    Cole a URL completa do vídeo do YouTube
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {youtubeId && (
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="aspect-video max-h-[200px]">
                  <img 
                    src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                    alt="Thumbnail do YouTube"
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Preview da thumbnail do vídeo
                </p>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva brevemente o conteúdo do vídeo"
                      rows={3}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !form.formState.isValid}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar Vídeo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeVideoForm;
