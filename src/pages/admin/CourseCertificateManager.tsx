import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseDurationManager } from "@/components/admin/CourseDurationManager";
import { Badge } from "@/components/ui/badge";
import { Award, Clock } from "lucide-react";

export const CourseCertificateManager = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Certificados</h1>
          <p className="text-muted-foreground">
            Controle e sincronização das durações reais dos cursos para certificados fidedignos
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          <Award className="h-4 w-4 mr-1" />
          Certificados
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Sincronização de Durações
          </CardTitle>
          <CardDescription>
            Sincronize as durações reais dos vídeos do Panda Video para que os certificados reflitam 
            a carga horária correta de cada formação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseDurationManager />
        </CardContent>
      </Card>

      <Card className="border-status-warning/20 bg-status-warning/5">
        <CardHeader>
          <CardTitle className="text-status-warning-dark text-base">ℹ️ Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-status-warning-dark space-y-2">
          <p>
            • <strong>Sincronização Individual:</strong> Cada curso pode ser sincronizado separadamente
          </p>
          <p>
            • <strong>API do Panda Video:</strong> As durações são obtidas diretamente da API oficial
          </p>
          <p>
            • <strong>Certificados Atualizados:</strong> Após a sincronização, os certificados mostrarão as horas reais
          </p>
          <p>
            • <strong>Cache Inteligente:</strong> Os dados são armazenados para evitar reprocessamento desnecessário
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCertificateManager;