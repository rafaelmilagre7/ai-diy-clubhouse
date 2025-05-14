
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FieldError } from "react-hook-form";
import InputMask from "react-input-mask";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  ddi?: string;
  onChangeDDI?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string | FieldError;
}

export const PhoneInput = ({ 
  value, 
  onChange, 
  ddi = "+55", 
  onChangeDDI, 
  disabled, 
  readOnly,
  error 
}: PhoneInputProps) => {
  return (
    <div>
      <Label htmlFor="phone">Telefone</Label>
      <div className="flex gap-2">
        <div className="w-24">
          <Select
            value={ddi}
            onValueChange={onChangeDDI ? onChangeDDI : () => {}}
            disabled={disabled || !onChangeDDI}
          >
            <SelectTrigger>
              <SelectValue placeholder={ddi} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+55">+55 🇧🇷</SelectItem>
              <SelectItem value="+1">+1 🇺🇸</SelectItem>
              <SelectItem value="+351">+351 🇵🇹</SelectItem>
              <SelectItem value="+44">+44 🇬🇧</SelectItem>
              <SelectItem value="+34">+34 🇪🇸</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <InputMask
            mask={ddi === "+55" ? "(99) 99999-9999" : "999-999-9999"}
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            className={`w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-red-400" : ""}`}
            placeholder={ddi === "+55" ? "(11) 99999-9999" : "555-555-5555"}
          />
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {typeof error === 'string' ? error : error.message}
        </p>
      )}
    </div>
  );
};
