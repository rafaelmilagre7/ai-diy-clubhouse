
import React from "react";
import { CommentsSection } from "@/components/implementation/content/CommentsSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface TabBasedCommentsSectionProps {
  solutionId: string;
}

export const TabBasedCommentsSection = ({ solutionId }: TabBasedCommentsSectionProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Discussão e Suporte
          </CardTitle>
          <p className="text-sm text-gray-500">
            Compartilhe suas experiências, tire dúvidas e colabore com outros membros
          </p>
        </CardHeader>
      </Card>

      <Card className="border-white/10">
        <CardContent className="p-6">
          <CommentsSection 
            solutionId={solutionId} 
            moduleId="tab-based-implementation" 
          />
        </CardContent>
      </Card>
    </div>
  );
};
