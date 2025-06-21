
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { getBrandColors, detectUserType } from '@/services/brandLogoService';
import { toast } from 'sonner';

interface EnhancedInviteRegistrationProps {
  inviteToken: string;
  onSuccess?: () => void;
}

export const EnhancedInviteRegistration: React.FC<EnhancedInviteRegistrationProps> = ({
  inviteToken,
  onSuccess
}) => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(inviteToken);
  
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detectar tipo de usuário para logos e cores
  const userType = detectUserType({
    inviteRole: inviteDetails?.role?.name,
    defaultType: 'club'
  });
  const brandColors = getBrandColors(userType);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !inviteDetails) return;
    
    setLoading(true);
    
    try {
      const result = await signUp({
        email: inviteDetails.email,
        password: formData.password,
        fullName: formData.fullName,
        inviteToken
      });
      
      if (result.success) {
        toast.success('Conta criada com sucesso!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Erro ao criar conta');
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast.error('Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-center text-gray-300">Validando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                {inviteError || 'Convite inválido'}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full mt-4"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <DynamicBrandLogo
            userType={userType}
            inviteRole={inviteDetails.role.name}
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            Criar sua conta
          </h2>
          <p className="mt-2 text-gray-400">
            Você foi convidado para: <span className={brandColors.text}>{inviteDetails.role.name}</span>
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Convite Válido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={inviteDetails.email}
                    disabled
                    className="pl-10 bg-gray-700 border-gray-600 text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-300">
                  Nome Completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-400 text-sm">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${brandColors.bg} ${brandColors.bgHover} text-white`}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EnhancedInviteRegistration;
