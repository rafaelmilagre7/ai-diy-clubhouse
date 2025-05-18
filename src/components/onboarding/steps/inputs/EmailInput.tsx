
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
  hidden?: boolean; // Adicionando prop para ocultar o campo
}

export const EmailInput = ({ 
  value, 
  onChange, 
  disabled, 
  readOnly,
  className,
  id = "email",
  hidden = false // Valor padrão é false
}: EmailInputProps) => (
  <div className={`${className} ${hidden ? 'hidden' : ''}`}>
    <Label htmlFor={id}>E-mail</Label>
    <Input
      id={id}
      type="email"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="exemplo@dominio.com"
    />
  </div>
);
