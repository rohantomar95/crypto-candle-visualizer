
import React from 'react';

interface RoundIndicatorProps {
  totalRounds: number;
  currentRound: number;
}

const RoundIndicator: React.FC<RoundIndicatorProps> = ({ totalRounds, currentRound }) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: totalRounds }).map((_, index) => (
        <div 
          key={index}
          className={`w-8 h-2 rounded-full ${
            index + 1 === currentRound 
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500' 
              : index + 1 < currentRound 
                ? 'bg-gray-500' 
                : 'bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
};

export default RoundIndicator;
