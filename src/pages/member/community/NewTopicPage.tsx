
import React from 'react';
import { NewTopicForm } from '@/components/community/NewTopicForm';

const NewTopicPage = () => {
  console.log('NewTopicPage carregando...');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NewTopicForm />
    </div>
  );
};

export default NewTopicPage;
