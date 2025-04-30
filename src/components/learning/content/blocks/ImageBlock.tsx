
import React from "react";
import { ImageBlockData } from "@/components/admin/solution/editor/BlockTypes";
import Image from "next/image";

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
        <img 
          src={url} 
          alt={alt || caption || "Imagem da aula"} 
          className="w-full h-auto object-cover" 
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-center text-gray-500 mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
