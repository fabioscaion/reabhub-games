"use client";

import { Level } from "@/types/game";
import { ArrowLeft, Save } from "lucide-react";
import GameCanvas from "./GameCanvas";

interface LevelEditorModalProps {
  level: Level;
  index: number;
  gameType: string;
  allLevels: Level[];
  onClose: () => void;
  onUpdate: (updated: Level) => void;
  onSaveGame?: (updatedLevel: Level) => Promise<void>;
}

export default function LevelEditorModal({ 
  level, 
  index, 
  gameType, 
  allLevels, 
  onClose, 
  onUpdate,
  onSaveGame
}: LevelEditorModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-200">
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-black/20">
        <div className="h-full bg-white dark:bg-zinc-900 p-2">
          <GameCanvas 
            level={level} 
            onChange={onUpdate} 
            onSaveGame={onSaveGame}
            gameType={gameType as any}
            allLevels={allLevels}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}
