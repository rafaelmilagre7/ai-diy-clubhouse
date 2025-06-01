
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useImplementationTrail } from "@/hooks/implementation/useImplementationTrail";
import { useTrailEnrichment } from "@/hooks/implementation/useTrailEnrichment";
import { useTrailSolutionsEnrichment } from "@/hooks/implementation/useTrailSolutionsEnrichment";
import { TrailCardLoader } from "./TrailCardLoader";
import { TrailEmptyState } from "./TrailEmptyState";
import { TrailCardHeader } from "./TrailCardHeader";
import { TrailAIContent } from "./TrailAIContent";

export const ImplementationTrail = () => {
  const navigate = useNavigate();
  const { trail, isLoading, hasContent, refreshTrail, generateImplementationTrail } = useImplementationTrail();
  const { enrichedLessons, isLoading: lessonsLoading } = useTrailEnrichment(trail);
  const { enrichedSolutions, isLoading: solutionsLoading } = useTrailSolutionsEnrichment(trail);

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

  if (isLoading) {
    return <TrailCardLoader />;
  }

  if (!hasContent) {
    return <TrailEmptyState onRegenerate={handleRegenerateTrail} />;
  }

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
