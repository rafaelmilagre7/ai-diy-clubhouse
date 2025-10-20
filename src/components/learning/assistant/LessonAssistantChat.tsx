
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SendIcon, Loader2, BotIcon, User } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LessonAssistantChatProps {
  lessonId: string;
  assistantId?: string | null;
  assistantPrompt?: string | null;
}

export const LessonAssistantChat: React.FC<LessonAssistantChatProps> = ({ 
  lessonId, 
  assistantId = null,
  assistantPrompt = null
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Efeito para rolar para o final da conversa quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ajustar altura do textarea automaticamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Função para enviar mensagem para o assistente
  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Adiciona a mensagem do usuário à conversa
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simula um atraso na resposta (substitua isto com uma chamada real ao seu backend/API)
    try {
      setTimeout(() => {
        // Esta é apenas uma simulação
        // Em um ambiente de produção, você usaria uma função Supabase Edge para chamar a API do OpenAI
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: `Isso é uma simulação de resposta do assistente. Em uma implementação real, você chamaria a API do OpenAI usando o assistantId: ${assistantId || 'não definido'} e incluiria o contexto da aula.`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Não foi possível enviar sua mensagem. Tente novamente.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!assistantId) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <p>Assistente IA não está configurado para esta aula.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BotIcon className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Assistente IA</CardTitle>
        </div>
        <CardDescription>
          Tire suas dúvidas sobre o conteúdo desta aula com nosso assistente IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-scroll-lg overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4 py-10">
              <BotIcon className="h-12 w-12" />
              <div>
                <p className="font-medium">Assistente IA disponível</p>
                <p className="text-sm">Envie uma mensagem para começar a conversa.</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div 
                  className={`flex items-start gap-2 max-w-[80%] ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <Avatar className={`h-8 w-8 ${msg.role === 'user' ? 'bg-primary' : 'bg-muted'}`}>
                    {msg.role === 'user' ? (
                      <AvatarFallback>U</AvatarFallback>
                    ) : (
                      <AvatarFallback><BotIcon className="h-4 w-4" /></AvatarFallback>
                    )}
                  </Avatar>
                  <div 
                    className={`rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {new Intl.DateTimeFormat('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8 bg-muted">
                <AvatarFallback><BotIcon className="h-4 w-4" /></AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="p-4">
        <div className="flex items-end w-full gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem aqui..."
            className="resize-none min-h-[40px] max-h-textarea"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LessonAssistantChat;
