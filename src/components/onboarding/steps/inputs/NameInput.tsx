
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string | FieldError;
}

export const NameInput = ({ value, onChange, disabled, readOnly, error }: NameInputProps) => (
  <div>
    <Label htmlFor="name">Nome Completo</Label>
    <Input
      id="name"
      type="text"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="Seu nome completo"
      className={error ? "border-red-400" : ""}
    />
    {error && <p className="text-xs text-red-500 mt-1">{typeof error === 'string' ? error : error.message}</p>}
  </div>
);
