
import React from "react";

interface ImagePreviewProps {
  data: {
    url: string;
    alt?: string;
    caption?: string;
  };
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ data }) => {
  return (
    <figure className="my-4">
      <img
        src={data.url}
        alt={data.alt || data.caption || 'Imagem'}
        className="rounded mx-auto max-w-full"
      />
      {data.caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImagePreview;
