
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./RegisterForm";
import { AnimatePresence, motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4">
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
              className="mx-auto h-20 w-auto"
            />
            <h2 className="mt-4 text-2xl font-extrabold text-white">
              Potencialize seu Alcance com Inteligência Artificial
            </h2>
          </div>

          <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-center">Acesse sua conta</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Entre para acessar suas soluções de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-gray-800">
                  <TabsTrigger value="login" className="data-[state=active]:bg-viverblue">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-viverblue">
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

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              Acesso exclusivo para membros do VIVER DE IA Club.
            </p>
            <p className="mt-2">
              Não é membro ainda?{" "}
              <a
                href="https://milagredigital.com/club/"
                className="font-medium text-viverblue hover:text-viverblue/90"
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
