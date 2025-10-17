import React from "react";
import { GraduationCap } from "lucide-react";
export const MemberLearningHeader = () => {
  return <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <GraduationCap className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Cursos</h1>
      </div>
      <p className="text-muted-foreground">
        Explore nossos cursos e aprimore seus conhecimentos em implementação de IA
      </p>
    </div>;
};