
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, AlertCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InviteUserExistsScreenProps {
  email: string;
}

const InviteUserExistsScreen = ({ email }: InviteUserExistsScreenProps) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { 
        email,
        message: 'Este e-mail já possui uma conta. Faça login para continuar.'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E] border-gray-800 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            Conta já existe
          </CardTitle>
          <p className="text-neutral-300 text-sm">
            Este e-mail já possui uma conta no <strong className="text-viverblue">Viver de IA</strong>
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações da conta */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#0F111A] rounded-lg border border-gray-700">
              <Mail className="w-5 h-5 text-viverblue" />
              <div>
                <p className="text-sm font-medium text-white">E-mail da conta</p>
                <p className="text-xs text-neutral-400">{email}</p>
              </div>
            </div>
          </div>
          
          {/* Botão de ir para login */}
          <Button 
            onClick={handleGoToLogin}
            className="w-full bg-viverblue hover:bg-viverblue/90 text-white font-medium py-3"
            size="lg"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Fazer Login
          </Button>
          
          {/* Informações adicionais */}
          <div className="text-center space-y-2">
            <p className="text-xs text-neutral-400">
              Se você esqueceu sua senha, poderá redefini-la na tela de login
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteUserExistsScreen;
