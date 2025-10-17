
import React from "react";
import { ImageBlockData } from "@/components/admin/solution/editor/BlockTypes";
import { OptimizedImage } from "@/components/common/OptimizedImage";

interface ImageBlockProps {
  data: ImageBlockData;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ data }) => {
  const { url, caption, alt } = data;
  
  if (!url) {
    return null;
  }
  
  return (
    <figure className="my-6">
      <div className="rounded-lg overflow-hidden">
        <OptimizedImage 
          src={url} 
          alt={alt || caption || "Imagem da aula"} 
          className="w-full h-auto object-cover"
          priority="normal"
          enableOptimization={true}
          fallbackSrc="https://placehold.co/800x400?text=Imagem+não+disponível"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-center text-muted-foreground mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
