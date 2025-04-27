
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";
import { uploadImageToImgBB } from "@/components/ui/file/services/imgbb";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface EventCoverImageProps {
  form: UseFormReturn<EventFormData>;
}

export const EventCoverImage = ({ form }: EventCoverImageProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { publicUrl } = await uploadImageToImgBB(file, "YOUR_IMGBB_API_KEY");
      form.setValue("cover_image_url", publicUrl);
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
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB");
        return;
      }
      handleImageUpload(file);
    }
  };

  return (
    <FormField
      control={form.control}
      name="cover_image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Imagem de Capa</FormLabel>
          <FormControl>
            <div>
              {field.value && (
                <div className="mb-2">
                  <img 
                    src={field.value} 
                    alt="Prévia" 
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className={isUploading ? "opacity-70" : ""}
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload da Imagem de Capa
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
        </FormItem>
      )}
    />
  );
};
