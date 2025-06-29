
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

      const { data, error } = await supabase.functions.invoke('upload-image', {
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
    <FormField
      control={form.control}
      name="cover_image_url"
      render={({ field }) => (
        <FormItem>
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Imagem de Capa</h3>
            <FormLabel>Imagem de Capa</FormLabel>
            <FormControl>
              <div className="space-y-3">
                {field.value && (
                  <div className="mt-2">
                    <img 
                      src={field.value} 
                      alt="Prévia" 
                      className="w-full max-h-44 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex items-center justify-start">
                  <Button
                    type="button"
                    variant="outline"
                    className={isUploading ? "opacity-70" : ""}
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {field.value ? "Trocar Imagem" : "Upload da Imagem"}
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
              </div>
            </FormControl>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
