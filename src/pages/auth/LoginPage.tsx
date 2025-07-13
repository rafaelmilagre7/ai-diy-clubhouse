import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('teste@example.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Se já está logado, redireciona para onboarding
  if (user) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada!",
          description: "Verifique seu email ou faça login diretamente.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado!",
          description: "Redirecionando para o onboarding...",
        });
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{isSignUp ? 'Criar Conta' : 'Login'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Crie sua conta para acessar o onboarding'
              : 'Faça login para acessar o onboarding'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {isSignUp 
                ? 'Já tem conta? Faça login'
                : 'Não tem conta? Crie uma'
              }
            </button>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Para teste rápido:</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Email: teste@example.com<br/>
              Senha: 123456
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;