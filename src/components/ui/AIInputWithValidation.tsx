import { CornerRightUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/useAutoResizeTextarea";

interface AIInputWithValidationProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  minChars?: number;
  maxChars?: number;
  loadingDuration?: number;
  onSubmit?: (value: string) => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export function AIInputWithValidation({
  id = "ai-input-validation",
  placeholder = "Descreva sua ideia aqui...",
  minHeight = 56,
  maxHeight = 200,
  minChars = 30,
  maxChars = 2000,
  loadingDuration = 3000,
  onSubmit,
  className,
  disabled = false,
  value: externalValue,
  onChange: externalOnChange
}: AIInputWithValidationProps) {
  const [internalValue, setInternalValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });

  const inputValue = externalValue !== undefined ? externalValue : internalValue;
  const setInputValue = externalOnChange || setInternalValue;

  useEffect(() => {
    if (externalValue !== undefined) {
      adjustHeight();
    }
  }, [externalValue, adjustHeight]);

  const charCount = inputValue.length;
  const isNearLimit = charCount > maxChars * 0.9;
  const isOverLimit = charCount > maxChars;
  const isTooShort = charCount > 0 && charCount < minChars;

  const validateInput = (value: string): string | null => {
    if (!value.trim()) {
      return "Por favor, descreva sua ideia";
    }
    if (value.length < minChars) {
      return `Mínimo de ${minChars} caracteres (faltam ${minChars - value.length})`;
    }
    if (value.length > maxChars) {
      return `Máximo de ${maxChars} caracteres (${value.length - maxChars} a mais)`;
    }
    // Validar caracteres especiais perigosos
    if (/<script|javascript:|onerror=/i.test(value)) {
      return "Texto contém caracteres não permitidos";
    }
    return null;
  };

  const handleSubmit = async () => {
    if (submitted || disabled) return;
    
    const validationError = validateInput(inputValue);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setError("");
    setSubmitted(true);
    await onSubmit?.(inputValue);
    
    if (externalValue === undefined) {
      setInputValue("");
      adjustHeight(true);
    }
    
    setTimeout(() => {
      setSubmitted(false);
    }, loadingDuration);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Permitir digitar mas mostrar erro
    setInputValue(newValue);
    adjustHeight();
    
    // Limpar erro quando usuário começar a corrigir
    if (error && !validateInput(newValue)) {
      setError("");
    }
  };

  // Calcular cor do contador
  const getCounterColor = () => {
    if (isOverLimit) return "text-destructive";
    if (isNearLimit) return "text-warning";
    if (isTooShort) return "text-muted-foreground/70";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("w-full py-2", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-start flex-col gap-1">
        <div className="relative max-w-xl w-full mx-auto">
          <Textarea
            id={id}
            placeholder={placeholder}
            className={cn(
              "max-w-xl bg-white/10 backdrop-blur-sm w-full rounded-3xl pl-6 pr-10 py-4",
              "placeholder:text-muted-foreground/70",
              "border ring-primary/30",
              error || isOverLimit ? "border-destructive/50" : "border-white/20",
              "text-foreground resize-none text-wrap leading-[1.2]",
              "focus-visible:ring-2 focus-visible:ring-offset-0",
              error || isOverLimit 
                ? "focus-visible:ring-destructive/30" 
                : "focus-visible:ring-primary/30",
              "hover:bg-white/15",
              error || isOverLimit ? "hover:border-destructive/70" : "hover:border-white/30",
              "transition-all duration-200",
              `min-h-[${minHeight}px]`
            )}
            ref={textareaRef}
            value={inputValue}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={submitted || disabled}
            maxLength={maxChars + 100} // Permitir digitar um pouco mais para mostrar erro
          />
          <button
            onClick={handleSubmit}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl py-1 px-1 transition-all",
              submitted ? "bg-none" : "bg-surface-elevated hover:bg-accent",
              (error || isOverLimit || isTooShort) && "opacity-50 cursor-not-allowed"
            )}
            type="button"
            disabled={submitted || disabled || !inputValue.trim() || isOverLimit || isTooShort}
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
                  inputValue.trim() && !error && !isOverLimit && !isTooShort
                    ? "opacity-100" 
                    : "opacity-30"
                )}
              />
            )}
          </button>
        </div>

        {/* Feedback e contador */}
        <div className="flex items-center justify-between w-full px-4 h-4">
          <div className="flex items-center gap-2">
            {error && (
              <div className="flex items-center gap-1.5 text-destructive animate-in fade-in slide-in-from-left-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}
            {!error && submitted && (
              <p className="text-xs text-muted-foreground animate-pulse">
                IA está processando...
              </p>
            )}
            {!error && !submitted && inputValue.trim() && !isTooShort && !isOverLimit && (
              <p className="text-xs text-primary animate-in fade-in">
                ✓ Pronto para enviar!
              </p>
            )}
          </div>

          {/* Contador de caracteres */}
          {charCount > 0 && (
            <div className={cn(
              "text-xs font-mono transition-colors duration-200",
              getCounterColor()
            )}>
              <span className={cn(
                "font-semibold",
                isOverLimit && "animate-pulse"
              )}>
                {charCount.toLocaleString('pt-BR')}
              </span>
              <span className="opacity-70">
                /{maxChars.toLocaleString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}