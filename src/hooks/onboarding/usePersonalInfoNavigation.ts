
// Hook para navegação após sucesso no cadastro de dados pessoais
import { useNavigate } from "react-router-dom";

export function usePersonalInfoNavigation() {
  const navigate = useNavigate();

  const goToNextStep = () => {
    navigate("/onboarding/professional-data", { replace: true });
  };

  return { goToNextStep };
}
