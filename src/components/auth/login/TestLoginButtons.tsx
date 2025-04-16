
import { Button } from "@/components/ui/button";

interface TestLoginButtonsProps {
  onMemberLogin: () => void;
  onAdminLogin: () => void;
  isLoading: boolean;
}

const TestLoginButtons = ({ 
  onMemberLogin, 
  onAdminLogin, 
  isLoading 
}: TestLoginButtonsProps) => {
  return (
    <div className="pt-4 space-y-2">
      <p className="text-center text-gray-500 text-sm mb-2">Acesso de teste</p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onMemberLogin}
          className="bg-blue-600/30 border-blue-800 hover:bg-blue-700/50 text-white text-xs"
          disabled={isLoading}
        >
          Login Membro (Teste)
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onAdminLogin}
          className="bg-purple-600/30 border-purple-800 hover:bg-purple-700/50 text-white text-xs"
          disabled={isLoading}
        >
          Login Admin (Teste)
        </Button>
      </div>
    </div>
  );
};

export default TestLoginButtons;
