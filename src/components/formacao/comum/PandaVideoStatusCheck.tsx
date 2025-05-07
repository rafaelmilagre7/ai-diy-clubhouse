
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const PandaVideoStatusCheck = () => {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkPandaAPIStatus = async () => {
      try {
        setStatus('checking');
        const { data, error } = await supabase.functions.invoke("check-panda-api", {
          body: { action: "status" }
        });

        if (error) {
          console.error("Erro ao verificar API Panda:", error);
          setStatus('error');
          setMessage(error.message || "Não foi possível verificar a integração com o Panda Video");
          return;
        }

        if (data && data.success) {
          setStatus('ok');
          setMessage(null);
        } else {
          setStatus('error');
          setMessage(data?.error || "Erro na integração com o Panda Video");
        }
      } catch (err) {
        console.error("Exceção ao verificar API:", err);
        setStatus('error');
        setMessage("Erro ao comunicar com serviço de vídeo");
      }
    };

    checkPandaAPIStatus();
  }, []);

  if (status === 'checking') {
    return (
      <Alert className="mb-4 bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <AlertDescription>
          Verificando integração com o serviço de vídeo...
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção na integração de vídeo</AlertTitle>
        <AlertDescription>
          {message || "Houve um problema na integração com o serviço de vídeo. O upload ou seleção de vídeos pode não funcionar corretamente."}
        </AlertDescription>
      </Alert>
    );
  }

  // Se estiver tudo ok, não exibimos nada para não distrair o usuário
  return null;
};
