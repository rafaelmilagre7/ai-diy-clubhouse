
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { UserPlus, Eye, EyeOff, Mail, User, Lock } from 'lucide-react';

interface InviteRegisterFormProps {
  email: string;
  roleName: string;
  onSubmit: (name: string, password: string) => Promise<any>;
  isLoading?: boolean;
}

const InviteRegisterForm = ({ 
  email, 
  roleName, 
  onSubmit, 
  isLoading = false 
}: InviteRegisterFormProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório';
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        return '';
      case 'password':
        if (!value) return 'Senha é obrigatória';
        if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
        return '';
      case 'confirmPassword':
        if (!value) return 'Confirmação de senha é obrigatória';
        if (value !== password) return 'Senhas não conferem';
        return '';
      default:
        return '';
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    // Atualizar valor
    if (fieldName === 'name') setName(value);
    if (fieldName === 'password') setPassword(value);
    if (fieldName === 'confirmPassword') setConfirmPassword(value);

    // Marcar como touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Validar em tempo real se já foi touched
    if (touched[fieldName] || value.length > 0) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const nameError = validateField('name', name);
    const passwordError = validateField('password', password);
    const confirmPasswordError = validateField('confirmPassword', confirmPassword);

    if (nameError) newErrors.name = nameError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    setTouched({ name: true, password: true, confirmPassword: true });
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(name.trim(), password);
    } catch (error) {
      console.error('Erro no formulário:', error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role === 'formacao' ? 'Formação' : 'Membro do Clube';
  };

  return (
    <div className="min-h-screen bg-[#0F1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-viverblue" />
          </div>
          
          <h1 className="text-3xl font-bold text-white">
            Bem-vindo!
          </h1>
          <p className="text-lg text-neutral-300">
            Complete seu cadastro para começar
          </p>
        </div>

        <div className="bg-[#1A1E2E] rounded-xl border border-neutral-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-viverblue flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-300">
                Email do convite
              </p>
              <p className="text-white text-sm break-all">
                {email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-viverblue flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-neutral-300">
                Seu cargo
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-viverblue/20 text-viverblue border border-viverblue/30">
                {getRoleDisplayName(roleName)}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <EnhancedInput
            label="Nome completo *"
            type="text"
            value={name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Digite seu nome completo"
            disabled={isLoading}
            error={errors.name}
          />

          <div className="relative">
            <EnhancedInput
              label="Senha *"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              placeholder="Crie uma senha segura (mín. 6 caracteres)"
              disabled={isLoading}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 text-neutral-400 hover:text-white transition-colors"
              disabled={isLoading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <EnhancedInput
            label="Confirmar senha *"
            type="password"
            value={confirmPassword}
            onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
            placeholder="Digite a senha novamente"
            disabled={isLoading}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            disabled={isLoading || Object.keys(errors).some(key => errors[key])}
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-semibold py-4 h-auto text-base transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Criando sua conta...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>Criar Conta e Aceitar Convite</span>
              </div>
            )}
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-neutral-400">
            Já tem uma conta?{' '}
            <button 
              onClick={() => window.location.href = '/login'}
              className="text-viverblue hover:text-viverblue/80 underline font-medium transition-colors"
              disabled={isLoading}
            >
              Entre aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InviteRegisterForm;
