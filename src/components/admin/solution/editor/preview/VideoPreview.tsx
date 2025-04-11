
import React from "react";

interface VideoPreviewProps {
  data: {
    url: string;
    caption?: string;
  };
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ data }) => {
  return (
    <figure className="my-4">
      <video
        src={data.url}
        controls
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

export default VideoPreview;
