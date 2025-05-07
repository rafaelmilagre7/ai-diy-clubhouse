
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const PandaVideoStatus = () => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"unchecked" | "ok" | "error">("unchecked");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoCount, setVideoCount] = useState<number | null>(null);

  const checkApiStatus = async () => {
    setChecking(true);
    setStatus("unchecked");
    setErrorMessage(null);
    
    try {
      toast.info("Verificando conexão com o Panda Video...");
      
      const { data, error } = await supabase.functions.invoke("check-panda-api", {
        method: "GET"
      });
      
      if (error) {
        console.error("Erro ao verificar API do Panda Video:", error);
        setStatus("error");
        setErrorMessage(`Erro na comunicação com o servidor: ${error.message}`);
        return;
      }
      
      if (data.success) {
        setStatus("ok");
        if (data.data?.videosCount !== undefined) {
          setVideoCount(data.data.videosCount);
        }
        toast.success("Conexão com Panda Video verificada com sucesso!");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Erro na comunicação com a API Panda Video");
        toast.error(data.error || "Falha na conexão com Panda Video");
      }
    } catch (err: any) {
      console.error("Erro ao verificar API:", err);
      setStatus("error");
      setErrorMessage(err.message || "Erro desconhecido");
    } finally {
      setChecking(false);
    }
  };
  
  // Verificar status quando o componente for montado
  useEffect(() => {
    checkApiStatus();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Status da API do Panda Video</h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={checkApiStatus}
          disabled={checking}
          className="gap-1"
        >
          {checking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Verificar
        </Button>
      </div>
      
      {status === "unchecked" && checking && (
        <div className="flex items-center p-4 bg-muted rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin mr-3" />
          Verificando conexão com a API...
        </div>
      )}
      
      {status === "ok" && (
        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Conexão estabelecida</AlertTitle>
          <AlertDescription>
            A conexão com a API do Panda Video está funcionando corretamente.
            {videoCount !== null && (
              <p className="mt-1 text-sm">
                {videoCount} vídeo(s) disponível(is) na sua conta.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            {errorMessage || "Não foi possível conectar com a API do Panda Video."}
            <p className="mt-1 text-sm">
              Verifique se a chave de API está correta nas configurações.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
