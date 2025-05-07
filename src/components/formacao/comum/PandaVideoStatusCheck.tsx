
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Info, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const PandaVideoStatusCheck = () => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"unchecked" | "error" | "ok">("unchecked");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [apiKeyFormat, setApiKeyFormat] = useState<boolean | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<{
    videosCount?: number;
    apiVersion?: string;
  } | null>(null);

  // Verificar status da API key
  const checkApiKeyStatus = async () => {
    setChecking(true);
    setStatus("unchecked");
    setErrorMessage(null);
    setErrorDetails(null);
    setConnectionInfo(null);
    setApiKeyFormat(null);
    
    try {
      toast.info("Verificando conexão com o Panda Video...");
      
      // Chamar a edge function para testar a API key
      const { data, error } = await supabase.functions.invoke("check-panda-api", {
        method: "GET"
      });
      
      if (error) {
        console.error("Erro ao chamar a função check-panda-api:", error);
        setStatus("error");
        setErrorMessage(`Erro na comunicação com o servidor: ${error.message}`);
        toast.error("Falha ao verificar API do Panda Video", {
          description: error.message
        });
        return;
      }

      if (!data.success) {
        console.error("Erro na resposta da API:", data);
        setStatus("error");
        setErrorMessage(data.error || "Erro na comunicação com a API Panda Video");
        setErrorDetails(data.message || null);
        
        // Verificar se o erro é relacionado ao formato da chave da API
        if (data.error?.includes('formato') || data.error?.includes('Key incorreto')) {
          setApiKeyFormat(false);
        } else if (data.error?.includes('Unauthorized') || data.statusCode === 401) {
          setErrorDetails("A chave da API parece estar formatada corretamente, mas não foi aceita pela API do Panda Video. Verifique se a chave está ativa e válida.");
        }
        
        toast.error("Falha na conexão com Panda Video", {
          description: data.error || "Verifique se a API key está configurada corretamente"
        });
        return;
      }
      
      // Se chegou até aqui, a API key está ok
      setStatus("ok");
      setApiKeyFormat(true);
      
      // Armazenar informações da conexão
      if (data.data) {
        setConnectionInfo({
          videosCount: data.data.videosCount,
          apiVersion: data.data.apiVersion || 'v2'
        });
      }
      
      toast.success("Conexão com Panda Video verificada com sucesso!");
    } catch (err: any) {
      console.error("Exceção ao verificar API key:", err);
      setStatus("error");
      setErrorMessage(err.message || "Erro desconhecido ao verificar API key");
      
      toast.error("Erro ao verificar API do Panda Video", {
        description: err.message
      });
    } finally {
      setChecking(false);
    }
  };

  // Verificar status ao montar o componente
  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-medium">Status da Integração com Panda Video</h3>
            <p className="text-sm text-muted-foreground">
              {status === "ok" 
                ? "API configurada e funcionando corretamente" 
                : status === "error"
                  ? "Erro na configuração da API"
                  : "Verificando conexão..."}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkApiKeyStatus}
            disabled={checking}
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1">Verificar</span>
          </Button>
        </div>
        
        {status === "ok" && (
          <Alert className="mt-3 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700">Integração funcionando</AlertTitle>
            <AlertDescription className="text-green-600">
              <div className="flex flex-col gap-1">
                <p>A API do Panda Video está configurada corretamente e pronta para uso.</p>
                
                {connectionInfo && (
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Informações da sua conta Panda Video</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span>
                      {connectionInfo.videosCount !== undefined ? 
                        `${connectionInfo.videosCount} vídeo(s) disponível(is)` :
                        "Conta verificada"}
                      {connectionInfo.apiVersion && ` (API ${connectionInfo.apiVersion})`}
                    </span>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {status === "error" && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro na integração</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{errorMessage || "Não foi possível conectar com a API do Panda Video."}</p>
              
              {errorDetails && (
                <p className="text-sm">{errorDetails}</p>
              )}
              
              {apiKeyFormat === false ? (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm mt-2">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Dica para solução:</p>
                      <p>Verifique se a chave da API do Panda Video está no formato correto. A chave deve começar com <code className="bg-gray-100 px-1 py-0.5 rounded">panda-</code> seguido de caracteres alfanuméricos.</p>
                      <p className="mt-1">Exemplo de formato válido: <code className="bg-gray-100 px-1 py-0.5 rounded">panda-abc123def456...</code></p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm mt-2">
                  Verifique se a chave da API do Panda Video está configurada corretamente nas configurações da aplicação.
                  A chave deve começar com <code>panda-</code> e estar ativa na sua conta do Panda Video.
                </p>
              )}
              
              <div className="mt-2 text-sm flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Conforme documentação da API v2, a autenticação deve ser feita incluindo apenas o valor da API key no cabeçalho Authorization.</span>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
