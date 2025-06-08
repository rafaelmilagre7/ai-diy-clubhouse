
import { Button } from "@/components/ui/button";

interface TestLoginButtonsProps {
  onMemberLogin: () => void;
  onAdminLogin: () => void;
  onTestMemberLogin: () => void;
  onTestFormacaoLogin: () => void;
  onClubTestLogin: () => void;
  isLoading: boolean;
}

const TestLoginButtons = ({ 
  onMemberLogin, 
  onAdminLogin, 
  onTestMemberLogin,
  onTestFormacaoLogin,
  onClubTestLogin,
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

        <Button
          type="button"
          variant="outline"
          onClick={onTestMemberLogin}
          className="bg-green-600/30 border-green-800 hover:bg-green-700/50 text-white text-xs"
          disabled={isLoading}
        >
          Membro Club
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onTestFormacaoLogin}
          className="bg-orange-600/30 border-orange-800 hover:bg-orange-700/50 text-white text-xs"
          disabled={isLoading}
        >
          Formação
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onClubTestLogin}
          className="bg-teal-600/30 border-teal-800 hover:bg-teal-700/50 text-white text-xs col-span-2"
          disabled={isLoading}
        >
          🎯 Club Teste (Onboarding)
        </Button>
      </div>
    </div>
  );
};

export default TestLoginButtons;
