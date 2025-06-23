
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useInviteFlow } from '@/hooks/useInviteFlow';

interface EnhancedRegisterFormProps {
  email: string;
  roleName: string;
  inviteToken: string;
  onSuccess?: () => void;
}

const EnhancedRegisterForm: React.FC<EnhancedRegisterFormProps> = ({
  email,
  roleName,
  inviteToken,
  onSuccess
}) => {
  const { registerWithInvite, isProcessing } = useInviteFlow(inviteToken);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.password) {
      setError('Senha é obrigatória');
      return;
    }

    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }

    setError('');

    try {
      const result = await registerWithInvite(formData.name.trim(), formData.password);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Erro inesperado ao criar conta');
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    if (error) {
      setError('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-8 h-8 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Aceitar Convite
        </h2>
        <p className="text-neutral-300">
          Complete seu cadastro para acessar a plataforma
        </p>
      </div>

      <div className="bg-[#252842]/50 rounded-lg p-4 space-y-3">
        <div>
          <span className="text-sm font-medium text-white">
            Email:
          </span>
          <p className="text-neutral-300 mt-1">
            {email}
          </p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-white">
            Cargo: 
          </span>
          <span className="ml-2 text-sm px-3 py-1 bg-viverblue/20 text-viverblue rounded-full">
            {roleName === 'formacao' ? 'Formação' : 'Membro do Clube'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Seu nome completo"
            required
            className="bg-[#151823] border-white/20 text-white placeholder:text-neutral-400 focus:border-viverblue focus:ring-viverblue"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Mínimo 6 caracteres"
              required
              className="bg-[#151823] border-white/20 text-white placeholder:text-neutral-400 focus:border-viverblue focus:ring-viverblue pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-neutral-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">
            Confirmar senha
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              placeholder="Confirme sua senha"
              required
              className="bg-[#151823] border-white/20 text-white placeholder:text-neutral-400 focus:border-viverblue focus:ring-viverblue pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-neutral-400 hover:text-white"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Criando conta...</span>
            </div>
          ) : (
            'Aceitar Convite e Criar Conta'
          )}
        </Button>
      </form>
    </div>
  );
};

export default EnhancedRegisterForm;
