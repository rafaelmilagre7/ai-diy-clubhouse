
import React from 'react';
import { AchievementsPage } from '@/components/achievements/AchievementsPage';
import { useDocumentTitle } from '@/hooks/use-document-title';

const Achievements = () => {
  useDocumentTitle('Conquistas | VIVER DE IA Club');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <AchievementsPage />
    </div>
  );
};

export default Achievements;
