
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Send, Loader, Bot, XCircle, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface LessonAssistantChatProps {
  lessonId: string;
  assistantId: string | null;
  assistantPrompt: string | null;
  className?: string;
}

export const LessonAssistantChat: React.FC<LessonAssistantChatProps> = ({
  lessonId,
  assistantId,
  assistantPrompt,
  className = "",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Inicializar chat com mensagem de boas-vindas
  useEffect(() => {
    // Adicionar mensagem de boas-vindas do assistente
    setMessages([
      {
        id: "welcome-message",
        role: "assistant",
        content: "Olá! Sou o assistente desta aula. Como posso ajudar com suas dúvidas?",
        createdAt: new Date(),
      },
    ]);

    // Tentar carregar thread existente ou criar uma nova
    const loadOrCreateThread = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Verificar se existe thread para este usuário e aula
        const { data: existingThread, error: threadError } = await supabase
          .from("assistant_threads")
          .select("thread_id")
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
          .maybeSingle();

        if (threadError) throw threadError;
        
        if (existingThread && existingThread.thread_id) {
          setThreadId(existingThread.thread_id);
          await loadMessages(existingThread.thread_id);
        } else {
          // Criar novo thread
          const { data } = await supabase.functions.invoke("create-assistant-thread", {
            body: { lessonId, assistantId }
          });
          
          if (data && data.threadId) {
            setThreadId(data.threadId);
            
            // Salvar referência ao thread no banco
            await supabase.from("assistant_threads").insert({
              user_id: user.id,
              lesson_id: lessonId,
              thread_id: data.threadId,
              assistant_id: assistantId
            });
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar chat:", error);
        toast.error("Não foi possível inicializar o chat do assistente");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrCreateThread();
  }, [lessonId, assistantId, user]);

  // Carregar mensagens do thread existente
  const loadMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("get-assistant-messages", {
        body: { threadId }
      });
      
      if (error) throw error;
      
      if (data && data.messages && Array.isArray(data.messages)) {
        // Adicionar todas as mensagens exceto a inicial de boas-vindas
        setMessages(prevMessages => {
          const welcomeMessage = prevMessages.find(m => m.id === "welcome-message");
          
          const formattedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content[0].text.value,
            createdAt: new Date(msg.created_at * 1000)
          }));
          
          return welcomeMessage 
            ? [welcomeMessage, ...formattedMessages] 
            : formattedMessages;
        });
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  // Rolar para a última mensagem sempre que as mensagens mudarem
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Função para enviar mensagem
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !threadId) return;
    
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: "user" as const,
      content: input,
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    try {
      setIsLoading(true);
      
      // Enviar mensagem para o assistante
      const { data, error } = await supabase.functions.invoke("send-assistant-message", {
        body: { 
          threadId, 
          content: input,
          assistantId,
          context: {
            lessonId,
            assistantPrompt
          }
        }
      });
      
      if (error) throw error;
      
      if (data && data.response) {
        setMessages(prev => [...prev, {
          id: data.messageId || `assistant-${Date.now()}`,
          role: "assistant",
          content: data.response,
          createdAt: new Date()
        }]);
      }
    } catch (error: any) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao enviar mensagem: " + (error.message || "Tente novamente"));
      
      // Adicionar mensagem de erro do assistante
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        createdAt: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Lidar com tecla Enter (enviar mensagem)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Renderizar mensagens
  const renderMessages = () => {
    return messages.map((message) => (
      <div 
        key={message.id} 
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div className={`flex items-start gap-2 max-w-[80%] ${
          message.role === "user" ? "flex-row-reverse" : ""
        }`}>
          <Avatar className={`h-8 w-8 ${message.role === "assistant" ? "bg-primary" : "bg-muted"}`}>
            <AvatarFallback>
              {message.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
            </AvatarFallback>
          </Avatar>
          <div className={`rounded-lg p-3 ${
            message.role === "user" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-foreground"
          }`}>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {message.createdAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <Card className={`flex flex-col h-[500px] ${className}`}>
      <CardHeader className="px-4 py-2 border-b">
        <CardTitle className="text-lg flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary" />
          Assistente IA
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="flex flex-col">
            {renderMessages()}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t">
        <div className="flex w-full items-end gap-2">
          <Textarea
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-10 flex-grow resize-none"
            disabled={isLoading || !threadId}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={isLoading || !input.trim() || !threadId}
          >
            {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Enviar mensagem</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
