import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableCardTitleProps {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
  placeholder?: string;
}

export const EditableCardTitle: React.FC<EditableCardTitleProps> = ({ 
  title, 
  onSave, 
  placeholder = "Título do card..." 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value.trim() === '') {
      setValue(title);
      setIsEditing(false);
      toast.error('O título não pode estar vazio');
      return;
    }
    
    if (value !== title) {
      setIsSaving(true);
      try {
        await onSave(value);
        toast.success('Título atualizado! ✨');
      } catch (error) {
        console.error('Erro ao atualizar título:', error);
        toast.error('Erro ao atualizar título');
        setValue(title);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className={cn(
            "w-full font-semibold text-base px-3 py-2 rounded-lg",
            "border-2 border-primary bg-background",
            "focus:outline-none focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200"
          )}
          placeholder={placeholder}
          disabled={isSaving}
        />
        {isSaving && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>
    );
  }

  return (
    <h4 
      onClick={() => setIsEditing(true)}
      className={cn(
        "font-semibold text-base leading-tight cursor-text",
        "px-2 py-1.5 rounded-md transition-colors",
        "hover:bg-muted/50",
        !title && "text-muted-foreground italic"
      )}
      title="Clique para editar"
    >
      {title || placeholder}
    </h4>
  );
};
