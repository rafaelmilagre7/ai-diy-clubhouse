
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./login/LoginForm";
import RegisterForm from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import TestLoginButtons from "./login/TestLoginButtons";
import { useAuth } from "@/contexts/auth";

const AuthLayout = () => {
  const [currentTab, setCurrentTab] = useState("login");
  const { signInAsMember, signInAsAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleMemberLogin = async () => {
    setIsLoading(true);
    try {
      await signInAsMember();
    } catch (error) {
      console.error("Erro no login de membro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setIsLoading(true);
    try {
      await signInAsAdmin();
    } catch (error) {
      console.error("Erro no login de admin:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
              alt="VIVER DE IA Club" 
              className="h-12 w-auto" 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Viver de IA</CardTitle>
          <CardDescription className="text-gray-300">
            {currentTab === "login" && "Entre na sua conta"}
            {currentTab === "register" && "Crie sua conta"}
            {currentTab === "reset" && "Recupere sua senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
              <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-viverblue">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-viverblue">
                Registrar
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <LoginForm />
              <TestLoginButtons 
                onMemberLogin={handleMemberLogin}
                onAdminLogin={handleAdminLogin}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <RegisterForm />
            </TabsContent>
            
            <TabsContent value="reset" className="space-y-4">
              <ResetPasswordForm onBackToLogin={() => setCurrentTab("login")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
