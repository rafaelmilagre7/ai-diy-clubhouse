
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { Lightbulb, Book, Sparkles } from "lucide-react";
import MemberLayout from '@/components/layout/MemberLayout';

const FormacaoIntro = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const startOnboarding = () => {
    navigate("/onboarding/formacao/personal-info");
  };

  return (
    <MemberLayout>
      <div className="container max-w-4xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo(a) à Formação Viver de IA</h1>
          <p className="text-xl text-muted-foreground">
            Vamos personalizar sua experiência de aprendizado
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white">
            <CardTitle className="text-2xl">Seu caminho para se tornar especialista em IA começa aqui</CardTitle>
            <CardDescription className="text-white/80">
              Complete seu perfil de aluno para termos uma experiência personalizada para você
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium mb-2">Avaliação Personalizada</h3>
                <p className="text-sm text-muted-foreground">
                  Entenderemos seu nível atual para recomendar lições adequadas
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Book className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium mb-2">Conteúdo Direcionado</h3>
                <p className="text-sm text-muted-foreground">
                  Aprenda exatamente o que é mais relevante para seus objetivos
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium mb-2">Experiência Adaptativa</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa plataforma se adapta ao seu ritmo e estilo de aprendizado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button onClick={startOnboarding} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Começar Onboarding
          </Button>
        </div>
      </div>
    </MemberLayout>
  );
};

export default FormacaoIntro;
