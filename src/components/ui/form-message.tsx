
import { cn } from "@/lib/utils";
import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface FormMessageProps {
  type?: "success" | "error" | "warning" | "info";
  message?: string;
  className?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({
  type = "error",
  message,
  className,
}) => {
  if (!message) return null;

  const iconMap = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <AlertCircle className="h-4 w-4" />,
  };

  const colorMap = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm mt-1",
        colorMap[type],
        className
      )}
    >
      {iconMap[type]}
      <span>{message}</span>
    </div>
  );
};
