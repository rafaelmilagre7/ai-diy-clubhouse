
import { RichPostEditor } from "./RichPostEditor";

interface NewPostFormProps {
  topicId: string;
  onSuccess?: () => void;
}

export const NewPostForm = ({ topicId, onSuccess }: NewPostFormProps) => {
  return (
    <RichPostEditor
      topicId={topicId}
      onSuccess={onSuccess}
    />
  );
};
