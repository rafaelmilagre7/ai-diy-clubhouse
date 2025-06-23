
import React from "react";
import { CertificatesList } from "@/components/learning/certificates/CertificatesList";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, Target } from "lucide-react";

const MemberCertificates = () => {
  const { user, profile } = useAuth();
  
  console.log('[MemberCertificates] Renderizando página de certificados', {
    userId: user?.id,
    profileName: profile?.name
  });
  
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você precisa estar logado para ver seus certificados.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-6">
        {/* Header da página */}
        <div>
          <h1 className="text-3xl font-bold text-white">Meus Certificados</h1>
          <p className="text-gray-300 mt-1">
            Aqui você encontra todos os certificados obtidos em seus cursos e implementações de soluções.
          </p>
        </div>
        
        {/* Cards informativos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#151823] border-neutral-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Certificados de Cursos
              </CardTitle>
              <BookOpen className="h-4 w-4 ml-auto text-viverblue" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400">
                Complete todos os módulos de um curso para receber seu certificado
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#151823] border-neutral-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Certificados de Implementação
              </CardTitle>
              <Target className="h-4 w-4 ml-auto text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400">
                Implemente soluções com sucesso para gerar certificados de implementação
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#151823] border-neutral-700">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">
                Validação Online
              </CardTitle>
              <Award className="h-4 w-4 ml-auto text-yellow-500" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400">
                Todos os certificados podem ser validados online através do código único
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Lista de certificados */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Seus Certificados</h2>
          <CertificatesList />
        </div>
      </div>
    </div>
  );
};

export default MemberCertificates;
