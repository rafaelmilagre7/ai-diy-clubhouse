
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cleanupAuthState } from '@/utils/authUtils';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginDiagnostic = () => {
  const [supabaseState, setSupabaseState] = useState<any>(null);
  const [localStorageTokens, setLocalStorageTokens] = useState<string[]>([]);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  
  // Verificar estado atual
  const checkCurrentState = async () => {
    setIsCheckingSession(true);
    
    try {
      // Verificar tokens no localStorage
      const tokens = Object.keys(localStorage).filter(
        key => key.startsWith('supabase.auth.') || key.includes('sb-')
      );
      setLocalStorageTokens(tokens);
      
      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      
      if (session) {
        setSupabaseState({
          hasSession: true,
          userId: session.user?.id,
          email: session.user?.email,
          authenticatedAt: new Date(session.created_at).toLocaleString(),
        });
        
        toast.success("Sessão de autenticação encontrada");
      } else {
        setSupabaseState({
          hasSession: false,
          message: "Nenhuma sessão autenticada encontrada",
        });
        
        toast.error("Nenhuma sessão encontrada");
      }
    } catch (error) {
      console.error("Erro ao verificar estado:", error);
      toast.error("Erro ao verificar estado de autenticação");
      
      setSupabaseState({
        hasSession: false,
        error: String(error),
      });
    } finally {
      setIsCheckingSession(false);
    }
  };
  
  // Limpar estado de autenticação
  const handleClearAuthState = () => {
    const wasCleared = cleanupAuthState();
    
    if (wasCleared) {
      toast.success("Tokens de autenticação limpos com sucesso");
      // Atualizar estado
      checkCurrentState();
    } else {
      toast.error("Erro ao limpar tokens de autenticação");
    }
  };
  
  // Forçar logout no Supabase
  const handleForceLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      toast.success("Logout forçado com sucesso");
      
      // Limpar também tokens locais
      cleanupAuthState();
      
      // Atualizar estado
      checkCurrentState();
    } catch (error) {
      console.error("Erro ao forçar logout:", error);
      toast.error("Erro ao forçar logout");
    }
  };
  
  // Verificar estado inicial
  useEffect(() => {
    checkCurrentState();
  }, []);
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Diagnóstico de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Estado da Sessão</h3>
            {isCheckingSession ? (
              <p>Verificando sessão...</p>
            ) : supabaseState ? (
              <div className="rounded-md border p-4">
                {supabaseState.hasSession ? (
                  <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle>Sessão autenticada encontrada</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Usuário ID:</strong> {supabaseState.userId}</p>
                        <p><strong>Email:</strong> {supabaseState.email}</p>
                        <p><strong>Autenticado em:</strong> {supabaseState.authenticatedAt}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>Nenhuma sessão ativa</AlertTitle>
                    <AlertDescription>
                      {supabaseState.message || "Você não está autenticado no momento."}
                      {supabaseState.error && (
                        <div className="mt-2">
                          <strong>Erro:</strong> {supabaseState.error}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p>Não foi possível verificar o estado da sessão.</p>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Tokens no LocalStorage</h3>
            <div className="rounded-md border p-4">
              {localStorageTokens.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {localStorageTokens.map((token, idx) => (
                    <li key={idx} className="text-sm truncate">
                      {token}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum token de autenticação encontrado no localStorage.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={checkCurrentState} className="w-full">
            Verificar estado atual
          </Button>
          <Button onClick={handleClearAuthState} variant="outline" className="w-full">
            Limpar tokens locais
          </Button>
          <Button 
            onClick={handleForceLogout} 
            variant="destructive" 
            className="w-full"
            disabled={!hasSession}
          >
            Forçar logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginDiagnostic;
