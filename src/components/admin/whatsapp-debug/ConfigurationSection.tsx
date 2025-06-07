
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

interface ConfigStatus {
  token: { valid: boolean; message: string; };
  phoneId: { valid: boolean; message: string; };
  connectivity: { valid: boolean; message: string; };
}

const ConfigurationSection = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<ConfigStatus | null>(null);

  const checkConfiguration = async () => {
    setIsChecking(true);
    try {
      console.log("🔍 Verificando configuração do WhatsApp...");

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'check_config' }
      });

      if (error) {
        toast.error("Erro ao verificar configuração");
        console.error("Erro:", error);
        return;
      }

      setStatus(data);
      console.log("Status da configuração:", data);

    } catch (err: any) {
      console.error("Erro ao verificar configuração:", err);
      toast.error("Erro ao verificar configuração");
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (valid: boolean) => {
    return valid ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (valid: boolean) => {
    return (
      <Badge variant={valid ? "default" : "destructive"}>
        {valid ? "OK" : "Erro"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Status da Configuração</h3>
        <Button 
          onClick={checkConfiguration} 
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
          {isChecking ? "Verificando..." : "Verificar Configuração"}
        </Button>
      </div>

      {status && (
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(status.token.valid)}
                  WhatsApp Access Token
                </CardTitle>
                {getStatusBadge(status.token.valid)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{status.token.message}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(status.phoneId.valid)}
                  Phone Number ID
                </CardTitle>
                {getStatusBadge(status.phoneId.valid)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{status.phoneId.message}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {getStatusIcon(status.connectivity.valid)}
                  Conectividade API
                </CardTitle>
                {getStatusBadge(status.connectivity.valid)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{status.connectivity.message}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!status && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Clique em "Verificar Configuração" para testar as configurações do WhatsApp.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConfigurationSection;
