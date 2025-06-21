import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface RegisterFormProps {
  inviteToken?: string;
  prefilledEmail?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  inviteToken, 
  prefilledEmail 
}) => {
  const [email, setEmail] = useState(prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // Limpeza de estado antes do registro
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continuar mesmo se falhar
      }

      const redirectUrl = `${window.location.origin}/`;

      const signUpOptions: any = {
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name.trim(),
            full_name: name.trim(),
          }
        }
      };

      // Se há um token de convite, incluir nos metadados
      if (inviteToken) {
        signUpOptions.options.data.invite_token = inviteToken;
      }

      console.log('[REGISTER-FORM] Tentando registrar usuário:', {
        email: email.trim(),
        hasInviteToken: !!inviteToken
      });

      const { data, error } = await supabase.auth.signUp(signUpOptions);

      if (error) {
        console.error('[REGISTER-FORM] Erro no signUp:', error);
        throw error;
      }

      console.log('[REGISTER-FORM] SignUp bem-sucedido:', {
        user: !!data.user,
        session: !!data.session
      });

      if (data.user) {
        if (inviteToken) {
          toast.success('Conta criada com sucesso! Você será redirecionado em breve.');
          // Para convites, redirecionar automaticamente após sucesso
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
        }
      }
    } catch (error: any) {
      console.error('[REGISTER-FORM] Erro no registro:', error);
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-200">Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            placeholder="Seu nome completo"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-200">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            placeholder="seu@email.com"
            required
            disabled={isLoading || !!prefilledEmail}
            readOnly={!!prefilledEmail}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-200">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            placeholder="Mínimo 6 caracteres"
            required
            disabled={isLoading}
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            placeholder="Repita sua senha"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-viverblue hover:bg-viverblue/90"
        disabled={isLoading}
      >
        {isLoading ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  );
};
