
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Eye, EyeOff, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    setErrors(newErrors);
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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-viverblue" />
        </div>
        
        <h2 className="text-2xl font-bold text-white">
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
            Email do convite:
          </span>
        </div>
        <p className="text-neutral-300 break-all">
          {email}
        </p>
        
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
            Nome completo *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-[#252842] border-white/20 text-white placeholder:text-neutral-400"
              placeholder="Digite seu nome completo"
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Senha *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10 bg-[#252842] border-white/20 text-white placeholder:text-neutral-400"
              placeholder="Crie uma senha segura"
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
            <p className="text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Confirmar senha *
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-[#252842] border-white/20 text-white placeholder:text-neutral-400"
            placeholder="Digite a senha novamente"
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-400">{errors.confirmPassword}</p>
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
            'Criar Conta e Aceitar Convite'
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-neutral-400">
          Já tem uma conta?{' '}
          <button 
            onClick={() => window.location.href = '/login'}
            className="text-viverblue hover:text-viverblue/80 underline"
            disabled={isLoading}
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};

export default InviteRegisterForm;
