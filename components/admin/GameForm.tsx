"use client";

import { useState } from "react";
import { GameConfig, GameType, Level } from "@/types/game";
import { createGameAction, updateGameAction } from "@/actions/game-actions";
import { Save } from "lucide-react";
import Link from "next/link";
import GameMetadataForm from "./GameMetadataForm";
import LevelManager from "./LevelManager";
import LevelEditorModal from "./LevelEditorModal";
import { toBase64, handleFileUpload } from "@/lib/utils";

interface GameFormProps {
  initialData?: GameConfig;
}

export default function GameForm({ initialData }: GameFormProps) {
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<GameConfig>(initialData || {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
    name: "",
    description: "",
    type: "naming",
    category: "Linguagem Expressiva",
    coverImage: "",
    levels: [],
    isPublic: false
  });

  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (game.levels.length === 0) {
      alert("Adicione pelo menos um nível ao jogo.");
      return;
    }
    
    setLoading(true);
    try {
      if (initialData) {
        await updateGameAction(game);
      } else {
        await createGameAction(game);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar jogo");
    } finally {
      setLoading(false);
    }
  };

  const addLevel = (type: 'game' | 'info' | 'menu' = 'game') => {
    const newLevel: Level = {
      id: crypto.randomUUID(),
      options: [],
      type: type
    };
    setGame({ ...game, levels: [...game.levels, newLevel] });
  };

  const removeLevel = (index: number) => {
    const newLevels = [...game.levels];
    newLevels.splice(index, 1);
    setGame({ ...game, levels: newLevels });
  };

  const duplicateLevel = (index: number) => {
    const levelToDuplicate = game.levels[index];
    const newLevel: Level = {
      ...JSON.parse(JSON.stringify(levelToDuplicate)),
      id: crypto.randomUUID(),
    };
    
    const newLevels = [...game.levels];
    newLevels.splice(index + 1, 0, newLevel);
    setGame({ ...game, levels: newLevels });
  };

  const handleLevelUpdate = (index: number, updatedLevel: Level) => {
    const newLevels = [...game.levels];
    newLevels[index] = updatedLevel;
    setGame({ ...game, levels: newLevels });
  };

  const handleLevelPartialUpdate = (index: number, updates: Partial<Level>) => {
    const newLevels = [...game.levels];
    newLevels[index] = { ...newLevels[index], ...updates };
    setGame({ ...game, levels: newLevels });
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col bg-gray-50/50 dark:bg-black/5">
      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <GameMetadataForm 
            game={game} 
            setGame={setGame} 
            handleFileUpload={handleFileUpload} 
          />

          <LevelManager 
            levels={game.levels}
            onAddLevel={addLevel}
            onRemoveLevel={removeLevel}
            onDuplicateLevel={duplicateLevel}
            onEditLevel={(index) => setEditingLevelIndex(index)}
            onUpdateLevel={handleLevelPartialUpdate}
          />
        </div>
      </div>

      {/* Full Screen Level Editor Modal */}
      {editingLevelIndex !== null && (
        <LevelEditorModal 
          level={game.levels[editingLevelIndex]}
          index={editingLevelIndex}
          gameType={game.type}
          allLevels={game.levels}
          onClose={() => setEditingLevelIndex(null)}
          onUpdate={(updated) => handleLevelUpdate(editingLevelIndex, updated)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-4 z-50">
        <Link href="/" className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          {loading ? "Salvando..." : (
            <>
              <Save size={18} /> Salvar Jogo
            </>
          )}
        </button>
      </div>
    </form>
  );
}
