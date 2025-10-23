
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from './tabs/OverviewTab';
import { SolutionsTabOptimized } from './tabs/SolutionsTabOptimized';
import { LessonsTab } from './tabs/LessonsTab';
import { Eye, Target, GraduationCap, BarChart3 } from 'lucide-react';
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
        <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-aurora data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted/50"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Visão Geral</span>
            <span className="sm:hidden font-medium">Geral</span>
          </TabsTrigger>
          <TabsTrigger 
            value="solutions" 
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-aurora data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted/50"
          >
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Soluções</span>
            <span className="sm:hidden font-medium">Soluções</span>
            {totalSolutions > 0 && (
              <span className="bg-aurora-primary/20 text-aurora-primary data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground text-xs px-2 py-0.5 rounded-full ml-1 font-semibold">
                {totalSolutions}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="lessons" 
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-aurora data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-muted/50"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Aulas</span>
            <span className="sm:hidden font-medium">Aulas</span>
            {totalLessons > 0 && (
              <span className="bg-operational/20 text-operational data-[state=active]:bg-primary-foreground/20 data-[state=active]:text-primary-foreground text-xs px-2 py-0.5 rounded-full ml-1 font-semibold">
                {totalLessons}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 animate-fade-in">
          <OverviewTab trail={trail} />
        </TabsContent>

        <TabsContent value="solutions" className="mt-6 animate-fade-in">
          <SolutionsTabOptimized trail={trail} />
        </TabsContent>

        <TabsContent value="lessons" className="mt-6 animate-fade-in">
          <LessonsTab trail={trail} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
