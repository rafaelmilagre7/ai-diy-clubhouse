
import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Handle timing out the loading state
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isLoading && !timeoutExceeded) {
      timeoutRef.current = window.setTimeout(() => {
        console.log("RootRedirect: Loading timeout exceeded");
        setTimeoutExceeded(true);
      }, 3000); // 3 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, timeoutExceeded]);
  
  // Debug para problemas de roteamento
  useEffect(() => {
    console.log("RootRedirect - Estado atual:", { 
      user: !!user, 
      isAdmin, 
      isLoading, 
      timeoutExceeded,
      path: window.location.pathname,
      fullUrl: window.location.href
    });
  }, [user, isAdmin, isLoading, timeoutExceeded]);
  
  // Apenas redirecionar quando estamos na raiz exata "/"
  if (window.location.pathname !== "/") {
    console.log("RootRedirect: Não estamos na raiz, permitindo navegação normal");
    return null;
  }
  
  // Show loading screen during check
  if (isLoading && !timeoutExceeded) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }
  
  // Se não houver usuário, redirecionar para login
  if (!user) {
    console.log("RootRedirect: Não há usuário autenticado, redirecionando para login");
    return <Navigate to="/login" replace />;
  }
  
  // Se for admin e estiver na raiz, redirecionar para área admin
  if (isAdmin) {
    console.log("RootRedirect: Usuário é admin e está na raiz, redirecionando para /admin");
    return <Navigate to="/admin" replace />;
  }
  
  // Para usuários normais na raiz, redirecionar para o dashboard
  console.log("RootRedirect: Usuário normal na raiz, redirecionando para /dashboard");
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
