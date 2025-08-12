
import { ModernTopicEditor } from "./ModernTopicEditor";
import { useNavigate } from "react-router-dom";

interface NewTopicFormProps {
  categoryId?: string;
  categorySlug?: string;
  onSuccess?: () => void;
}

export const NewTopicForm = ({ categoryId, categorySlug, onSuccess }: NewTopicFormProps) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    if (onSuccess) {
      // Se um callback customizado foi fornecido, usa ele (modal)
      onSuccess();
    } else {
      // Caso contrário, navega normalmente (página normal)
      if (categorySlug) {
        navigate(`/comunidade/categoria/${categorySlug}`);
      } else {
        navigate('/comunidade');
      }
    }
  };

  return (
    <ModernTopicEditor
      categoryId={categoryId}
      categorySlug={categorySlug}
      onSuccess={handleSuccess}
      mode="create"
    />
  );
};
