
import React from "react";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "md", 
  className = "" 
}) => {
  // Convertemos o tamanho para valores numéricos
  const sizeValue = size === "sm" ? 4 : size === "md" ? 6 : 8;
  
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div 
        className={`h-${sizeValue} w-${sizeValue} animate-spin rounded-full border-2 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-primary`}
        role="status"
      />
    </div>
  );
};
