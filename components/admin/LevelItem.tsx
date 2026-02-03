"use client";

import { useState, useEffect } from "react";
import { Level } from "@/types/game";
import { Edit, CopyPlus, Trash2, LayoutGrid, Info, Gamepad2, Pencil } from "lucide-react";

interface LevelItemProps {
  level: Level;
  index: number;
  onEdit: (index: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onUpdateName?: (index: number, name: string) => void;
}

export default function LevelItem({ level, index, onEdit, onDuplicate, onRemove, onUpdateName }: LevelItemProps) {
  const isMenu = level.type === 'menu';
  const isInfo = level.type === 'info';
  const icon = isMenu ? <LayoutGrid size={20} /> : isInfo ? <Info size={20} /> : <Gamepad2 size={20} />;
  
  const defaultName = isMenu ? 'Menu de Navegação' : isInfo ? 'Tela de Informação' : `Nível ${index + 1}`;
  const [localName, setLocalName] = useState(level.name || defaultName);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setLocalName(level.name || defaultName);
  }, [level.name, defaultName]);

  const colorClass = isMenu 
     ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
     : isInfo 
     ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
     : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
  const borderColor = isMenu
     ? "hover:border-orange-500/50"
     : isInfo
     ? "hover:border-purple-500/50"
     : "hover:border-blue-500/50";
     
  return (
    <div 
      className={`group relative flex items-center p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md ${borderColor}`}
    >
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold text-6xl opacity-10 select-none">
        {index + 1}
      </div>

      <div className="flex items-center gap-5 w-full pl-4 relative z-10">
        <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center shadow-sm shrink-0`}>
           {icon}
        </div>
        
        <div className="flex-1 min-w-0 py-1">
          <div className="flex flex-col mb-1">
            <span className={`w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mb-1 ${
              isMenu ? 'bg-orange-50 text-orange-600 border-orange-200 dark:border-orange-900/30' :
              isInfo ? 'bg-purple-50 text-purple-600 border-purple-200 dark:border-purple-900/30' :
              'bg-blue-50 text-blue-600 border-blue-200 dark:border-blue-900/30'
            }`}>
              {isMenu ? 'Menu' : isInfo ? 'Info' : 'Game'}
            </span>
            <div 
              className="relative group/input"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <input
                type="text"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                onBlur={() => onUpdateName?.(index, localName)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="font-semibold text-gray-900 dark:text-gray-100 truncate bg-transparent border-none focus:ring-2 focus:ring-blue-500/20 rounded px-1 -ml-1 w-full focus:outline-none transition-all pr-8"
                placeholder={defaultName}
              />
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-opacity duration-200 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <Pencil size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(index)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-gray-200 dark:border-zinc-700"
            title="Editar Conteúdo"
          >
            <Edit size={16} /> <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Duplicar Nível"
          >
            <CopyPlus size={18} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Remover Nível"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
