
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AuthErrorFallbackProps {
  error?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  showHomeButton?: boolean;
}

export const AuthErrorFallback: React.FC<AuthErrorFallbackProps> = ({
  error = 'Erro de autenticação',
  onRetry,
  isRetrying = false,
  showHomeButton = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] via-[#151823] to-[#1a1d2e] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="border-red-500/20 bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-xl text-white">
              Ops! Algo deu errado
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300 text-sm">
              {error}
            </p>
            
            <div className="flex flex-col gap-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="bg-viverblue hover:bg-viverblue/90 w-full"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Tentando novamente...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Tentar Novamente
                    </>
                  )}
                </Button>
              )}
              
              {showHomeButton && (
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Dashboard
                </Button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
