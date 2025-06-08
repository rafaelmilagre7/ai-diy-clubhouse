
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const AuthLayout = () => {
  const [currentTab, setCurrentTab] = useState("login");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="mx-auto h-20 w-auto"
          />
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">
              {currentTab === "login" && "Entrar"}
              {currentTab === "register" && "Registrar"}
              {currentTab === "reset" && "Recuperar senha"}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {currentTab === "login" && "Acesse sua conta para continuar"}
              {currentTab === "register" && "Crie sua conta para começar"}
              {currentTab === "reset" && "Recupere o acesso à sua conta"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-700">
                <TabsTrigger value="login" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600">
                  Registrar
                </TabsTrigger>
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
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
