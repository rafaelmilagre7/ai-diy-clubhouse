
import { ModernPostEditor } from "./ModernPostEditor";

interface NewPostFormProps {
  topicId: string;
  onSuccess?: () => void;
}

export const NewPostForm = ({ topicId, onSuccess }: NewPostFormProps) => {
  return (
    <ModernPostEditor
      topicId={topicId}
      onSuccess={onSuccess}
      mode="create"
    />
  );
};
