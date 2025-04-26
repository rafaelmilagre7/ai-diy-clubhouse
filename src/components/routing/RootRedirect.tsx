
import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

const RootRedirect = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Adicionar um debug log para ajudar a entender o estado
  console.log("RootRedirect state:", { user, profile, isAdmin, isLoading });
  
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
  
  // Renderizar conteúdo vazio ou mínimo enquanto redirecionamento acontece
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Redirecionando...</h2>
        <p className="text-gray-500">Você será redirecionado automaticamente</p>
      </div>
    </div>
  );
};

export default RootRedirect;
