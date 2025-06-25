
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User, Lock, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { registerWithInvite, isRegistering } = useInviteRegistration();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
    
    if (!validateForm()) {
      return;
    }

    const result = await registerWithInvite({
      email,
      name: name.trim(),
      password,
      token
    });

    if (result.error === 'user_exists') {
      onUserExists();
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
            Criar sua Conta
          </CardTitle>
          <p className="text-neutral-300 text-sm">
            Complete seu cadastro para acessar o <strong className="text-viverblue">Viver de IA</strong>
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white flex items-center gap-2">
                <Mail className="w-4 h-4" />
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
              />
              <p className="text-xs text-neutral-400">
                E-mail do convite (não pode ser alterado)
              </p>
            </div>

            {/* Nome (editável) */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue"
              />
              {errors.name && (
                <p className="text-sm text-red-400">{errors.name}</p>
              )}
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className="bg-[#0F111A] border-gray-700 text-white placeholder-neutral-400 focus:border-viverblue pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Botão de Submit */}
            <Button 
              type="submit"
              disabled={isRegistering}
              className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3 mt-6"
              size="lg"
            >
              {isRegistering ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>

          {/* Informações adicionais */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-neutral-400">
              Ao criar sua conta, você concorda com nossos termos de uso
            </p>
            <p className="text-xs text-neutral-500">
              Token: {token.substring(0, 8)}***
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteRegisterForm;
