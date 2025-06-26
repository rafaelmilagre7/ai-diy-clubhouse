
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';
import { toast } from 'sonner';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useSimpleAuth();
  
  const prefilledEmail = location.state?.email || '';
  const conviteMessage = location.state?.message || '';
  
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  // Se já está logado, redirecionar
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Mostrar mensagem do convite
  useEffect(() => {
    if (conviteMessage) {
      toast.info(conviteMessage);
    }
  }, [conviteMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsSigningIn(true);

    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message);
      } else {
        toast.success('Login realizado com sucesso!');
        // O redirecionamento será feito automaticamente pelo useEffect acima
      }
    } catch (err) {
      setError('Erro inesperado ao fazer login');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.info('Login com Google será implementado em breve');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {conviteMessage && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-orange-300 text-center">
            {conviteMessage}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white flex items-center gap-2">
          <Mail className="w-4 h-4" />
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue"
          disabled={isSigningIn}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Senha
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue pr-10"
            disabled={isSigningIn}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
            disabled={isSigningIn}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSigningIn}
        className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
      >
        {isSigningIn ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>

      <div className="text-center">
        <a
          href="/reset-password"
          className="text-sm text-neutral-400 hover:text-viverblue transition-colors"
        >
          Esqueceu sua senha?
        </a>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#1A1E2E] px-2 text-neutral-500">
            Ou continue com
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full text-white hover:bg-gray-800 border-gray-700"
        onClick={handleGoogleSignIn}
        disabled={isSigningIn}
      >
        <Chrome className="w-4 h-4 mr-2" />
        Google
      </Button>
    </form>
  );
};

export default LoginForm;
