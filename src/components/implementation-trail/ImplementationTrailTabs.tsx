
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './tabs/OverviewTab';
import { SolutionsTab } from './tabs/SolutionsTab';
import { LessonsTab } from './tabs/LessonsTab';
import { Eye, Target, GraduationCap, Sparkles } from 'lucide-react';
import { ImplementationTrailData } from '@/types/implementationTrail';

interface ImplementationTrailTabsProps {
  trail: ImplementationTrailData;
}

export const ImplementationTrailTabs = ({ trail }: ImplementationTrailTabsProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Preload dados das abas para transições mais rápidas
  const allSolutionIds = useMemo(() => [
    ...trail.priority1.map(p => p.solutionId),
    ...trail.priority2.map(p => p.solutionId),
    ...trail.priority3.map(p => p.solutionId)
  ], [trail]);
  
  const allLessonIds = useMemo(() => 
    trail.recommended_lessons?.map(l => l.lessonId) || []
  , [trail.recommended_lessons]);

  const totalSolutions = trail.priority1.length + trail.priority2.length + trail.priority3.length;
  const totalLessons = trail.recommended_lessons?.length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 aurora-glass border-viverblue/20">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger 
            value="solutions" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Soluções</span>
            <span className="sm:hidden">Soluções</span>
            {totalSolutions > 0 && (
              <span className="bg-viverblue text-white text-xs px-2 py-0.5 rounded-full ml-1">
                {totalSolutions}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="lessons" 
            className="flex items-center gap-2 data-[state=active]:bg-viverblue data-[state=active]:text-white"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Aulas</span>
            <span className="sm:hidden">Aulas</span>
            {totalLessons > 0 && (
              <span className="bg-operational text-white text-xs px-2 py-0.5 rounded-full ml-1">
                {totalLessons}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 animate-fade-in">
          <OverviewTab trail={trail} />
        </TabsContent>

        <TabsContent value="solutions" className="mt-6 animate-fade-in">
          <SolutionsTab trail={trail} />
        </TabsContent>

        <TabsContent value="lessons" className="mt-6 animate-fade-in">
          <LessonsTab trail={trail} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
