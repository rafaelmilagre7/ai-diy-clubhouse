
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import DynamicBrandLogo from '@/components/common/DynamicBrandLogo';

const AuthLayout = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  console.log('[AUTH-LAYOUT] Renderizando para usuário:', user ? user.email : 'não logado');

  // Redirecionar usuário autenticado
  useEffect(() => {
    if (user) {
      console.log('[AUTH-LAYOUT] Usuário logado detectado, redirecionando para dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email e senha são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        console.error('[AUTH-LAYOUT] Erro no login:', error);
        const errorMessage = error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : `Erro no login: ${error.message}`;
        
        toast.error(errorMessage);
        return;
      }

      console.log('[AUTH-LAYOUT] Login realizado com sucesso');
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');

    } catch (err: any) {
      console.error('[AUTH-LAYOUT] Erro inesperado:', err);
      toast.error('Erro inesperado durante o login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const metadata = {
        name: formData.name || undefined
      };

      const { error } = await signUp(formData.email, formData.password, metadata);

      if (error) {
        console.error('[AUTH-LAYOUT] Erro no registro:', error);
        const errorMessage = error.message === 'User already registered'
          ? 'Este email já está cadastrado. Tente fazer login.'
          : `Erro no registro: ${error.message}`;
        
        toast.error(errorMessage);
        return;
      }

      console.log('[AUTH-LAYOUT] Registro realizado com sucesso');
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');

    } catch (err: any) {
      console.error('[AUTH-LAYOUT] Erro inesperado:', err);
      toast.error('Erro inesperado durante o registro');
    } finally {
      setIsLoading(false);
    }
  };

  // Se usuário está logado, mostrar loading enquanto redireciona
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-viverblue/20 p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Redirecionando...
            </h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-viverblue/20 p-4">
      <Card className="w-full max-w-md bg-gray-800/90 border-gray-700 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mb-6">
            <DynamicBrandLogo 
              className="mx-auto h-16 w-auto mb-4"
              alt="VIVER DE IA Logo"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {showRegister ? 'Criar Conta' : 'Bem-vindo de volta'}
          </h1>
          <p className="text-gray-400">
            {showRegister 
              ? 'Cadastre-se para acessar a plataforma'
              : 'Entre na sua conta para continuar'
            }
          </p>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-4">
            {showRegister && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-200">Nome (opcional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Seu nome completo"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
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
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder={showRegister ? "Mínimo 6 caracteres" : "Sua senha"}
                  required
                  disabled={isLoading}
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

            {showRegister && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-200">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Digite a senha novamente"
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>{showRegister ? 'Criando conta...' : 'Entrando...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {showRegister ? <UserPlus className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                  <span>{showRegister ? 'Criar conta' : 'Entrar'}</span>
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowRegister(!showRegister)}
              className="text-viverblue hover:text-viverblue/80 font-medium transition-colors"
              disabled={isLoading}
            >
              {showRegister 
                ? 'Já tem uma conta? Faça login'
                : 'Não tem conta? Cadastre-se'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
