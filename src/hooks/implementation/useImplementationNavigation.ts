
import { useParams, useNavigate } from "react-router-dom";

export const useImplementationNavigation = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const moduleIdx = parseInt(moduleIndex || "0");
  const navigate = useNavigate();
  
  // Navigate to next module
  const handleComplete = () => {
    navigate(`/implement/${id}/${moduleIdx + 1}`);
  };
  
  // Navigate to previous module
  const handlePrevious = () => {
    if (moduleIdx > 0) {
      navigate(`/implement/${id}/${moduleIdx - 1}`);
    } else {
      navigate(`/solution/${id}`);
    }
  };
  
  return {
    handleComplete,
    handlePrevious
  };
};
