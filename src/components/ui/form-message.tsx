
import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FormMessageProps {
  message?: string;
  type?: "error" | "success";
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({ 
  message, 
  type = "error", 
  className 
}) => {
  if (!message) return null;
  
  return (
    <div 
      className={cn(
        "flex items-center text-xs font-medium mt-1",
        type === "error" ? "text-red-500" : "text-[#0ABAB5]",
        className
      )}
    >
      {type === "error" ? (
        <AlertCircle className="h-3 w-3 mr-1" />
      ) : (
        <CheckCircle className="h-3 w-3 mr-1" /> 
      )}
      <span>{message}</span>
    </div>
  );
};
