
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const AuthLayout = () => {
  const [currentTab, setCurrentTab] = useState("login");

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
            {currentTab === "login" && "Entrar"}
            {currentTab === "register" && "Registrar"}
            {currentTab === "reset" && "Recuperar senha"}
          </CardTitle>
          <CardDescription>
            {currentTab === "login" && "Acesse sua conta para continuar"}
            {currentTab === "register" && "Crie sua conta para começar"}
            {currentTab === "reset" && "Recupere o acesso à sua conta"}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-0">
              <LoginForm onSwitchToReset={() => setCurrentTab("reset")} />
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-0">
              <RegisterForm />
            </TabsContent>
            
            <TabsContent value="reset" className="space-y-4 mt-0">
              <ResetPasswordForm onBackToLogin={() => setCurrentTab("login")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
