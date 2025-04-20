
import React, { useState } from "react";
import { Tool } from "@/types/toolTypes";
import { useLogging } from "@/hooks/useLogging";

interface ToolImageProps {
  tool: Tool;
  size?: "small" | "medium";
}

export const ToolImage: React.FC<ToolImageProps> = ({ tool, size = "medium" }) => {
  const { logError } = useLogging();
  const [imageError, setImageError] = useState(false);
  const sizeClasses = size === "small" ? "h-10 w-10" : "h-12 w-12";

  const getInitials = () => {
    return tool.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`${sizeClasses} rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {tool.logo_url && !imageError ? (
        <img
          src={tool.logo_url}
          alt={tool.name}
          className="h-full w-full object-contain"
          onError={(e) => {
            logError("Erro ao carregar imagem da ferramenta", {
              tool: tool.name,
              logo_url: tool.logo_url,
            });
            setImageError(true);
          }}
        />
      ) : (
        <div className="text-xl font-bold text-[#0ABAB5]">
          {getInitials()}
        </div>
      )}
    </div>
  );
};
