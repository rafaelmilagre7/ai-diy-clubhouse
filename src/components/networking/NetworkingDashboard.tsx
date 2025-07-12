import { MatchesGrid } from './MatchesGrid';
import { ConnectionsGrid } from './ConnectionsGrid';
import { GoalsGrid } from './GoalsGrid';

interface NetworkingDashboardProps {
  activeTab: 'matches' | 'connections' | 'goals';
}

export const NetworkingDashboard = ({ activeTab }: NetworkingDashboardProps) => {
  return (
    <div className="min-h-[400px]">
      {activeTab === 'matches' && <MatchesGrid />}
      {activeTab === 'connections' && <ConnectionsGrid />}
      {activeTab === 'goals' && <GoalsGrid />}
    </div>
  );
};