
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/use-document-title';

const Achievements = () => {
  useDocumentTitle('VIVER DE IA');
  const navigate = useNavigate();
  
  // Redirecionar para o dashboard quando alguém tentar acessar esta página diretamente
  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  return null; // Não renderizamos nada já que redirecionamos
};

export default Achievements;
