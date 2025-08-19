
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
      color: "text-white",
      bgColor: "bg-white/20",
      borderColor: "border-white/30",
      highlight: "from-aurora to-primary"
    },
    {
      icon: GraduationCap,
      label: "Cursos Concluídos", 
      value: courseCertificates,
      color: "text-white",
      bgColor: "bg-white/20",
      borderColor: "border-white/30",
      highlight: "from-viverblue to-aurora"
    }
  ];
  
  return (
    <div className="space-y-12">
      {/* Hero Title Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-8"
      >
        <div className="flex justify-center">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 border border-white/30 shadow-2xl">
              <Award className="h-20 w-20 text-white drop-shadow-lg" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-aurora/30 to-primary/30 rounded-full animate-pulse -z-10"></div>
          </motion.div>
        </div>
        
        <div className="space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl leading-tight"
          >
            Meus Certificados
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-lg"
          >
            🏆 Seu portfólio de conquistas e competências em IA
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}  
            className="text-lg text-white/80 max-w-3xl mx-auto"
          >
            Cada certificado representa uma jornada de aprendizado e crescimento profissional no universo da Inteligência Artificial
          </motion.div>
        </div>
      </motion.div>
      
      {/* Estatísticas Destacadas */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
            whileHover={{ scale: 1.05, y: -8 }}
            className="group relative certificate-stat-card"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.highlight} opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity duration-500`}></div>
            
            {/* Card Content */}
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-white/10 transition-all duration-500 hover:border-white/40">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white/20 rounded-2xl p-4 group-hover:bg-white/30 transition-colors duration-300">
                    <stat.icon className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                </div>
                
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.2 }}
                  className="text-6xl font-black text-white mb-3 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-white/90 font-bold text-xl tracking-wide drop-shadow">
                  {stat.label}
                </div>
                
                {stat.value > 0 && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1.6 + index * 0.2 }}
                    className="h-1 bg-gradient-to-r from-white/40 to-white/80 rounded-full mx-auto"
                  />
                )}
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
