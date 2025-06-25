
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, User, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useInviteRegistration } from '@/hooks/useInviteRegistration';

interface InviteRegisterFormProps {
  email: string;
  initialName?: string;
  token: string;
  onUserExists: () => void;
}

const InviteRegisterForm = ({ email, initialName = '', token, onUserExists }: InviteRegisterFormProps) => {
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const { registerWithInvite, isRegistering } = useInviteRegistration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!name.trim()) {
      setError('Por favor, insira seu nome.');
      return;
    }

    if (!password) {
      setError('Por favor, insira uma senha.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const result = await registerWithInvite({
      email,
      name: name.trim(),
      password,
      token
    });

    if (!result.success) {
      if (result.error === 'user_exists') {
        onUserExists();
      } else {
        setError(result.message || 'Erro ao criar conta');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E] border-gray-800 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-viverblue" />
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Criar sua conta
          </CardTitle>
          <p className="text-neutral-300 text-sm">
            Você foi convidado para o <strong className="text-viverblue">Viver de IA</strong>
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email - Bloqueado */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-500">
                E-mail do convite (não editável)
              </p>
            </div>

            {/* Nome - Editável */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue"
                required
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-300 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Botão de Criar Conta */}
            <Button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
              size="lg"
            >
              {isRegistering ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar minha conta
                </>
              )}
            </Button>
          </form>
          
          {/* Informações adicionais */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-400">
              Ao criar sua conta, você concorda com nossos{' '}
              <a href="/terms" className="text-viverblue hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/privacy" className="text-viverblue hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegisterForm;
