
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface SimpleRegisterFormProps {
  onSuccess?: () => void;
  defaultEmail?: string;
}

const SimpleRegisterForm: React.FC<SimpleRegisterFormProps> = ({ 
  onSuccess,
  defaultEmail = ''
}) => {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: defaultEmail,
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
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

    setIsLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.name.trim()
      );

      if (signUpError) {
        console.error('[SIMPLE-REGISTER-FORM] Erro no registro:', signUpError);
        
        let errorMessage = 'Erro ao criar conta';
        if (signUpError.message?.includes('User already registered')) {
          errorMessage = 'Este email já possui uma conta. Faça login.';
        } else if (signUpError.message?.includes('Invalid email')) {
          errorMessage = 'Email inválido';
        } else if (signUpError.message) {
          errorMessage = signUpError.message;
        }
        
        setError(errorMessage);
        return;
      }

      console.log('[SIMPLE-REGISTER-FORM] Registro realizado com sucesso');
      onSuccess?.();

    } catch (err: any) {
      console.error('[SIMPLE-REGISTER-FORM] Erro inesperado:', err);
      setError('Erro inesperado durante o registro');
    } finally {
      setIsLoading(false);
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
        <div className="mx-auto w-12 h-12 bg-viverblue/20 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-viverblue" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Criar conta
        </h2>
        <p className="text-neutral-300">
          Preencha os dados para se cadastrar
        </p>
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
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            placeholder="seu@email.com"
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
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Criando conta...</span>
            </div>
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>
    </div>
  );
};

export default SimpleRegisterForm;
