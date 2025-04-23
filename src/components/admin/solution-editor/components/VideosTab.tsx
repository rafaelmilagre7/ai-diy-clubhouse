
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SimpleVideoUpload } from "@/components/admin/solution/editor/components/video/SimpleVideoUpload";

interface VideosTabProps {
  solution: any;
  currentValues: any;
  onSubmit: (values: any) => Promise<void>;
  saving: boolean;
}

const VideosTab: React.FC<VideosTabProps> = ({
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <SimpleVideoUpload solutionId={solution?.id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VideosTab;
