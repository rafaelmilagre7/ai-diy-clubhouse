import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProfileSync } from '@/hooks/auth/useProfileSync';
import { Eye } from 'lucide-react';

export const OnboardingDataViewer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getOnboardingData } = useProfileSync();

  const handleShowData = async () => {
    setLoading(true);
    const onboardingData = await getOnboardingData();
    setData(onboardingData);
    setLoading(false);
  };

  return (
    <Card className="p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4" />
        <h3 className="font-semibold">Debug: Dados do Onboarding</h3>
      </div>
      
      <Button onClick={handleShowData} disabled={loading} className="mb-4">
        {loading ? 'Carregando...' : 'Ver meus dados do Step 1'}
      </Button>

      {data && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-sm mb-2">Dados Pessoais (Step 1):</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {JSON.stringify(data.personal_info, null, 2)}
            </pre>
          </div>
          
          {data.business_info && (
            <div>
              <h4 className="font-medium text-sm mb-2">Dados Empresariais (Step 2):</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                {JSON.stringify(data.business_info, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};