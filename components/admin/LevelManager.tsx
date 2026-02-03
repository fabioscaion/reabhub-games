"use client";

import { Level } from "@/types/game";
import { Plus, Gamepad2, Info, LayoutGrid } from "lucide-react";
import { useState } from "react";
import LevelItem from "./LevelItem";

interface LevelManagerProps {
  levels: Level[];
  onAddLevel: (type: 'game' | 'info' | 'menu') => void;
  onRemoveLevel: (index: number) => void;
  onDuplicateLevel: (index: number) => void;
  onEditLevel: (index: number) => void;
  onUpdateLevel: (index: number, updates: Partial<Level>) => void;
}

export default function LevelManager({ 
  levels, 
  onAddLevel, 
  onRemoveLevel, 
  onDuplicateLevel, 
  onEditLevel,
  onUpdateLevel
}: LevelManagerProps) {
  const [isAddLevelMenuOpen, setIsAddLevelMenuOpen] = useState(false);

  return (
    <div className="lg:col-span-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Estrutura do Jogo</h2>
          <p className="text-sm text-gray-500">Gerencie os níveis e a progressão</p>
        </div>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAddLevelMenuOpen(!isAddLevelMenuOpen)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 font-medium"
          >
            <Plus size={20} /> 
            <span>Adicionar Nível</span>
          </button>
          
          {isAddLevelMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsAddLevelMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right ring-1 ring-black/5">
                <div className="p-3 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Selecione o tipo de nível</span>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => { onAddLevel('game'); setIsAddLevelMenuOpen(false); }}
                    className="flex items-start gap-3 w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors group"
                  >
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                      <Gamepad2 size={20} />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Nível de Jogo</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Atividade interativa padrão</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onAddLevel('info'); setIsAddLevelMenuOpen(false); }}
                    className="flex items-start gap-3 w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors group"
                  >
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                      <Info size={20} />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Tela de Transição</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Instruções ou narrativa</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onAddLevel('menu'); setIsAddLevelMenuOpen(false); }}
                    className="flex items-start gap-3 w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors group"
                  >
                    <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                      <LayoutGrid size={20} />
                    </div>
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">Menu de Navegação</span>
                      <span className="block text-xs text-gray-500 mt-0.5">Hub para seleção de fases</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {levels.map((level, index) => (
          <LevelItem 
            key={level.id}
            level={level}
            index={index}
            onEdit={onEditLevel}
            onDuplicate={onDuplicateLevel}
            onRemove={onRemoveLevel}
            onUpdateName={(idx, name) => onUpdateLevel(idx, { name })}
          />
        ))}

        {levels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 text-gray-300">
               <Plus size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Comece seu jogo</h3>
            <p className="text-gray-500 max-w-md mb-8">
              Seu jogo ainda não tem níveis. Adicione o primeiro nível para começar a criar a experiência.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
