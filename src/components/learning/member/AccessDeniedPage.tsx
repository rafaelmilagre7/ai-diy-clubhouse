
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Mail, UserCheck, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface AccessDeniedPageProps {
  title?: string;
  message?: string;
  courseTitle?: string;
  requiredRoles?: string[];
  contactEmail?: string;
}

export function AccessDeniedPage({ 
  title = "Acesso Restrito ao Curso", 
  message,
  courseTitle,
  requiredRoles = [],
  contactEmail = "suporte@viverdeia.ai"
}: AccessDeniedPageProps) {
  const navigate = useNavigate();
  
  const defaultMessage = courseTitle 
    ? `O curso "${courseTitle}" é exclusivo para membros com papéis específicos. Entre em contato com nossa equipe para saber mais sobre como obter acesso.`
    : "Este curso é exclusivo para membros com papéis específicos. Entre em contato com nossa equipe para saber mais sobre como obter acesso.";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            
            <CardTitle className="text-xl text-red-700 dark:text-red-300">
              {title}
            </CardTitle>
            
            <CardDescription className="text-red-600 dark:text-red-400">
              {message || defaultMessage}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações sobre papéis necessários */}
            {requiredRoles.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-700 dark:text-red-300 mb-2">
                      Papéis com Acesso
                    </h3>
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {requiredRoles.map((role, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <UserCheck className="h-3 w-3" />
                          {role}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Informações de contato */}
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Precisa de Acesso?
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                    Entre em contato conosco para solicitar acesso ou saber mais sobre os requisitos:
                  </p>
                  <a
                    href={`mailto:${contactEmail}?subject=Solicitação de Acesso ao Curso${courseTitle ? ` - ${courseTitle}` : ''}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>
            
            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate("/learning")}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Cursos
              </Button>
              
              <Button 
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Ir para Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
