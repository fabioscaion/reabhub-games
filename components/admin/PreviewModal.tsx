import React from 'react';
import { X } from "lucide-react";
import GameRunner from "@/components/game-engine/GameRunner";
import { Level, GameType, GameConfig } from "@/types/game";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level;
  gameType: GameType;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, level, gameType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex-1 overflow-auto p-4">
          <GameRunner 
            config={{
              id: "preview",
              name: "Previsualização",
              type: gameType,
              category: "Preview",
              levels: [level]
            } as GameConfig} 
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
