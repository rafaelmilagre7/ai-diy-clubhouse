import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { sendWhatsAppMessage } from "@/lib/supabase/rpc";
import { toast } from "sonner";
import { PhoneInput } from "@/components/ui/phone-input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function WhatsAppTester() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"text" | "template">("text");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{success: boolean; message?: string; data?: any} | null>(null);
  
  // Template specific states
  const [templateName, setTemplateName] = useState("plataforma_01");
  const [templateParams, setTemplateParams] = useState({
    param1: "", // Nome da pessoa
    param2: "", // Nome do produto (Club ou Formação)
    param3: "", // Mensagem personalizada
    param4: ""  // URL do convite
  });

  const handleSendMessage = async () => {
    if (!phoneNumber) {
      toast.error("Número de telefone é obrigatório");
      return;
    }

    if (messageType === "text" && !message) {
      toast.error("Mensagem é obrigatória");
      return;
    }

    if (messageType === "template" && !templateName) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    try {
      setIsSending(true);
      setResult(null);

      console.log(`Enviando mensagem WhatsApp para: ${phoneNumber}`);
      
      let response;
      
      if (messageType === "text") {
        console.log(`Conteúdo da mensagem: ${message}`);
        response = await sendWhatsAppMessage(
          phoneNumber,
          "text",
          { textContent: message }
        );
      } else {
        // Filtrar parâmetros vazios
        const nonEmptyParams: Record<string, string> = {};
        Object.entries(templateParams).forEach(([key, value], index) => {
          if (value) nonEmptyParams[`param${index + 1}`] = value;
        });
        
        console.log(`Enviando template: ${templateName}`);
        console.log(`Parâmetros do template:`, nonEmptyParams);
        
        response = await sendWhatsAppMessage(
          phoneNumber,
          "template",
          { 
            templateName, 
            templateParams: nonEmptyParams
          }
        );
      }

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

  const handleParamChange = (paramKey: string, value: string) => {
    setTemplateParams(prev => ({
      ...prev,
      [paramKey]: value
    }));
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de API WhatsApp</CardTitle>
        <CardDescription>
          Envie uma mensagem de teste para verificar a integração com WhatsApp
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="text" onValueChange={(value) => setMessageType(value as "text" | "template")}>
        <div className="px-6">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="text" className="flex-1">Texto Simples</TabsTrigger>
            <TabsTrigger value="template" className="flex-1">Template</TabsTrigger>
          </TabsList>
        </div>
        
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
          
          <TabsContent value="text" className="space-y-2 m-0 pt-2">
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
          </TabsContent>
          
          <TabsContent value="template" className="space-y-4 m-0 pt-2">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template</Label>
              <Select 
                value={templateName} 
                onValueChange={setTemplateName}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plataforma_01">Convite da Plataforma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 border p-3 rounded-md bg-muted/20">
              <h4 className="text-sm font-medium">Parâmetros do Template</h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="param1">Nome da pessoa</Label>
                  <Input
                    id="param1"
                    value={templateParams.param1}
                    onChange={(e) => handleParamChange("param1", e.target.value)}
                    placeholder="Ex: João"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="param2">Produto</Label>
                  <Input
                    id="param2"
                    value={templateParams.param2}
                    onChange={(e) => handleParamChange("param2", e.target.value)}
                    placeholder="Ex: Viver de IA Club"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="param3">Mensagem personalizada</Label>
                  <Textarea
                    id="param3"
                    value={templateParams.param3}
                    onChange={(e) => handleParamChange("param3", e.target.value)}
                    placeholder="Mensagem personalizada (opcional)"
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="param4">Link do convite</Label>
                  <Input
                    id="param4"
                    value={templateParams.param4}
                    onChange={(e) => handleParamChange("param4", e.target.value)}
                    placeholder="Ex: https://viverdeia.ai/register?referral=ABCDEF"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
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
