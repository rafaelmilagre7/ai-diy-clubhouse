import { Check, X } from 'lucide-react';
import { passwordRequirementsText } from '@/utils/passwordValidation';

interface PasswordRequirementsProps {
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  className?: string;
}

export const PasswordRequirements = ({ requirements, className = '' }: PasswordRequirementsProps) => {
  const requirementsArray = [
    requirements.minLength,
    requirements.hasUppercase,
    requirements.hasLowercase,
    requirements.hasNumber,
    requirements.hasSpecialChar,
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-muted-foreground">Requisitos da senha:</p>
      <ul className="space-y-1">
        {passwordRequirementsText.map((text, index) => {
          const isMet = requirementsArray[index];
          return (
            <li 
              key={index}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                isMet ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {isMet ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={isMet ? 'line-through' : ''}>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};