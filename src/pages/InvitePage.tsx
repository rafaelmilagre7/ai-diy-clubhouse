
import { useState, useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

interface InviteData {
  id: string;
  email: string;
  expires_at: string;
  role_id: string;
  used_at: string | null;
  role?: {
    name: string;
  };
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [inviteStatus, setInviteStatus] = useState<"valid" | "used" | "expired" | "error" | "success">("valid");
  
  // Formulário de registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("invites")
          .select("*, role:role_id(name)")
          .eq("token", token)
          .single();
        
        if (error) {
          throw error;
        }
        
        setInvite(data);
        
        // Verificar status do convite
        if (data.used_at) {
          setInviteStatus("used");
        } else if (new Date(data.expires_at) < new Date()) {
          setInviteStatus("expired");
        } else {
          setInviteStatus("valid");
          setEmail(data.email); // Preencher o email automaticamente
        }
        
      } catch (error) {
        console.error("Erro ao buscar convite:", error);
        setInviteStatus("error");
        toast.error("Convite inválido", {
          description: "O link de convite não é válido ou expirou."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvite();
  }, [token]);
  
  // Se o usuário já estiver logado e o convite for válido, usar o convite
  useEffect(() => {
    const useInviteForLoggedUser = async () => {
      if (user && invite && inviteStatus === "valid") {
        try {
          setIsProcessing(true);
          
          const { data, error } = await supabase.rpc('use_invite', {
            invite_token: token,
            user_id: user.id
          });
          
          if (error) throw error;
          
          if (data.status === 'success') {
            setInviteStatus("success");
            toast.success("Convite utilizado com sucesso", {
              description: "Seu acesso foi atualizado na plataforma."
            });
          } else {
            throw new Error(data.message || "Não foi possível utilizar o convite");
          }
          
        } catch (error: any) {
          console.error("Erro ao utilizar convite:", error);
          toast.error("Erro ao processar convite", {
            description: error.message || "Ocorreu um erro ao processar seu convite."
          });
        } finally {
          setIsProcessing(false);
        }
      }
    };
    
    useInviteForLoggedUser();
  }, [user, invite, inviteStatus, token]);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invite) return;
    
    try {
      setIsProcessing(true);
      
      // Registrar o usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role_id: invite.role_id
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      // Usar o convite
      const { data, error } = await supabase.rpc('use_invite', {
        invite_token: token,
        user_id: authData.user.id
      });
      
      if (error) throw error;
      
      if (data.status === 'success') {
        setInviteStatus("success");
        toast.success("Conta criada com sucesso", {
          description: "Seu cadastro foi concluído e você já pode acessar a plataforma."
        });
      } else {
        throw new Error(data.message || "Não foi possível utilizar o convite");
      }
      
    } catch (error: any) {
      console.error("Erro ao registrar:", error);
      toast.error("Erro ao criar conta", {
        description: error.message || "Ocorreu um erro ao processar seu cadastro."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Redirecionar para o dashboard se o usuário estiver logado e o convite for usado com sucesso
  if (user && inviteStatus === "success") {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se estiver carregando, mostrar indicador
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-center">Verificando convite...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
              alt="VIVER DE IA Club" 
              className="h-12 w-auto" 
            />
          </div>
          <CardTitle className="text-2xl">
            {inviteStatus === "valid" && !user && "Aceitar Convite"}
            {inviteStatus === "valid" && user && "Ativando seu acesso..."}
            {inviteStatus === "expired" && "Convite Expirado"}
            {inviteStatus === "used" && "Convite Já Utilizado"}
            {inviteStatus === "error" && "Convite Inválido"}
            {inviteStatus === "success" && "Convite Aceito!"}
          </CardTitle>
          <CardDescription>
            {inviteStatus === "valid" && !user && "Complete seu cadastro para acessar a plataforma"}
            {inviteStatus === "valid" && user && "Estamos processando seu convite"}
            {inviteStatus === "expired" && "Este convite já expirou e não pode ser utilizado"}
            {inviteStatus === "used" && "Este convite já foi utilizado anteriormente"}
            {inviteStatus === "error" && "Não foi possível encontrar o convite solicitado"}
            {inviteStatus === "success" && "Seu acesso foi configurado com sucesso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mostrar detalhes do convite */}
          {invite && (inviteStatus === "valid" || inviteStatus === "success") && (
            <div className="bg-primary/5 p-4 rounded-md mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Convite para: <span className="font-normal">{invite.email}</span></p>
                  <p className="text-sm font-medium mt-1">Papel: <span className="font-normal">{invite.role?.name || "Membro"}</span></p>
                  {inviteStatus === "valid" && (
                    <p className="text-sm font-medium mt-1">Expira em: <span className="font-normal">
                      {new Date(invite.expires_at).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span></p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Formulário de registro para convite válido */}
          {inviteStatus === "valid" && !user && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={invite?.email ? true : false}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Crie uma senha segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Criar minha conta"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Faça login
                </Link>
              </p>
            </form>
          )}
          
          {/* Mensagem para usuário já logado com convite válido */}
          {inviteStatus === "valid" && user && (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center">
                Estamos atualizando seu acesso usando este convite...
              </p>
            </div>
          )}
          
          {/* Mensagem para convite já utilizado */}
          {inviteStatus === "used" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-amber-50 text-amber-700 p-4 rounded-md mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p>Este convite já foi utilizado anteriormente.</p>
              </div>
              <p className="text-center text-muted-foreground">
                Se você já se cadastrou, faça login para acessar sua conta.
              </p>
            </div>
          )}
          
          {/* Mensagem para convite expirado */}
          {inviteStatus === "expired" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                <p>Este convite expirou e não pode mais ser utilizado.</p>
              </div>
              <p className="text-center text-muted-foreground">
                Entre em contato com o administrador para solicitar um novo convite.
              </p>
            </div>
          )}
          
          {/* Mensagem para convite com erro */}
          {inviteStatus === "error" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                <p>Não foi possível encontrar o convite solicitado.</p>
              </div>
              <p className="text-center text-muted-foreground">
                O link pode estar incorreto ou o convite já foi removido.
              </p>
            </div>
          )}
          
          {/* Mensagem para convite com sucesso */}
          {inviteStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p>Seu acesso foi configurado com sucesso!</p>
              </div>
              <Button asChild>
                <Link to="/dashboard">
                  Ir para o Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          {inviteStatus !== "valid" && inviteStatus !== "success" && (
            <Button asChild variant="outline">
              <Link to="/login">Voltar para Login</Link>
            </Button>
          )}
          {inviteStatus === "valid" && user && (
            <Button variant="outline" disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Aguarde..."}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
