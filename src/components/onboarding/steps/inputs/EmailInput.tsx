
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string | FieldError;
}

export const EmailInput = ({ value, onChange, disabled, readOnly, error }: EmailInputProps) => (
  <div>
    <Label htmlFor="email">E-mail</Label>
    <Input
      id="email"
      type="email"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="exemplo@dominio.com"
      className={error ? "border-red-400" : ""}
    />
    {error && <p className="text-xs text-red-500 mt-1">{typeof error === 'string' ? error : error.message}</p>}
  </div>
);
