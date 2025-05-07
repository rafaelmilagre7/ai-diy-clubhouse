
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export const PandaVideoStatusCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [message, setMessage] = useState('Verificando conexão com Panda Video...');
  
  useEffect(() => {
    const checkPandaConnection = async () => {
      try {
        // Tentando chamar uma função Edge que verifica a conexão com o Panda Video
        const { data, error } = await supabase.functions.invoke('check-panda-connection');
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.success) {
          setStatus('ok');
          setMessage('Conexão com Panda Video estabelecida com sucesso.');
        } else {
          throw new Error(data?.message || 'Falha na verificação do Panda Video');
        }
      } catch (err: any) {
        console.error('Erro ao verificar conexão com Panda Video:', err);
        setStatus('error');
        setMessage(`Não foi possível verificar a integração com Panda Video. ${err.message}`);
      }
    };
    
    // Verificar a conexão apenas uma vez ao montar o componente
    checkPandaConnection();
  }, []);
  
  if (status === 'checking') {
    return (
      <Alert className="mb-6 bg-blue-50 border-blue-100">
        <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        <AlertTitle className="text-blue-700">Verificando integração</AlertTitle>
        <AlertDescription className="text-blue-600">
          {message}
        </AlertDescription>
      </Alert>
    );
  }
  
  if (status === 'error') {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de integração</AlertTitle>
        <AlertDescription>
          {message} O upload de vídeos pode não funcionar corretamente.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Não exibir nada quando estiver ok para não ocupar espaço desnecessário
  return null;
};
