
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface EventCoverImageProps {
  form: UseFormReturn<EventFormData>;
}

export const EventCoverImage = ({ form }: EventCoverImageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data, error } = await supabase.functions.invoke('image-upload', {
        body: formData
      });

      if (error) throw error;

      form.setValue("cover_image_url", data.publicUrl);
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="space-y-6 p-6 surface-elevated rounded-xl border border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-2 h-6 bg-revenue rounded-full" />
        <h3 className="text-heading-3">Imagem de Capa</h3>
      </div>

      <FormField
        control={form.control}
        name="cover_image_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-label">Imagem do Evento</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {field.value && (
                  <div className="relative group">
                    <img 
                      src={field.value} 
                      alt="Prévia da imagem do evento" 
                      className="w-full max-h-48 object-cover rounded-xl border border-border/50 shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Clique para alterar</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    className={`transition-all duration-200 ${
                      isUploading 
                        ? "opacity-70 cursor-not-allowed" 
                        : "hover:bg-aurora-primary/10 hover:border-aurora-primary/30 hover:text-aurora-primary"
                    }`}
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    size="default"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {field.value ? "Trocar Imagem" : "Adicionar Imagem"}
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
                
                <p className="text-caption">
                  Recomendado: 1200x630px, máximo 2MB
                </p>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
