import React, { useState } from 'react';
import { Level, Option, Asset, DragItem } from "@/types/game";
import { List, MousePointerClick, GripVertical, Tag } from "lucide-react";
import PropertiesPanel from "./PropertiesPanel";

interface SidebarProps {
  activeTab: 'properties' | 'layers';
  setActiveTab: (tab: 'properties' | 'layers') => void;
  selectedItem: DragItem | null;
  level: Level;
  allLevels: Level[];
  editingView: 'level' | 'success' | 'error';
  updateOption: (id: string, updates: Partial<Option>) => void;
  updateStaticElement: (id: string, updates: Partial<Asset & { position?: { x: number; y: number } }>) => void;
  onOpenMediaLibrary: (type: 'image' | 'audio', callback: (url: string) => void) => void;
  onShowLogicEditor: (show: boolean, focusId?: string) => void;
  onLayerChange: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  getActiveStaticElements: () => any[];
  fontFamilies: { name: string; value: string }[];
  getAllLayers: () => any[];
  handleReorderLayers: (from: number, to: number) => void;
  handleRenameLayer: (id: string, type: 'option' | 'static', newName: string) => void;
  onSetSelectedItem: (item: DragItem | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedItem,
  level,
  allLevels,
  editingView,
  updateOption,
  updateStaticElement,
  onOpenMediaLibrary,
  onShowLogicEditor,
  onLayerChange,
  getActiveStaticElements,
  fontFamilies,
  getAllLayers,
  handleReorderLayers,
  handleRenameLayer,
  onSetSelectedItem
}) => {
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);

  return (
    <div className="w-80 border-l border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col h-full shadow-xl z-20 overflow-hidden">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-gray-200 dark:border-zinc-800 p-1 bg-gray-50/50 dark:bg-zinc-900/50">
        <button 
          type="button"
          onClick={() => setActiveTab('properties')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'properties' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <MousePointerClick size={14} /> Propriedades
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'layers' ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
          <List size={14} /> Camadas
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'properties' ? (
          <div className="p-5">
            <PropertiesPanel 
              selectedItem={selectedItem}
              level={level}
              allLevels={allLevels}
              editingView={editingView}
              updateOption={updateOption}
              updateStaticElement={updateStaticElement}
              onOpenMediaLibrary={onOpenMediaLibrary}
              onShowLogicEditor={onShowLogicEditor}
              onLayerChange={onLayerChange}
              getActiveStaticElements={getActiveStaticElements}
              fontFamilies={fontFamilies}
            />
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-xs uppercase text-gray-500 flex items-center gap-2"><List size={16} /> Camadas</h3>
              <span className="text-xs text-gray-500">{getAllLayers().length} elementos</span>
            </div>
            <div className="space-y-2">
              {getAllLayers().map((layer, index) => (
                <div 
                  key={layer.id}
                  className={`p-2 rounded-lg border transition-all ${selectedItem?.type === layer.type && selectedItem?.id === layer.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedLayerIndex !== null && draggedLayerIndex !== index) {
                      handleReorderLayers(draggedLayerIndex, index);
                      setDraggedLayerIndex(null);
                    }
                  }}
                  onClick={() => onSetSelectedItem({ type: layer.type, id: layer.id })}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      draggable 
                      onDragStart={() => setDraggedLayerIndex(index)}
                      className="cursor-move p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
                    >
                      <GripVertical size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={layer.name}
                      onChange={(e) => handleRenameLayer(layer.id, layer.type, e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-sm focus:ring-1 focus:ring-blue-500 rounded px-1"
                      placeholder="Nome da camada"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-medium">{layer.type === 'option' ? 'Opção' : 'Estático'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
