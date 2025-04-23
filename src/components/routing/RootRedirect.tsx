
import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

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
  
  // Show loading screen during check
  if (isLoading && !timeoutExceeded) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }
  
  // Se não houver usuário, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se for admin, redirecionar para área admin
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  // Para usuários autenticados, redirecionar para o dashboard
  return <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
