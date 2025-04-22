
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import InputMask from "react-input-mask";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (field: string, value: string) => void;
  readOnly?: boolean;
  ddi?: string;
  error?: string;
  onChangeDDI?: (field: string, value: string) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  readOnly = false,
  ddi = "+55",
  error,
  onChangeDDI
}) => {
  return (
    <div>
      <Label htmlFor="phone">Telefone</Label>
      <div className="flex">
        <Input 
          id="ddi" 
          value={ddi} 
          readOnly={!onChangeDDI}
          onChange={e => onChangeDDI && onChangeDDI("ddi", e.target.value)}
          className="w-16 mr-2"
        />
        <InputMask
          mask="(99) 99999-9999"
          value={value}
          onChange={(e) => onChange("phone", e.target.value)}
          readOnly={readOnly}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500"
          )}
          placeholder="(00) 00000-0000"
        >
          {/* Removendo a renderização de children aqui, o readOnly será passado diretamente */}
        </InputMask>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
