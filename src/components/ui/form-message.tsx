
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormMessageProps {
  type: "success" | "error" | "info";
  message?: string;
  className?: string;
}

export const FormMessage = ({ type, message, className }: FormMessageProps) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm mt-1.5",
        type === "error" && "text-red-500",
        type === "success" && "text-green-500",
        type === "info" && "text-[#0ABAB5]",
        "animate-fade-in",
        className
      )}
    >
      {type === "error" && <AlertCircle className="h-4 w-4" />}
      {type === "success" && <CheckCircle2 className="h-4 w-4" />}
      <span>{message}</span>
    </div>
  );
};
