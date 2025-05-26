
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

interface GoogleLoginButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const GoogleLoginButton = ({ onClick, isLoading }: GoogleLoginButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={isLoading}
      className="w-full"
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      Entrar com Google
    </Button>
  );
};

export default GoogleLoginButton;
