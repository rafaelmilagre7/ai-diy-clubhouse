import { MatchesGrid } from './MatchesGrid';
import { ConnectionsGrid } from './ConnectionsGrid';

interface NetworkingDashboardProps {
  activeTab: 'matches' | 'connections';
}

export const NetworkingDashboard = ({ activeTab }: NetworkingDashboardProps) => {
  return (
    <div className="min-h-[400px]">
      {activeTab === 'matches' && <MatchesGrid />}
      {activeTab === 'connections' && <ConnectionsGrid />}
    </div>
  );
};