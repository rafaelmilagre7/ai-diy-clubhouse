
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  id?: string;
  hidden?: boolean; // Adicionando prop para ocultar o campo
}

export const NameInput = ({ 
  value, 
  onChange, 
  disabled, 
  readOnly,
  className,
  id = "name",
  hidden = false // Valor padrão é false
}: NameInputProps) => (
  <div className={`${className} ${hidden ? 'hidden' : ''}`}>
    <Label htmlFor={id}>Nome Completo</Label>
    <Input
      id={id}
      type="text"
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      onChange={e => onChange(e.target.value)}
      required
      placeholder="Seu nome completo"
    />
  </div>
);
