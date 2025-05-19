
import React from "react";
import { Input } from "./input";

interface PhoneInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export function PhoneInput({
  id,
  placeholder = "+55 (99) 99999-9999",
  value,
  onChange,
  required,
  className,
  ...props
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // Remove todos os caracteres não numéricos, exceto o sinal de +
    input = input.replace(/[^\d+]/g, "");
    
    // Garantir que o + só existe no início
    if (input.includes("+") && !input.startsWith("+")) {
      input = input.replace("+", "");
      input = "+" + input;
    }
    
    // Formatar número brasileiro (+55)
    if (input.startsWith("+55") && input.length > 3) {
      const ddd = input.substring(3, 5);
      const firstPart = input.substring(5, 10);
      const secondPart = input.substring(10, 14);
      
      if (input.length > 5 && input.length <= 10) {
        input = `+55 (${ddd}) ${firstPart}`;
      } else if (input.length > 10) {
        input = `+55 (${ddd}) ${firstPart}-${secondPart}`;
      } else {
        input = `+55 (${ddd}`;
      }
    }
    
    onChange(input);
  };

  return (
    <Input
      id={id}
      type="tel"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      required={required}
      className={className}
      {...props}
    />
  );
}
