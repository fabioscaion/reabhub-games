"use client";

import { useState, useEffect } from "react";
import { GameConfig, GameType, Level } from "@/types/game";
import { createGameAction, updateGameAction } from "@/actions/game-actions";
import { Save, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import GameMetadataForm from "./GameMetadataForm";
import LevelManager from "./LevelManager";
import LevelEditorModal from "./LevelEditorModal";
import { generateId } from "@/lib/utils";
import FeedbackModal from "@/components/ui/FeedbackModal";

interface GameFormProps {
  initialData?: GameConfig;
}

export default function GameForm({ initialData }: GameFormProps) {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; title: string; message: string } | null>(null);
  const [game, setGame] = useState<GameConfig>(initialData || {
    id: generateId(),
    name: "Novo Jogo",
    description: "Descrição do novo jogo",
    type: "naming",
    category: "Linguagem Expressiva",
    coverImage: "",
    status: "draft",
    levels: [],
    isPublic: false
  });

  // Effect to create game immediately if it's a new game
  useEffect(() => {
    if (!initialData) {
      const createInitialGame = async () => {
        try {
          console.log("CREATING INITIAL GAME:", game.id);
          await createGameAction(game, false); // false to avoid redirect
          console.log("INITIAL GAME CREATED SUCCESSFULLY");
        } catch (error: any) {
          console.error("ERRO DETALHADO AO CRIAR JOGO INICIAL:", error);
          if (error.message?.includes("User with ID") || error.message?.includes("Não autorizado")) {
            setFeedback({
              type: "error",
              title: "Sessão Inválida",
              message: "Sua sessão parece estar inválida ou o usuário não existe no banco de dados. Por favor, faça logout e login novamente no ReabHub."
            });
          }
        }
      };
      createInitialGame();
    }
  }, []); // Only once on mount

  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);

  const handleSave = async (gameData = game, showSnackbar = true) => {
    if (gameData.levels.length === 0) {
      if (showSnackbar) {
        setSnackbar({
          show: true,
          message: "Adicione pelo menos um nível ao jogo antes de salvar.",
          type: "info"
        });
        setTimeout(() => setSnackbar(prev => ({ ...prev, show: false })), 4000);
      }
      return;
    }
    
    setLoading(true);
    setSaveSuccess(false);
    try {
      if (initialData) {
        await updateGameAction(gameData);
      } else {
        await createGameAction(gameData);
      }
      
      setSaveSuccess(true);
      if (showSnackbar) {
        setSnackbar({
          show: true,
          message: "Jogo salvo com sucesso!",
          type: "success"
        });
      }
      
      // Reset states
      setTimeout(() => {
        setSaveSuccess(false);
        if (showSnackbar) {
          setSnackbar(prev => ({ ...prev, show: false }));
        }
      }, 3000);
      
    } catch (error) {
      console.error(error);
      if (showSnackbar) {
        setSnackbar({
          show: true,
          message: "Erro ao salvar as alterações do jogo.",
          type: "error"
        });
        setTimeout(() => setSnackbar(prev => ({ ...prev, show: false })), 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  const addLevel = (type: 'game' | 'info' | 'menu' = 'game') => {
    const newLevel: Level = {
      id: generateId(),
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
      id: generateId(),
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
          onSaveGame={async (updatedLevel) => {
            const newLevels = [...game.levels];
            newLevels[editingLevelIndex] = updatedLevel;
            const updatedGame = { ...game, levels: newLevels };
            setGame(updatedGame);
            await handleSave(updatedGame, false); // false para não mostrar o snackbar do jogo
          }}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-4 z-50">
        <Link href="/" className="px-4 py-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all ${
            saveSuccess 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" 
              : "bg-green-600 text-white hover:bg-green-700 active:scale-95"
          } disabled:opacity-50`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 size={18} /> Salvo!
            </>
          ) : (
            <>
              <Save size={18} /> Salvar Jogo
            </>
          )}
        </button>
      </div>

      {/* Snackbar / Toast Notification */}
      <AnimatePresence>
        {snackbar.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border ${
              snackbar.type === 'success' 
                ? 'bg-white dark:bg-zinc-900 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400' 
                : snackbar.type === 'info'
                ? 'bg-white dark:bg-zinc-900 border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-white dark:bg-zinc-900 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {snackbar.type === 'success' ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : snackbar.type === 'info' ? (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">i</div>
              ) : (
                <X size={20} className="text-red-500" />
              )}
              <span className="font-medium">{snackbar.message}</span>
              <button 
                type="button"
                onClick={() => setSnackbar(prev => ({ ...prev, show: false }))}
                className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={14} className="text-gray-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal (Still used for critical errors like Session Expired) */}
      {feedback && (
        <FeedbackModal
          isOpen={!!feedback}
          onClose={() => setFeedback(null)}
          type={feedback.type}
          title={feedback.title}
          message={feedback.message}
        />
      )}
    </form>
  );
}
