
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const OnboardingIncompleteAlert = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
    >
      <Alert className="bg-amber-50 border-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-3">
            <ClipboardList className="h-5 w-5 text-amber-600" />
            <div>
              <AlertTitle className="text-amber-800 font-medium">Onboarding não concluído</AlertTitle>
              <AlertDescription className="text-amber-700">
                Complete seu onboarding para receber uma trilha personalizada de implementação de IA.
              </AlertDescription>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/onboarding')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Completar Onboarding
          </Button>
        </div>
      </Alert>
    </motion.div>
  );
};
