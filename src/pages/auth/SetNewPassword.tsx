
import React from 'react';
import { SetNewPasswordForm } from '@/components/auth/SetNewPasswordForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const SetNewPassword = () => {
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
          <h2 className="mt-4 text-2xl font-extrabold text-white">
            Definir Nova Senha
          </h2>
        </div>

        <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Nova Senha</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Defina sua nova senha para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SetNewPasswordForm />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SetNewPassword;
