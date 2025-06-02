
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonVideoPlayer } from "../LessonVideoPlayer";
import { LessonDescription } from "../LessonDescription";
import { LessonResources } from "../LessonResources";
import { LessonComments } from "../../comments/LessonComments";
import { LearningLesson, LearningLessonVideo, LearningResource } from "@/lib/supabase";

interface LessonContentTabsProps {
  lesson: LearningLesson;
  videos: LearningLessonVideo[];
  resources: LearningResource[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onProgressUpdate?: (videoId: string, progress: number) => void;
}

export const LessonContentTabs: React.FC<LessonContentTabsProps> = ({
  lesson,
  videos,
  resources,
  activeTab,
  onTabChange,
  onProgressUpdate
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-cardBg">
        <TabsTrigger value="content">Conteúdo</TabsTrigger>
        <TabsTrigger value="videos">Vídeos ({videos.length})</TabsTrigger>
        <TabsTrigger value="resources">Recursos ({resources.length})</TabsTrigger>
        <TabsTrigger value="comments">Comentários</TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-6">
        <LessonDescription lesson={lesson} />
      </TabsContent>

      <TabsContent value="videos" className="mt-6">
        <LessonVideoPlayer 
          videos={videos}
          onProgress={onProgressUpdate}
        />
      </TabsContent>

      <TabsContent value="resources" className="mt-6">
        <LessonResources resources={resources} />
      </TabsContent>

      <TabsContent value="comments" className="mt-6">
        <LessonComments lessonId={lesson.id} />
      </TabsContent>
    </Tabs>
  );
};
