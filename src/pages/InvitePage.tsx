
import { useState, useEffect } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface InviteData {
  id: string;
  email: string;
  expires_at: string;
  role_id: string;
  used_at: string | null;
  token: string;
  role?: {
    name: string;
  };
}

const TOKEN_DEBUG = true; // Ativa logs detalhados para depuração de tokens

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [inviteStatus, setInviteStatus] = useState<"valid" | "used" | "expired" | "error" | "success">("valid");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState("");
  const [isManualEntry, setIsManualEntry] = useState(!token); // Se não tiver token na URL, mostrar entrada manual
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Formulário de registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Função para limpar tokens
  const cleanToken = (inputToken: string | undefined): string => {
    if (!inputToken) return "";
    
    // Logging para debug
    if (TOKEN_DEBUG) console.log("Token original:", inputToken, "comprimento:", inputToken?.length);
    
    // Normalização agressiva:
    // 1. Remover espaços, quebras de linha e caracteres invisíveis
    // 2. Converter para maiúsculas (banco de dados pode ser case-sensitive)
    // 3. Remover caracteres não alfanuméricos (segurança)
    let cleaned = inputToken
      .trim()
      .replace(/[\s\n\r\t]+/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
      
    if (TOKEN_DEBUG) {
      console.log("Token após limpeza:", cleaned, "comprimento:", cleaned?.length);
      if (cleaned !== inputToken) {
        console.log("Token foi modificado durante limpeza");
        // Mostrar caracteres hexadecimais para depuração
        console.log("Original em hex:", 
          Array.from(inputToken).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
        console.log("Limpo em hex:", 
          Array.from(cleaned).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '));
      }
    }
    
    return cleaned;
  };
  
  // Função para buscar convite
  const fetchInviteWithToken = async (tokenToUse: string) => {
    if (!tokenToUse) return;
    setDebugInfo(null);
    
    try {
      setIsLoading(true);
      setFetchError(null);
      
      // Limpar o token antes de fazer a consulta
      const cleanedToken = cleanToken(tokenToUse);
      
      if (TOKEN_DEBUG) {
        console.log("Buscando convite com token:", cleanedToken);
        console.log("Token comprimento:", cleanedToken?.length);
      }
      
      // Log detalhado para depuração
      if (TOKEN_DEBUG) {
        console.log("Token em formato hexadecimal:", 
          Array.from(cleanedToken).map(c => c.charCodeAt(0).toString(16)).join(' '));
      }
      
      // Busca no banco com token exato
      const { data: exactMatch, error: exactError } = await supabase
        .from("invites")
        .select("*, role:role_id(name)")
        .eq("token", cleanedToken)
        .maybeSingle();
        
      // Se não encontrou com o token exato, tenta buscar com LIKE
      if (!exactMatch && !exactError) {
        if (TOKEN_DEBUG) console.log("Tentando busca flexível com LIKE");
        
        // Buscar por tokens similares para debug
        const { data: similarTokens, error: similarError } = await supabase
          .from("invites")
          .select("id, token, email, expires_at, used_at")
          .ilike("token", `%${cleanedToken.substring(0, Math.min(6, cleanedToken.length))}%`) // Primeiros 6 caracteres
          .limit(5);
          
        if (!similarError && similarTokens && similarTokens.length > 0) {
          if (TOKEN_DEBUG) {
            console.log("Tokens similares encontrados:", similarTokens.map(i => 
              `${i.token} (${i.token.length} caracteres) - usado: ${i.used_at ? 'sim' : 'não'}`
            ));
          }
          
          // Para informações de debug
          setDebugInfo({
            searched: cleanedToken,
            similar_tokens: similarTokens.map(t => ({
              token: t.token,
              length: t.token.length,
              email: t.email,
              used: t.used_at ? true : false,
              expired: new Date(t.expires_at) < new Date()
            }))
          });
          
          // Tenta encontrar um token não usado que corresponda a pelo menos 70% dos caracteres
          const bestMatch = similarTokens.find(t => {
            if (t.used_at) return false; // Já usado
            if (new Date(t.expires_at) < new Date()) return false; // Expirado
            
            // Verificar se há pelo menos 70% de correspondência no começo do token
            const matchLength = Math.min(t.token.length, cleanedToken.length);
            let matchCount = 0;
            
            for (let i = 0; i < matchLength; i++) {
              if (t.token[i].toUpperCase() === cleanedToken[i].toUpperCase()) {
                matchCount++;
              }
            }
            
            const matchPercentage = matchCount / matchLength;
            return matchPercentage >= 0.7;
          });
          
          if (bestMatch) {
            if (TOKEN_DEBUG) console.log("Melhor correspondência encontrada:", bestMatch.token);
            
            // Buscar dados completos do convite encontrado
            const { data: fullInvite, error: fullInviteError } = await supabase
              .from("invites")
              .select("*, role:role_id(name)")
              .eq("id", bestMatch.id)
              .single();
              
            if (!fullInviteError && fullInvite) {
              setInvite(fullInvite);
              setEmail(fullInvite.email);
              
              if (fullInvite.used_at) {
                setInviteStatus("used");
              } else if (new Date(fullInvite.expires_at) < new Date()) {
                setInviteStatus("expired");
              } else {
                setInviteStatus("valid");
              }
              
              setIsLoading(false);
              return fullInvite;
            }
          }
        }
        
        // Nenhuma correspondência encontrada
        setInviteStatus("error");
        setFetchError(`Convite não encontrado para o token fornecido`);
        setIsLoading(false);
        return null;
      }
      
      if (exactError) {
        console.error("Erro na consulta do convite:", exactError);
        setFetchError(`Erro ao buscar convite: ${exactError.message || exactError.code || 'Erro desconhecido'}`);
        throw exactError;
      }
      
      if (!exactMatch) {
        console.error("Convite não encontrado para o token:", cleanedToken);
        setFetchError(`Convite não encontrado para o token fornecido`);
        setInviteStatus("error");
        setIsLoading(false);
        return null;
      }
      
      if (TOKEN_DEBUG) {
        console.log("Convite encontrado:", {
          id: exactMatch.id,
          email: exactMatch.email,
          token: exactMatch.token,
          token_length: exactMatch.token?.length,
          expires_at: exactMatch.expires_at,
          used_at: exactMatch.used_at,
          role: exactMatch.role?.name
        });
      }
      
      setInvite(exactMatch);
      
      // Verificar status do convite
      if (exactMatch.used_at) {
        setInviteStatus("used");
      } else if (new Date(exactMatch.expires_at) < new Date()) {
        setInviteStatus("expired");
      } else {
        setInviteStatus("valid");
        setEmail(exactMatch.email); // Preencher o email automaticamente
      }
      
      setIsLoading(false);
      return exactMatch;
    } catch (error) {
      console.error("Erro ao buscar convite:", error);
      setInviteStatus("error");
      setIsLoading(false);
      return null;
    }
  };
  
  // Efeito para buscar o convite quando o componente carrega
  useEffect(() => {
    if (token) {
      // Remover espaços do token na URL
      const cleanedToken = cleanToken(token);
      if (cleanedToken !== token) {
        console.log("Token na URL foi limpo de", token, "para", cleanedToken);
      }
      fetchInviteWithToken(token);
    } else {
      // Se não tiver token na URL, desativar o loading (estamos na página de entrada manual)
      setIsLoading(false);
    }
  }, [token]);
  
  // Se o usuário já estiver logado e o convite for válido, usar o convite
  useEffect(() => {
    const useInviteForLoggedUser = async () => {
      if (user && invite && inviteStatus === "valid") {
        try {
          setIsProcessing(true);
          
          const cleanedToken = invite.token || cleanToken(token || manualToken);
          console.log("Tentando usar convite para usuário já logado:", {
            token: cleanedToken,
            userId: user.id
          });
          
          const { data, error } = await supabase.rpc('use_invite', {
            invite_token: cleanedToken,
            user_id: user.id
          });
          
          if (error) {
            console.error("Erro na RPC use_invite:", error);
            throw error;
          }
          
          console.log("Resultado da RPC use_invite:", data);
          
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
  }, [user, invite, inviteStatus, token, manualToken]);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invite) return;
    
    try {
      setIsProcessing(true);
      
      console.log("Iniciando processo de registro para o convite:", {
        email,
        roleId: invite.role_id
      });
      
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
      
      if (authError) {
        console.error("Erro ao registrar usuário:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Falha ao criar usuário");
      }
      
      console.log("Usuário criado com sucesso, agora usando o convite");
      
      // Usar o token do convite recuperado do banco (mais seguro que o da URL)
      const tokenToUse = invite.token || cleanToken(token || manualToken);
      
      const { data, error } = await supabase.rpc('use_invite', {
        invite_token: tokenToUse,
        user_id: authData.user.id
      });
      
      if (error) {
        console.error("Erro ao usar convite após registro:", error);
        throw error;
      }
      
      console.log("Resultado de use_invite após registro:", data);
      
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
  
  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      toast.error("Código inválido", { description: "Por favor, insira um código de convite válido." });
      return;
    }
    
    const result = await fetchInviteWithToken(manualToken);
    if (result) {
      setIsManualEntry(false);
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/200x80?text=VIVER+DE+IA+Club";
              }}
            />
          </div>
          <CardTitle className="text-2xl">
            {isManualEntry && !invite && "Inserir Código de Convite"}
            {inviteStatus === "valid" && !user && !isManualEntry && "Aceitar Convite"}
            {inviteStatus === "valid" && user && "Ativando seu acesso..."}
            {inviteStatus === "expired" && "Convite Expirado"}
            {inviteStatus === "used" && "Convite Já Utilizado"}
            {inviteStatus === "error" && !isManualEntry && "Convite Inválido"}
            {inviteStatus === "success" && "Convite Aceito!"}
          </CardTitle>
          <CardDescription>
            {isManualEntry && !invite && "Insira o código de convite que você recebeu por email"}
            {inviteStatus === "valid" && !user && !isManualEntry && "Complete seu cadastro para acessar a plataforma"}
            {inviteStatus === "valid" && user && "Estamos processando seu convite"}
            {inviteStatus === "expired" && "Este convite já expirou e não pode mais ser utilizado"}
            {inviteStatus === "used" && "Este convite já foi utilizado anteriormente"}
            {inviteStatus === "error" && !isManualEntry && "Não foi possível encontrar o convite solicitado"}
            {inviteStatus === "success" && "Seu acesso foi configurado com sucesso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Entrada manual do token */}
          {(isManualEntry) && (
            <form onSubmit={handleManualTokenSubmit} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="manualToken">Código do convite</Label>
                <Input
                  id="manualToken"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Cole o código do convite aqui"
                  required
                  className="font-mono"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  "Verificar convite"
                )}
              </Button>
            </form>
          )}

          {/* Exibir erro de depuração se houver */}
          {fetchError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md mb-4 text-xs overflow-auto">
              <p className="font-semibold">Erro de depuração:</p>
              <p className="font-mono">{fetchError}</p>
              {token && !isManualEntry && (
                <>
                  <p className="font-semibold mt-2">Token recebido:</p>
                  <p className="font-mono break-all">{token}</p>
                  <p className="font-mono text-xs mt-1">
                    (Comprimento: {token.length} caracteres)
                  </p>
                </>
              )}
              
              {debugInfo && debugInfo.similar_tokens?.length > 0 && (
                <>
                  <p className="font-semibold mt-2">Tokens similares encontrados:</p>
                  <ul className="text-xs mt-1">
                    {debugInfo.similar_tokens.map((t: any, i: number) => (
                      <li key={i} className="font-mono mt-1">
                        {t.token} ({t.length} caracteres) - 
                        {t.used ? ' Já usado' : ' Disponível'}
                        {t.expired ? ' (Expirado)' : ''}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsManualEntry(true)}
                className="mt-2 text-xs"
              >
                Inserir código do convite manualmente
              </Button>
            </div>
          )}
          
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
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-5 w-5 mr-2" />
                <AlertTitle>Convite já utilizado</AlertTitle>
                <AlertDescription>
                  Este convite já foi utilizado anteriormente.
                </AlertDescription>
              </Alert>
              <p className="text-center text-muted-foreground">
                Se você já se cadastrou, faça login para acessar sua conta.
              </p>
            </div>
          )}
          
          {/* Mensagem para convite expirado */}
          {inviteStatus === "expired" && (
            <div className="flex flex-col items-center justify-center py-6">
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-5 w-5 mr-2" />
                <AlertTitle>Convite expirado</AlertTitle>
                <AlertDescription>
                  Este convite expirou e não pode mais ser utilizado.
                </AlertDescription>
              </Alert>
              <p className="text-center text-muted-foreground">
                Entre em contato com o administrador para solicitar um novo convite.
              </p>
            </div>
          )}
          
          {/* Mensagem para convite com erro */}
          {inviteStatus === "error" && !isManualEntry && (
            <div className="flex flex-col items-center justify-center py-6">
              <Alert variant="destructive" className="mb-4">
                <XCircle className="h-5 w-5 mr-2" />
                <AlertTitle>Convite não encontrado</AlertTitle>
                <AlertDescription>
                  Não foi possível encontrar o convite solicitado.
                </AlertDescription>
              </Alert>
              <p className="text-center text-muted-foreground mb-4">
                O link pode estar incorreto ou o convite já foi removido.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsManualEntry(true)}
              >
                Inserir código do convite manualmente
              </Button>
            </div>
          )}
          
          {/* Mensagem para convite com sucesso */}
          {inviteStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-6">
              <Alert variant="default" className="bg-green-50 text-green-800 mb-4 border-green-200">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                <AlertTitle>Acesso confirmado</AlertTitle>
                <AlertDescription>
                  Seu acesso foi configurado com sucesso!
                </AlertDescription>
              </Alert>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link to="/dashboard">
                  Ir para o Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          {inviteStatus !== "valid" && inviteStatus !== "success" && !isManualEntry && (
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
