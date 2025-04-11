
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Home } from "lucide-react";

interface CelebrationModuleProps {
  onComplete: () => void;
}

export const CelebrationModule = ({ onComplete }: CelebrationModuleProps) => {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-8 py-12">
      <div className="animate-celebrate">
        <div className="h-32 w-32 mx-auto mb-6 rounded-full bg-viverblue flex items-center justify-center">
          <CheckCircle className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-4xl font-bold">Parabéns!</h1>
        <p className="text-xl text-muted-foreground mt-4">
          Você implementou com sucesso a solução de IA.
        </p>
      </div>
      
      <div className="bg-card border rounded-xl p-8 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Seu Certificado de Implementação</h2>
        <div className="border-4 border-viverblue/20 rounded-lg p-8 bg-white">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-viverblue">VIVER DE IA Club</h3>
            <h4 className="text-3xl font-bold">Certificado de Implementação</h4>
            <p className="text-lg">Concedido a</p>
            <p className="text-2xl font-semibold">João Silva</p>
            <p className="text-lg">por implementar com sucesso</p>
            <p className="text-xl font-medium">Assistente de Vendas no Instagram</p>
            <p className="text-sm text-muted-foreground">11 de Abril de 2025</p>
          </div>
        </div>
        <Button variant="outline" className="mt-4">
          <Download className="mr-2 h-4 w-4" />
          Download do Certificado
        </Button>
      </div>
      
      <div className="flex flex-col items-center gap-4 pt-6">
        <Button size="lg" onClick={onComplete} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-5 w-5" />
          Implementação Concluída
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          <Home className="mr-2 h-5 w-5" />
          Voltar para o Dashboard
        </Button>
      </div>
    </div>
  );
};
