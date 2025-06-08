
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { cleanupAuthState } from "@/utils/authUtils";

interface LoginFormProps {
  onSwitchToReset: () => void;
}

export const LoginForm = ({ onSwitchToReset }: LoginFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Limpar estado de autenticação anterior para evitar conflitos
      cleanupAuthState();
      
      // Tentativa de logout global para garantir um estado limpo
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continuar mesmo se falhar
        console.log("Erro ao limpar sessão anterior:", err);
      }
      
      // Login com redirecionamento explícito
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Redirecionamento completo após login bem-sucedido
      if (data.user) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!",
        });
        
        // Forçar redirecionamento completo para o domínio correto
        const redirectUrl = window.location.origin.includes('localhost')
          ? 'http://localhost:3000/dashboard'
          : 'https://app.viverdeia.ai/dashboard';
          
        window.location.href = redirectUrl;
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      toast({
        title: "Erro de autenticação",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-200">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-gray-200">Senha</Label>
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToReset}
            className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
          >
            Esqueceu a senha?
          </Button>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
