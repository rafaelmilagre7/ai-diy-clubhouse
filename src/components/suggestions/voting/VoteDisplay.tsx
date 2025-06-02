
import React from 'react';

interface VoteDisplayProps {
  voteBalance: number;
}

const VoteDisplay = ({ voteBalance }: VoteDisplayProps) => {
  return (
    <div className="ml-3 px-3 py-1 rounded-full bg-gray-100 flex items-center justify-center min-w-[3rem]">
      <span className={`text-lg font-semibold ${voteBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {voteBalance > 0 ? `+${voteBalance}` : voteBalance}
      </span>
    </div>
  );
};

export default VoteDisplay;
