
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const AuthLayout = () => {
  const [currentTab, setCurrentTab] = useState("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Viver de IA</CardTitle>
          <CardDescription>
            {currentTab === "login" && "Entre na sua conta"}
            {currentTab === "register" && "Crie sua conta"}
            {currentTab === "reset" && "Recupere sua senha"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <LoginForm onSwitchToReset={() => setCurrentTab("reset")} />
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
