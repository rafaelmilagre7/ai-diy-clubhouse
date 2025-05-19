
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type FormMessageType = "error" | "success" | "info";

interface FormMessageProps {
  type?: FormMessageType;
  message?: string;
  className?: string;
}

export const FormMessage = ({
  type = "info",
  message,
  className,
}: FormMessageProps) => {
  if (!message) return null;

  const iconMap = {
    error: <AlertTriangle className="h-4 w-4" />,
    success: <CheckCircle className="h-4 w-4" />,
    info: <Info className="h-4 w-4" />,
  };

  const colorMap = {
    error: "text-red-300 bg-red-900/30 border-red-700",
    success: "text-green-300 bg-green-900/30 border-green-700",
    info: "text-blue-300 bg-blue-900/30 border-blue-700",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 text-sm rounded-md border",
        colorMap[type],
        className
      )}
    >
      {iconMap[type]}
      <span>{message}</span>
    </div>
  );
};
