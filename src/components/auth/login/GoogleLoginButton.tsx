
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const GoogleLoginButton = ({ onClick, isLoading }: GoogleLoginButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        disabled={isLoading}
        className="w-full h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white font-medium hover:bg-white/20 hover:border-white/30 focus:bg-white/20 focus:border-viverblue focus:ring-2 focus:ring-viverblue/20 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="absolute left-0 inset-y-0 flex items-center pl-4">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FcGoogle className="h-5 w-5" />
          )}
        </span>
        <span className="ml-2">
          {isLoading ? "Carregando..." : "Entrar com Google"}
        </span>
      </Button>
    </motion.div>
  );
};

export default GoogleLoginButton;
