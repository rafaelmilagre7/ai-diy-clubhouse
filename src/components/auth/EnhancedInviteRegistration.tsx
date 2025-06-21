
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { supabase } from '@/lib/supabase';
import { useInviteDetails } from '@/hooks/useInviteDetails';
import { DynamicBrandLogo } from '@/components/common/DynamicBrandLogo';
import { getBrandColors } from '@/services/brandLogoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import LoadingScreen from '@/components/common/LoadingScreen';

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  password: yup.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .matches(/[A-Za-z]/, 'Senha deve conter pelo menos uma letra')
    .matches(/[0-9]/, 'Senha deve conter pelo menos um número')
    .required('Senha é obrigatória'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória')
});

type FormData = yup.InferType<typeof schema>;

export const EnhancedInviteRegistration = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { inviteDetails, loading: inviteLoading, error: inviteError } = useInviteDetails(token);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registering, setRegistering] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema)
  });

  // Detectar tipo de usuário baseado no role do convite
  const userType = inviteDetails?.role.name.toLowerCase().includes('formacao') ? 'formacao' : 'club';
  const brandColors = getBrandColors(userType);

  const onSubmit = async (data: FormData) => {
    if (!inviteDetails) return;

    try {
      setRegistering(true);

      // Criar conta no Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteDetails.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            invite_token: token
          }
        }
      });

      if (signUpError) {
        toast.error('Erro ao criar conta: ' + signUpError.message);
        return;
      }

      if (!authData.user) {
        toast.error('Erro ao criar usuário');
        return;
      }

      // Usar o convite
      const { data: useInviteResult, error: useInviteError } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: authData.user.id
      });

      if (useInviteError) {
        toast.error('Erro ao processar convite: ' + useInviteError.message);
        return;
      }

      toast.success('Conta criada com sucesso! Bem-vindo(a)!');
      
      // Redirecionar baseado no tipo de usuário
      if (userType === 'formacao') {
        navigate('/formacao');
      } else {
        navigate('/dashboard');
      }

    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
    } finally {
      setRegistering(false);
    }
  };

  if (inviteLoading) {
    return <LoadingScreen message="Carregando convite..." />;
  }

  if (inviteError || !inviteDetails) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Convite Inválido</h1>
          <p className="text-gray-400 mb-6">{inviteError || 'Convite não encontrado'}</p>
          <Button 
            onClick={() => navigate('/login')} 
            variant="outline"
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            Você foi convidado para se juntar como <span className={`font-semibold ${brandColors.text}`}>
              {inviteDetails.role.name}
            </span>
          </p>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email (readonly) */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteDetails.email}
                disabled
                className="bg-gray-700 text-gray-400"
              />
            </div>

            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Seu nome completo"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                  placeholder="Confirme sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Botão de criar conta */}
            <Button
              type="submit"
              disabled={registering}
              className={`w-full ${brandColors.bg} ${brandColors.bgHover} text-white`}
            >
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedInviteRegistration;
