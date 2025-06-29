
import React from "react";
import { Award, Trophy, Star, TrendingUp } from "lucide-react";
import { useCertificates } from "@/hooks/learning/useCertificates";
import { useSolutionCertificates } from "@/hooks/learning/useSolutionCertificates";

export const CertificatesHeader = () => {
  const { certificates: courseCertificates } = useCertificates();
  const { certificates: solutionCertificates } = useSolutionCertificates();
  
  const totalCertificates = courseCertificates.length + solutionCertificates.length;
  const courseCertificatesCount = courseCertificates.length;
  const solutionCertificatesCount = solutionCertificates.length;
  
  const stats = [
    {
      icon: Award,
      label: "Total",
      value: totalCertificates,
      color: "text-viverblue"
    },
    {
      icon: Trophy,
      label: "Soluções",
      value: solutionCertificatesCount,
      color: "text-green-400"
    },
    {
      icon: Star,
      label: "Cursos",
      value: courseCertificatesCount,
      color: "text-yellow-400"
    }
  ];
  
  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-viverblue/20 rounded-full p-4">
            <Award className="h-12 w-12 text-viverblue" />
          </div>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Meus Certificados
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Conquiste o reconhecimento pelo seu desenvolvimento profissional. 
            Cada certificado representa uma nova competência adquirida.
          </p>
        </div>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[#151823]/80 backdrop-blur-sm border border-neutral-700/50 rounded-xl p-6 text-center hover:border-neutral-600/70 transition-all duration-300"
          >
            <div className="flex justify-center mb-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stat.value}
            </div>
            <div className="text-gray-400 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Motivational Message */}
      {totalCertificates > 0 && (
        <div className="bg-gradient-to-r from-viverblue/10 to-green-500/10 border border-viverblue/20 rounded-xl p-6 text-center">
          <TrendingUp className="h-6 w-6 text-viverblue mx-auto mb-2" />
          <p className="text-viverblue font-medium">
            Parabéns! Você já conquistou {totalCertificates} certificado{totalCertificates > 1 ? 's' : ''}. 
            Continue evoluindo suas competências!
          </p>
        </div>
      )}
    </div>
  );
};
