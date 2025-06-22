
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface SimpleRegisterFormProps {
  onSuccess: () => void;
  defaultEmail?: string;
  inviteToken?: string;
}

const SimpleRegisterForm: React.FC<SimpleRegisterFormProps> = ({
  onSuccess,
  defaultEmail = '',
  inviteToken
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Obter token da URL se não foi passado via props
  const token = inviteToken || searchParams.get('token');
  const emailFromUrl = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    name: '',
    email: defaultEmail || emailFromUrl || '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  console.log('[SIMPLE-REGISTER] Renderizando com:', {
    token: token ? `${token.substring(0, 8)}...` : null,
    defaultEmail,
    emailFromUrl
  });

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('[SIMPLE-REGISTER] Iniciando registro com token:', token ? `${token.substring(0, 8)}...` : 'nenhum');
      
      // Preparar metadados do usuário
      const userMetadata: Record<string, any> = {
        name: formData.name.trim(),
        email: formData.email.trim()
      };
      
      // Incluir token de convite nos metadados se existir
      if (token) {
        userMetadata.invite_token = token;
        console.log('[SIMPLE-REGISTER] Token de convite incluído nos metadados');
      }
      
      // Criar usuário no Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: userMetadata
        }
      });
      
      if (signUpError) {
        console.error('[SIMPLE-REGISTER] Erro no signUp:', signUpError);
        throw signUpError;
      }
      
      if (!data?.user) {
        throw new Error('Falha ao criar usuário');
      }
      
      console.log('[SIMPLE-REGISTER] Usuário criado com sucesso:', data.user.id);
      
      // Se temos token, mostrar mensagem específica
      if (token) {
        toast.success('Conta criada e convite aplicado com sucesso!', {
          description: 'Você será redirecionado para completar seu perfil.'
        });
      } else {
        toast.success('Conta criada com sucesso!', {
          description: 'Você será redirecionado para completar seu perfil.'
        });
      }
      
      // Aguardar um momento para que os triggers do banco processem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chamar onSuccess para redirecionar
      onSuccess();
      
    } catch (error: any) {
      console.error('[SIMPLE-REGISTER] Erro no registro:', error);
      
      let errorMessage = 'Erro ao criar conta';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido';
      } else if (error.message?.includes('Password')) {
        errorMessage = 'Senha muito fraca';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {token ? 'Aceitar Convite' : 'Criar Conta'}
        </CardTitle>
        <p className="text-gray-600">
          {token ? 'Complete seu cadastro para aceitar o convite' : 'Preencha os dados para criar sua conta'}
        </p>
        {token && (
          <Alert className="text-left">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Você foi convidado para a plataforma! Complete o cadastro para aceitar o convite automaticamente.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Seu nome completo"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Repita sua senha"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Criando conta...</span>
              </div>
            ) : (
              token ? 'Aceitar Convite e Criar Conta' : 'Criar Conta'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimpleRegisterForm;
