
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SuggestionHeader from '../SuggestionHeader';

const SuggestionErrorState = () => {
  return (
    <div className="container py-6">
      <SuggestionHeader />
      <Card>
        <CardHeader>
          <CardTitle>Sugestão não encontrada</CardTitle>
          <CardDescription>
            A sugestão que você está procurando não existe ou foi removida.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SuggestionErrorState;
