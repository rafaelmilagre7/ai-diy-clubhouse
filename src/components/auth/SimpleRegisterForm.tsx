
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SimpleRegisterFormProps {
  inviteToken?: string;
  inviteEmail?: string;
  onSuccess?: () => void;
}

const SimpleRegisterForm = ({ inviteToken, inviteEmail, onSuccess }: SimpleRegisterFormProps) => {
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !inviteEmail) return;

    setIsLoading(true);
    
    try {
      const options = {
        inviteToken,
        userData: { name: formData.name }
      };

      const { error } = await signUp(inviteEmail, formData.password, options);

      if (error) {
        toast.error(`Erro no cadastro: ${error.message}`);
        return;
      }

      toast.success('Conta criada com sucesso!');
      onSuccess?.();

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro inesperado no cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={inviteEmail || ''}
          disabled
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Digite seu nome completo"
          disabled={isLoading}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="Digite sua senha"
          disabled={isLoading}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta e aceitar convite'
        )}
      </Button>
    </form>
  );
};

export default SimpleRegisterForm;
