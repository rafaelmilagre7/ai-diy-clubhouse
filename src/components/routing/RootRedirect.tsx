
import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Adicionar um debug log para ajudar a entender o estado
  console.log("RootRedirect state:", { user, profile, isAdmin, isLoading, timeoutExceeded });
  
  // Handle timing out the loading state
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isLoading && !timeoutExceeded) {
      timeoutRef.current = window.setTimeout(() => {
        console.log("RootRedirect: Loading timeout exceeded, redirecting to /login");
        setTimeoutExceeded(true);
        toast("Tempo de carregamento excedido, redirecionando para tela de login");
        navigate('/login', { replace: true });
      }, 3000); // 3 segundos de timeout
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, navigate, timeoutExceeded]);
  
  // Handle redirection based on user state
  useEffect(() => {
    if (!isLoading) {
      console.log("RootRedirect: Not loading anymore, checking user state");
      
      if (!user) {
        console.log("RootRedirect: No user, redirecting to /login");
        navigate('/login', { replace: true });
        return;
      }
      
      if (user && profile) {
        console.log("RootRedirect: User and profile available, redirecting based on role");
        if (profile.role === 'admin' || isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, profile, isAdmin, navigate, isLoading]);
  
  // Show loading screen during check
  if (isLoading && !timeoutExceeded) {
    return <LoadingScreen message="Preparando sua experiência..." />;
  }
  
  // Fallback redirect
  return !user ? <Navigate to="/login" replace /> : <Navigate to="/dashboard" replace />;
};

export default RootRedirect;
