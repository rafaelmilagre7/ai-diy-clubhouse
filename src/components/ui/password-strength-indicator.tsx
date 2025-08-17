import { PasswordStrength } from '@/utils/passwordValidation';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  className?: string;
}

export const PasswordStrengthIndicator = ({ strength, className = '' }: PasswordStrengthIndicatorProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">Força da senha:</span>
        <span 
          className="font-medium"
          style={{ color: strength.color }}
        >
          {strength.feedback}
        </span>
      </div>
      
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${strength.percentage}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>
    </div>
  );
};