import React from "react";
import { Timer } from "lucide-react";

interface GameHeaderProps {
  name: string;
  elapsedTime: number;
  currentLevelIndex: number;
  totalLevels: number;
  progress: number;
  formatTime: (seconds: number) => string;
}

const GameHeader = ({ 
  name, 
  elapsedTime, 
  currentLevelIndex, 
  totalLevels, 
  progress, 
  formatTime 
}: GameHeaderProps) => {
  return (
    <div className="mb-8 shrink-0">
      <div className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200">{name}</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <Timer size={16} className="text-gray-500" />
            <span className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
        <span className="text-sm font-mono text-gray-500">
          Nível {currentLevelIndex + 1}/{totalLevels}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default GameHeader;
