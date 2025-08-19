
import React from "react";
import { Award, Trophy, GraduationCap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useUnifiedCertificates } from "@/hooks/learning/useUnifiedCertificates";

export const CertificatesHeader = () => {
  const { certificates } = useUnifiedCertificates();
  
  const totalCertificates = certificates.length;
  const courseCertificates = certificates.filter(cert => cert.type === 'course').length;
  const solutionCertificates = certificates.filter(cert => cert.type === 'solution').length;
  
  const stats = [
    {
      icon: Trophy,
      label: "Soluções Concluídas",
      value: solutionCertificates,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20"
    },
    {
      icon: GraduationCap,
      label: "Cursos Concluídos",
      value: courseCertificates,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20"
    }
  ];
  
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full p-6 backdrop-blur-sm border border-primary/20">
              <Award className="h-16 w-16 text-primary" />
            </div>
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent"
          >
            Meus Certificados
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
          >
            Seu portfólio de conquistas e competências. Cada certificado representa uma jornada de aprendizado e crescimento profissional.
          </motion.p>
        </div>
      </motion.div>
      
      {/* Estatísticas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`
              relative overflow-hidden rounded-2xl p-6 text-center
              bg-card/80 backdrop-blur-sm border ${stat.borderColor}
              hover:shadow-lg transition-all duration-300
              hover:shadow-current/10
            `}
          >
            <div className={`absolute inset-0 ${stat.bgColor} opacity-50`}></div>
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className={`${stat.bgColor} rounded-full p-3 ${stat.borderColor} border`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className={`text-4xl font-bold ${stat.color} mb-2`}
              >
                {stat.value}
              </motion.div>
              <div className="text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Mensagem motivacional */}
      {totalCertificates > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="relative overflow-hidden rounded-xl p-6 text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
          <div className="relative z-10 flex items-center justify-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <p className="text-lg font-medium text-foreground">
              🎉 Parabéns! Você já conquistou{' '}
              <span className="text-primary font-bold">{totalCertificates}</span>{' '}
              certificado{totalCertificates > 1 ? 's' : ''}. Continue sua jornada de excelência!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
