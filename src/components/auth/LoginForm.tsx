
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { contrastClasses } from '@/lib/contrastUtils';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        console.error('[LOGIN-FORM] Erro no login:', signInError);
        const errorMessage = signInError.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : `Erro no login: ${signInError.message}`;
        
        setError(errorMessage);
        return;
      }

      console.log('[LOGIN-FORM] Login realizado com sucesso');
      onSuccess?.();

    } catch (err: any) {
      console.error('[LOGIN-FORM] Erro inesperado:', err);
      setError('Erro inesperado durante o login');
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
          <LogIn className="w-6 h-6 text-viverblue" />
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
          <Label htmlFor="email" className={contrastClasses.label}>
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
          <Label htmlFor="password" className={contrastClasses.label}>
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              placeholder="Sua senha"
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

        <Button
          type="submit"
          className="w-full bg-viverblue hover:bg-viverblue-dark text-white font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Entrando...</span>
            </div>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
