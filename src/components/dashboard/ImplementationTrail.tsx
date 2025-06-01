
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useTrailEnrichment } from "@/hooks/implementation/useTrailEnrichment";
import { useTrailSolutionsEnrichment } from "@/hooks/implementation/useTrailSolutionsEnrichment";
import { useOnboardingCompletion } from "@/hooks/onboarding/useOnboardingCompletion";
import { TrailCardLoader } from "./TrailCardLoader";
import { TrailEmptyState } from "./TrailEmptyState";
import { OnboardingIncompleteTrailState } from "./OnboardingIncompleteTrailState";
import { TrailCardHeader } from "./TrailCardHeader";
import { TrailAIContent } from "./TrailAIContent";

export const ImplementationTrail = () => {
  const navigate = useNavigate();
  const { trail, isLoading, hasContent, refreshTrail, generateImplementationTrail } = useImplementationTrail();
  const { enrichedLessons, isLoading: lessonsLoading } = useTrailEnrichment(trail);
  const { enrichedSolutions, isLoading: solutionsLoading } = useTrailSolutionsEnrichment(trail);
  const { 
    data: onboardingData, 
    isLoading: onboardingLoading 
  } = useOnboardingCompletion();

  const handleRegenerateTrail = async () => {
    await generateImplementationTrail();
  };

  const handleSolutionClick = (id: string) => {
    navigate(`/solution/${id}`);
  };

  const handleLessonClick = (courseId: string, lessonId: string) => {
    navigate(`/learning/course/${courseId}/lesson/${lessonId}`);
  };

  const handleViewFullTrail = () => {
    navigate('/implementation-trail');
  };

  const handleNavigateToOnboarding = () => {
    navigate('/onboarding-new');
  };

  // Se ainda está carregando dados do onboarding ou trilha inicial
  if (isLoading || onboardingLoading) {
    return <TrailCardLoader />;
  }

  // Se onboarding não foi completado, mostrar estado específico
  const isOnboardingComplete = onboardingData?.isCompleted || false;
  if (!isOnboardingComplete) {
    return <OnboardingIncompleteTrailState onNavigateToOnboarding={handleNavigateToOnboarding} />;
  }

  // Se onboarding completo mas não tem trilha, mostrar estado vazio
  if (!hasContent) {
    return <TrailEmptyState onRegenerate={handleRegenerateTrail} />;
  }

  // Se tem trilha, mostrar conteúdo normal
  const isLoadingContent = lessonsLoading || solutionsLoading;

  return (
    <Card className="w-full">
      <TrailCardHeader 
        onUpdate={handleRegenerateTrail} 
        onViewAll={handleViewFullTrail}
        hasAIContent={true}
      />
      <CardContent>
        <TrailAIContent
          enrichedSolutions={enrichedSolutions}
          enrichedLessons={enrichedLessons}
          isLoading={isLoadingContent}
          onSolutionClick={handleSolutionClick}
          onLessonClick={handleLessonClick}
          onViewAll={handleViewFullTrail}
        />
      </CardContent>
    </Card>
  );
};
