import { CornerRightUp } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";

interface AIInputWithLoadingProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  loadingDuration?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  className?: string;
  disabled?: boolean;
}

export function AIInputWithLoading({
  id = "ai-input-with-loading",
  placeholder = "Descreva sua ideia aqui...",
  minHeight = 56,
  maxHeight = 200,
  loadingDuration = 3000,
  onSubmit,
  className,
  disabled = false
}: AIInputWithLoadingProps) {
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const handleSubmit = async () => {
    if (!inputValue.trim() || submitted || disabled) return;
    
    setSubmitted(true);
    await onSubmit?.(inputValue);
    setInputValue("");
    adjustHeight(true);
    
    setTimeout(() => {
      setSubmitted(false);
    }, loadingDuration);
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-start flex-col gap-2">
        <div className="relative max-w-xl w-full mx-auto">
          <Textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "max-w-xl bg-surface-elevated/50 w-full rounded-3xl pl-6 pr-10 py-4",
              "placeholder:text-muted-foreground",
              "border border-border/50 ring-primary/30",
              "text-foreground resize-none text-wrap leading-[1.2]",
              "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0",
              "transition-all duration-200",
              `min-h-[${minHeight}px]`
            )}
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={submitted || disabled}
          />
          <button
            onClick={handleSubmit}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl py-1 px-1 transition-all",
              submitted ? "bg-none" : "bg-surface-elevated hover:bg-accent"
            )}
            type="button"
            disabled={submitted || disabled || !inputValue.trim()}
          >
            {submitted ? (
              <div
                className="w-4 h-4 bg-primary rounded-sm animate-spin transition duration-700"
                style={{ animationDuration: "3s" }}
              />
            ) : (
              <CornerRightUp
                className={cn(
                  "w-4 h-4 transition-opacity text-foreground",
                  inputValue.trim() ? "opacity-100" : "opacity-30"
                )}
              />
            )}
          </button>
        </div>
        <p className="pl-4 h-4 text-xs mx-auto text-muted-foreground">
          {submitted ? "IA está pensando..." : inputValue.trim() ? "Pronto para enviar!" : "Digite sua ideia"}
        </p>
      </div>
    </div>
  );
}
