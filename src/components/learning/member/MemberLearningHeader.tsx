
import React from "react";
import { BookOpen, Users, Award } from "lucide-react";

export const MemberLearningHeader = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Área de Aprendizado</h1>
        <p className="text-muted-foreground mt-2">
          Aprenda sobre IA e implemente soluções em seu negócio
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
          <BookOpen className="w-8 h-8 text-viverblue" />
          <div>
            <p className="font-semibold">Cursos Estruturados</p>
            <p className="text-sm text-muted-foreground">Conteúdo organizado e progressivo</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
          <Users className="w-8 h-8 text-viverblue" />
          <div>
            <p className="font-semibold">Comunidade Ativa</p>
            <p className="text-sm text-muted-foreground">Aprenda com outros membros</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50">
          <Award className="w-8 h-8 text-viverblue" />
          <div>
            <p className="font-semibold">Certificados</p>
            <p className="text-sm text-muted-foreground">Comprove seu conhecimento</p>
          </div>
        </div>
      </div>
    </div>
  );
};
