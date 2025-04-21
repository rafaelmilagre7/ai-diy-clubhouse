
import React from 'react';
import { AchievementsPage } from '@/components/achievements/AchievementsPage';
import { useDocumentTitle } from '@/hooks/use-document-title';

const Achievements = () => {
  useDocumentTitle('Conquistas | VIVER DE IA Club');
  
  return <AchievementsPage />;
};

export default Achievements;
