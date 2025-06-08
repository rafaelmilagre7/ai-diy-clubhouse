
import React from 'react';
import { SolutionsHeader } from '@/components/admin/solutions/SolutionsHeader';
import { SolutionsTable } from '@/components/admin/solutions/SolutionsTable';
import { Container } from '@/components/ui/container';

const SolutionsList = () => {
  return (
    <Container className="py-6">
      <div className="space-y-6">
        <SolutionsHeader />
        <SolutionsTable />
      </div>
    </Container>
  );
};

export default SolutionsList;
