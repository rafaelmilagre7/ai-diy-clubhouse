
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./RegisterForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const AuthLayout = () => {
  const [currentTab, setCurrentTab] = useState("login");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo com animações */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.img
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
            alt="VIVER DE IA Club"
            className="mx-auto h-20 w-auto animate-float"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          <motion.h1 
            className="mt-4 text-3xl font-extrabold text-white bg-gradient-to-r from-viverblue to-primary bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Viver de IA
          </motion.h1>
          <motion.p 
            className="mt-2 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Transforme sua vida com Inteligência Artificial
          </motion.p>
        </motion.div>

        {/* Card principal com efeitos visuais */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="w-full bg-gray-800/50 backdrop-blur-lg border-gray-700/50 shadow-2xl hover:shadow-viverblue/20 transition-all duration-300">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-white">
                {currentTab === "login" && "Bem-vindo de volta"}
                {currentTab === "register" && "Crie sua conta"}
                {currentTab === "reset" && "Recuperar senha"}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {currentTab === "login" && "Entre na sua conta para continuar"}
                {currentTab === "register" && "Junte-se à comunidade Viver de IA"}
                {currentTab === "reset" && "Recupere o acesso à sua conta"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 mb-6">
                  <TabsTrigger 
                    value="login" 
                    className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-viverblue transition-all duration-200"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-viverblue transition-all duration-200"
                  >
                    Registrar
                  </TabsTrigger>
                </TabsList>
                
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="login" className="space-y-4 mt-0">
                    <LoginForm onSwitchToReset={() => setCurrentTab("reset")} />
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4 mt-0">
                    <RegisterForm />
                  </TabsContent>
                  
                  <TabsContent value="reset" className="space-y-4 mt-0">
                    <ResetPasswordForm onBackToLogin={() => setCurrentTab("login")} />
                  </TabsContent>
                </motion.div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer com animação */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-sm text-gray-400">
            © 2024 Viver de IA. Todos os direitos reservados.
          </p>
        </motion.div>
      </motion.div>

      {/* Efeitos de fundo decorativos */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-viverblue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default AuthLayout;
