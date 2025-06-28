
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, LogOut, ArrowLeft } from 'lucide-react';
import { useSimpleAuth } from '@/contexts/auth/SimpleAuthProvider';
import { useNavigate } from 'react-router-dom';

interface InviteEmailMismatchScreenProps {
  inviteEmail: string;
  userEmail: string;
}

export const InviteEmailMismatchScreen: React.FC<InviteEmailMismatchScreenProps> = ({
  inviteEmail,
  userEmail
}) => {
  const { signOut } = useSimpleAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      navigate('/auth');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/80 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <CardTitle className="text-white">Email Incompatível</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <p className="text-white/80">
              O convite foi enviado para:
            </p>
            <p className="font-semibold text-viverblue">
              {inviteEmail}
            </p>
            
            <p className="text-white/80 mt-4">
              Mas você está logado como:
            </p>
            <p className="font-semibold text-white">
              {userEmail}
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mt-4">
            <p className="text-yellow-200 text-sm">
              Para aceitar este convite, você precisa fazer login com o email correto ou solicitar um novo convite.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Button 
              onClick={handleSignOut}
              className="w-full bg-viverblue hover:bg-viverblue/90"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Fazer Login com Email Correto
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="w-full border-white/20 text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteEmailMismatchScreen;
