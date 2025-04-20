
import React from 'react';
import { SetNewPasswordForm } from '@/components/auth/SetNewPasswordForm';
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
          <SetNewPasswordForm />
        </div>
        
        <div className="mt-4 text-center">
          <Link to="/login" className="text-viverblue hover:text-viverblue/80 inline-flex items-center text-sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar para página de login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SetNewPassword;
