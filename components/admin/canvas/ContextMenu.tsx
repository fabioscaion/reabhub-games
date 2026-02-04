import React, { useLayoutEffect, useRef, useState } from 'react';
import { CopyPlus, Trash2, Layers, ArrowUp, ArrowDown, ChevronUp, ChevronDown, Copy, Scissors, ClipboardPaste } from "lucide-react";
import { DragItem } from "@/types/game";

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  selectedItem: DragItem | null;
  onDuplicate: () => void;
  onDelete: (item: DragItem) => void;
  onLayerChange: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  hasClipboard?: boolean;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  x,
  y,
  selectedItem,
  onDuplicate,
  onDelete,
  onLayerChange,
  onCopy,
  onCut,
  onPaste,
  hasClipboard,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  useLayoutEffect(() => {
    if (visible && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newLeft = x;
      let newTop = y;

      // Se o menu ultrapassar a largura da tela à direita
      if (x + menuRect.width > viewportWidth) {
        newLeft = x - menuRect.width;
      }

      // Se o menu ultrapassar a altura da tela na parte inferior
      if (y + menuRect.height > viewportHeight) {
        newTop = y - menuRect.height;
      }

      // Garante que não ultrapasse o topo ou a esquerda (mínimo 10px de margem)
      newLeft = Math.max(10, newLeft);
      newTop = Math.max(10, newTop);

      setPosition({ top: newTop, left: newLeft });
    }
  }, [visible, x, y]);

  if (!visible) return null;

  return (
    <div 
      ref={menuRef}
      className="fixed bg-white dark:bg-zinc-800 shadow-xl rounded-lg border border-gray-200 dark:border-zinc-700 py-1 z-[100] min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
      style={{ top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      {selectedItem && (
        <>
          {/* Ações de Edição */}
          <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Edição</div>
          <button 
            type="button"
            onClick={() => { onCopy?.(); onClose(); }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            <Copy size={16} /> Copiar
          </button>
          <button 
            type="button"
            onClick={() => { onCut?.(); onClose(); }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            <Scissors size={16} /> Recortar
          </button>
          <button 
            type="button"
            onClick={() => { onDuplicate(); onClose(); }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            <CopyPlus size={16} /> Duplicar
          </button>

          <div className="h-px bg-gray-100 dark:bg-zinc-700 my-1" />

          {/* Ações de Camadas */}
          <div className="px-2 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Organizar</div>
          <button 
            type="button"
            onClick={() => { onLayerChange('front'); onClose(); }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            <ArrowUp size={16} /> Trazer para Frente
          </button>
          <button 
            type="button"
            onClick={() => { onLayerChange('forward'); onClose(); }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            <ChevronUp size={16} /> Avançar
          </button>
          <button 
            type="button"
            onClick={() => { onLayerChange('backward'); onClose(); }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            <ChevronDown size={16} /> Recuar
          </button>
          <button 
            type="button"
            onClick={() => { onLayerChange('back'); onClose(); }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors"
          >
            <ArrowDown size={16} /> Enviar para Trás
          </button>

          <div className="h-px bg-gray-100 dark:bg-zinc-700 my-1" />
        </>
      )}

      {/* Colar sempre disponível se houver algo no clipboard */}
      <button 
        type="button"
        onClick={() => { onPaste?.(); onClose(); }} 
        disabled={!hasClipboard}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ClipboardPaste size={16} /> Colar
      </button>

      {selectedItem && (
        <>
          <div className="h-px bg-gray-100 dark:bg-zinc-700 my-1" />
          <button 
            type="button"
            onClick={() => {
              if (selectedItem) onDelete(selectedItem);
              onClose();
            }} 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 text-red-600 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} /> Excluir
          </button>
        </>
      )}
    </div>
  );
};

export default ContextMenu;
