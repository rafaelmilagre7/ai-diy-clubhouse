export interface PasswordStrength {
  score: number; // 0-4
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string;
  color: string;
  percentage: number;
}

export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  // Calcular score baseado nos requisitos atendidos
  let score = 0;
  if (requirements.minLength) score++;
  if (requirements.hasUppercase) score++;
  if (requirements.hasLowercase) score++;
  if (requirements.hasNumber) score++;
  if (requirements.hasSpecialChar) score++;

  // Verificar se é uma senha comum
  const isCommon = isPasswordCommon(password);

  // Determinar nível de força
  let level: PasswordStrength['level'];
  let feedback: string;
  let color: string;

  if (isCommon) {
    // Senha comum sempre é considerada fraca
    level = 'weak';
    feedback = 'Senha muito comum';
    color = 'hsl(0, 84%, 60%)'; // red-500
    score = Math.min(score, 2); // Reduzir score se for comum
  } else if (score <= 1) {
    level = 'weak';
    feedback = 'Muito fraca';
    color = 'hsl(0, 84%, 60%)'; // red-500
  } else if (score <= 2) {
    level = 'weak';
    feedback = 'Fraca';
    color = 'hsl(25, 95%, 53%)'; // orange-500
  } else if (score <= 3) {
    level = 'fair';
    feedback = 'Razoável';
    color = 'hsl(45, 93%, 47%)'; // yellow-500
  } else if (score <= 4) {
    level = 'good';
    feedback = 'Boa';
    color = 'hsl(142, 76%, 36%)'; // green-600
  } else {
    level = 'strong';
    feedback = 'Muito forte';
    color = 'hsl(142, 76%, 36%)'; // green-600
  }

  const percentage = (score / 5) * 100;

  return {
    isValid: score >= 3 && !isCommon, // Precisa de pelo menos 3 requisitos e não ser comum
    strength: {
      score,
      level,
      feedback,
      color,
      percentage,
    },
    requirements,
  };
};

export const passwordRequirementsText = [
  'Pelo menos 8 caracteres',
  'Uma letra maiúscula (A-Z)',
  'Uma letra minúscula (a-z)', 
  'Um número (0-9)',
  'Um caractere especial (!@#$%^&*)',
];

// Lista de senhas comuns/fracas para bloquear no front-end
const COMMON_WEAK_PASSWORDS = [
  'password', 'senha', 'senha123', 'admin', 'admin123', '12345678', 
  'qwerty', 'qwerty123', 'abc12345', '123abc45', 'senha@123', 
  'Password1', 'Admin@123', '123456789', 'password123', 'Senha@123'
];

/**
 * Verifica se a senha contém palavras comuns/fracas
 */
export const isPasswordCommon = (password: string): boolean => {
  const lowerPassword = password.toLowerCase();
  return COMMON_WEAK_PASSWORDS.some(weak => 
    lowerPassword.includes(weak.toLowerCase())
  );
};