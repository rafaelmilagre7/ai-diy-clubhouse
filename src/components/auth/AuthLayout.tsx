
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./RegisterForm";
import { AnimatePresence, motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1A1F2C] via-[#2C3E50] to-[#34495E] p-4">
      <AnimatePresence mode="wait">
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
              className="mx-auto h-20 w-auto drop-shadow-2xl rounded-full border-4 border-white/10"
            />
            <h2 className="mt-6 text-3xl font-heading font-bold text-white/90 drop-shadow-md">
              Potencialize seu Alcance com IA
            </h2>
            <p className="mt-2 text-white/70 text-lg">
              Transforme seu negócio com inteligência artificial
            </p>
          </div>

          <Card className="w-full bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl hover:shadow-3xl transition-shadow duration-300 rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-center text-white/90 font-heading">
                Acesse sua conta
              </CardTitle>
              <CardDescription className="text-white/60 text-center text-base">
                Entre para acessar suas soluções de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                  <TabsTrigger 
                    value="login" 
                    className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all duration-300 rounded-lg"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white transition-all duration-300 rounded-lg"
                  >
                    Cadastro
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-white/60 space-y-2">
            <p className="text-base">
              Acesso exclusivo para membros do VIVER DE IA Club
            </p>
            <p>
              Não é membro ainda?{" "}
              <a
                href="https://milagredigital.com/club/"
                className="font-medium text-white/80 hover:text-white underline decoration-white/30 hover:decoration-white/60 transition-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                Conheça o Club
              </a>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;
