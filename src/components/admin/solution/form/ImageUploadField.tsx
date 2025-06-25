
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { ImageUpload } from "@/components/common/ImageUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, X } from "lucide-react";
import { Control } from "react-hook-form";
import { SolutionFormValues } from "./solutionFormSchema";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  control: Control<SolutionFormValues>;
  name: keyof SolutionFormValues;
  label: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  control,
  name,
  label
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Efeito para sincronizar o preview com o valor do campo
        useEffect(() => {
          if (field.value && typeof field.value === 'string' && !imagePreview) {
            setImagePreview(field.value);
          }
        }, [field.value, imagePreview]);
        
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <Card className="overflow-hidden">
                      <CardContent className="p-2">
                        <div className="aspect-video relative">
                          <img 
                            src={imagePreview} 
                            alt="Thumbnail preview" 
                            className="rounded object-cover w-full h-full"
                            onError={() => setImagePreview(null)}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full"
                            onClick={() => {
                              field.onChange("");
                              setImagePreview(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <ImageUpload
                    value={field.value as string}
                    onChange={(url) => {
                      field.onChange(url);
                      setImagePreview(url);
                    }}
                    bucketName="solution_files"
                    folderPath="thumbnails"
                    maxSizeMB={5}
                  />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default ImageUploadField;
