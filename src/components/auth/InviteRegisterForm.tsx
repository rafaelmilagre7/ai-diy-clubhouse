
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCheck, Mail, User, Lock, Eye, EyeOff } from 'lucide-react';

interface InviteFlowResult {
  success: boolean;
  message: string;
  requiresOnboarding?: boolean;
}

interface InviteRegisterFormProps {
  email: string;
  roleName: string;
  onSubmit: (name: string, password: string) => Promise<InviteFlowResult>;
  isLoading: boolean;
}

const InviteRegisterForm = ({ email, roleName, onSubmit, isLoading }: InviteRegisterFormProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    await onSubmit(name.trim(), password);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mb-4">
          <UserCheck className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Criar Conta
        </h2>
        <p className="text-neutral-300">
          Complete seu cadastro para aceitar o convite
        </p>
      </div>

      <div className="bg-[#252842]/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-viverblue" />
          <span className="text-sm font-medium text-white">
            Convite para:
          </span>
        </div>
        <p className="text-neutral-300">{email}</p>
        
        <div className="mt-2">
          <span className="text-sm font-medium text-white">
            Cargo: 
          </span>
          <span className="ml-2 text-sm px-3 py-1 bg-viverblue/20 text-viverblue rounded-full">
            {roleName === 'formacao' ? 'Formação' : 'Membro do Clube'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Nome completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-[#1A1E2E]/50 border-white/20 text-white placeholder:text-neutral-400"
              placeholder="Seu nome completo"
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-red-400 text-sm">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-[#1A1E2E]/50 border-white/20 text-white placeholder:text-neutral-400"
              placeholder="Mínimo 6 caracteres"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-white"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Confirmar senha
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-10 bg-[#1A1E2E]/50 border-white/20 text-white placeholder:text-neutral-400"
              placeholder="Confirme sua senha"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-neutral-400 hover:text-white"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Criando conta...</span>
            </div>
          ) : (
            'Criar Conta'
          )}
        </Button>
      </form>
    </div>
  );
};

export default InviteRegisterForm;
