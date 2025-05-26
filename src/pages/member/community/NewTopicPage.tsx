
import React from 'react';
import { NewTopicForm } from '@/components/community/NewTopicForm';
import { useParams } from 'react-router-dom';

const NewTopicPage = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <NewTopicForm categorySlug={categorySlug} />
    </div>
  );
};

export default NewTopicPage;
