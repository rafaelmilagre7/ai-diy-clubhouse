
import React from 'react';
import { GraduationCap } from 'lucide-react';

export const MemberLearningHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-viverblue/10">
          <GraduationCap className="w-6 h-6 text-viverblue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-1">Aprendizado</h1>
          <p className="text-muted-foreground">
            Acelere seu conhecimento com nossos cursos práticos
          </p>
        </div>
      </div>
    </div>
  );
};
