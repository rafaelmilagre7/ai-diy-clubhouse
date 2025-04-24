
import React, { useState } from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt = "Imagem",
  className = "", 
  fallback = null,
  ...rest 
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return fallback || (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Sem imagem</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      {...rest}
    />
  );
};

export default Image;
