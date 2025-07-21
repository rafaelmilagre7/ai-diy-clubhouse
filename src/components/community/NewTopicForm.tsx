
import { RichTopicEditor } from "./RichTopicEditor";
import { useNavigate } from "react-router-dom";

interface NewTopicFormProps {
  categoryId?: string;
  categorySlug?: string;
}

export const NewTopicForm = ({ categoryId, categorySlug }: NewTopicFormProps) => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirecionar para a categoria ou comunidade após sucesso
    if (categorySlug) {
      navigate(`/comunidade/categoria/${categorySlug}`);
    } else {
      navigate('/comunidade');
    }
  };

  return (
    <RichTopicEditor
      categoryId={categoryId}
      categorySlug={categorySlug}
      onSuccess={handleSuccess}
    />
  );
};
