
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

export const useLayoutAuthentication = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [redirectChecked, setRedirectChecked] = useState(false);

  // Lógica de redirecionamento simplificada
  useEffect(() => {
    if (isLoading || redirectChecked) return;
    
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Marcar como verificado
    setRedirectChecked(true);
  }, [user, isLoading, redirectChecked, navigate]);

  return {
    user,
    profile,
    isAdmin,
    isLoading,
    redirectChecked
  };
};
