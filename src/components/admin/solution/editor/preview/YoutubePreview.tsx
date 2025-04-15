
import React from "react";

interface YoutubePreviewProps {
  data: {
    youtubeId: string;
    caption?: string;
  };
}

const YoutubePreview: React.FC<YoutubePreviewProps> = ({ data }) => {
  return (
    <figure className="my-6">
      <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-md">
        <iframe
          src={`https://www.youtube.com/embed/${data.youtubeId}`}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {data.caption && (
        <figcaption className="text-center text-sm text-muted-foreground mt-2 italic">
          {data.caption}
        </figcaption>
      )}
    </figure>
  );
};

export default YoutubePreview;
