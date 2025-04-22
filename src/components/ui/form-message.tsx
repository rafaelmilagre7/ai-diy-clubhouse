
import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface FormMessageProps {
  type?: "error" | "success" | "warning" | "info";
  message?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({
  type = "error",
  message,
  children,
  className,
}) => {
  if (!message && !children) return null;

  const content = message || children;
  
  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return "text-red-500 flex items-center";
      case "success":
        return "text-green-600 flex items-center";
      case "warning":
        return "text-amber-500 flex items-center";
      case "info":
        return "text-blue-500 flex items-center";
      default:
        return "text-gray-500 flex items-center";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-3 w-3 mr-1.5" />;
      case "success":
        return <CheckCircle className="h-3 w-3 mr-1.5" />;
      case "warning":
        return <AlertCircle className="h-3 w-3 mr-1.5" />;
      case "info":
        return <AlertCircle className="h-3 w-3 mr-1.5" />;
      default:
        return null;
    }
  };

  return (
    <p className={cn("text-xs mt-1", getTypeStyles(), className)}>
      {getIcon()}
      {content}
    </p>
  );
};
