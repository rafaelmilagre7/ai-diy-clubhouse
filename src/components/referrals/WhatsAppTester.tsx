
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { sendWhatsAppMessage } from "@/lib/supabase/rpc";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";

export function WhatsAppTester() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{success: boolean; message?: string; data?: any} | null>(null);

  const handleSendMessage = async () => {
    if (!phoneNumber) {
      toast.error("Número de telefone é obrigatório");
      return;
    }

    if (!message) {
      toast.error("Mensagem é obrigatória");
      return;
    }

    try {
      setIsSending(true);
      setResult(null);

      console.log(`Enviando mensagem WhatsApp para: ${phoneNumber}`);
      console.log(`Conteúdo da mensagem: ${message}`);
      
      const response = await sendWhatsAppMessage(
        phoneNumber,
        "text",
        { textContent: message }
      );

      console.log("Resposta da API WhatsApp:", response);
      setResult(response);

      if (response.success) {
        toast.success("Mensagem enviada com sucesso!");
      } else {
        toast.error(`Falha ao enviar mensagem: ${response.message || "Erro desconhecido"}`);
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem WhatsApp:", error);
      setResult({
        success: false,
        message: error.message || "Erro inesperado ao enviar mensagem"
      });
      toast.error(`Erro: ${error.message || "Erro desconhecido"}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de API WhatsApp</CardTitle>
        <CardDescription>
          Envie uma mensagem de teste para verificar a integração com WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Número de WhatsApp (com código do país)</Label>
          <PhoneInput
            id="phoneNumber"
            placeholder="+55 (99) 99999-9999"
            value={phoneNumber}
            onChange={(value) => setPhoneNumber(value)}
          />
          <p className="text-sm text-muted-foreground">
            Exemplo: +5511999999999
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Mensagem</Label>
          <Textarea
            id="message"
            placeholder="Digite sua mensagem de teste aqui"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button 
          onClick={handleSendMessage} 
          disabled={isSending} 
          className="w-full"
        >
          {isSending ? "Enviando..." : "Enviar Mensagem Teste"}
        </Button>
        
        {result && (
          <div className={`w-full p-4 rounded-md ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            <h4 className="font-medium text-sm">{result.success ? 'Sucesso' : 'Erro'}</h4>
            <p className="text-xs mt-1">{result.message || (result.success ? 'Mensagem enviada' : 'Falha no envio')}</p>
            {result.data && (
              <pre className="text-xs mt-2 overflow-auto max-h-32 p-2 bg-black/5 rounded">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
