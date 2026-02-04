"use client";

import { useState, useEffect, useCallback } from "react";
import { Level, Option, Asset, GameType, DragItem } from "@/types/game";
import { Play, ArrowLeft, Save, CheckCircle2, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogicEditor from './logic/LogicEditor';
import ImageLibraryModal from "./ImageLibraryModal";
import AudioLibraryModal from "./AudioLibraryModal";
import PreviewModal from "./PreviewModal";
import Toolbar from "./canvas/Toolbar";
import Sidebar from "./canvas/Sidebar";
import Workspace from "./canvas/Workspace";
import ContextMenu from "./canvas/ContextMenu";
import { useCanvasHandlers } from "@/hooks/useCanvasHandlers";
import { useLayerManagement } from "@/hooks/useLayerManagement";
import { useMediaLibraries } from "@/hooks/useMediaLibraries";
import { useElementManagement } from "@/hooks/useElementManagement";
import { toBase64, handleFileUpload, generateId } from "@/lib/utils";

interface GameCanvasProps {
  level: Level;
  onChange: (updatedLevel: Level) => void;
  onSaveGame?: (updatedLevel: Level) => Promise<void>;
  gameType?: GameType;
  allLevels?: Level[];
  onClose?: () => void;
}

export default function GameCanvas({ 
  level, 
  onChange, 
  onSaveGame,
  gameType = 'naming',
  allLevels = [],
  onClose
}: GameCanvasProps) {
  const [selectedItem, setSelectedItem] = useState<DragItem | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingView, setEditingView] = useState<'level' | 'success' | 'error'>('level');
  const [showLogicEditor, setShowLogicEditor] = useState(false);
  const [logicFocusElementId, setLogicFocusElementId] = useState<string | null>(null);

  const getActiveStaticElements = useCallback(() => {
    if (editingView === 'success') return level.successScreen?.staticElements || [];
    if (editingView === 'error') return level.errorScreen?.staticElements || [];
    return level.staticElements || [];
  }, [editingView, level.successScreen, level.errorScreen, level.staticElements]);

  const updateActiveStaticElements = useCallback((newElements: any[]) => {
    if (editingView === 'success') {
      updateLevel({ successScreen: { ...(level.successScreen || {}), staticElements: newElements } });
    } else if (editingView === 'error') {
      updateLevel({ errorScreen: { ...(level.errorScreen || {}), staticElements: newElements } });
    } else {
      updateLevel({ staticElements: newElements });
    }
  }, [editingView, level.successScreen, level.errorScreen, level.staticElements]);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const handleSaveLevel = async () => {
    if (!onSaveGame) return;
    
    setIsSaving(true);
    try {
      await onSaveGame(level);
      setSnackbar({
        show: true,
        message: 'Nível salvo com sucesso!',
        type: 'success'
      });
      setTimeout(() => setSnackbar(prev => ({ ...prev, show: false })), 3000);
    } catch (error) {
      console.error("Erro ao salvar nível:", error);
      setSnackbar({
        show: true,
        message: 'Erro ao salvar o nível. Tente novamente.',
        type: 'error'
      });
      setTimeout(() => setSnackbar(prev => ({ ...prev, show: false })), 4000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Zoom and Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const fontFamilies = [
    { name: 'Padrão (Sans-serif)', value: 'inherit' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Comic Sans', value: '"Comic Sans MS", "Comic Sans", cursive' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
  ];

  // Helper to update level safely
  const updateLevel = useCallback((updates: Partial<Level>) => {
    onChange({ ...level, ...updates });
  }, [level, onChange]);

  const updateOption = useCallback((id: string, updates: Partial<Option>) => {
    const newOptions = level.options.map(opt => 
      opt.id === id ? { ...opt, ...updates } : opt
    );
    updateLevel({ options: newOptions });
  }, [level.options, updateLevel]);

  const updateStaticElement = useCallback((id: string, updates: Partial<Asset & { position?: { x: number; y: number } }>) => {
    const newStaticElements = getActiveStaticElements().map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    updateActiveStaticElements(newStaticElements);
  }, [getActiveStaticElements, updateActiveStaticElements]);

  const deleteItem = useCallback((item: DragItem) => {
    if (item.type === "option") {
      const newOptions = level.options.filter(o => o.id !== item.id);
      updateLevel({ options: newOptions });
    } else {
      const newStatic = getActiveStaticElements().filter(s => s.id !== item.id);
      updateActiveStaticElements(newStatic);
    }
    setSelectedItem(null);
  }, [level.options, getActiveStaticElements, updateLevel, updateActiveStaticElements]);

  const {
    isDragging,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    resizingHandle,
    canvasRef,
    handleMouseDown,
    handleResizeStart,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  } = useCanvasHandlers({
    zoom,
    setZoom,
    pan,
    setPan,
    selectedItem,
    setSelectedItem,
    editingItemId,
    isSpacePressed,
    level,
    updateOption,
    updateStaticElement,
    getActiveStaticElements,
    deleteItem,
    showLogicEditor,
    isPreviewing,
  });

  const {
    handleLayerChange,
    getAllLayers,
    handleReorderLayers,
    handleRenameLayer,
  } = useLayerManagement({
    level,
    editingView,
    selectedItem,
    updateLevel,
    updateOption,
    updateStaticElement,
    getActiveStaticElements,
    updateActiveStaticElements,
  });

  const {
    isImageLibraryOpen,
    setIsImageLibraryOpen,
    storedImages,
    openImageLibrary,
    handleImageSelect,
    isAudioLibraryOpen,
    setIsAudioLibraryOpen,
    storedAudios,
    openAudioLibrary,
    handleAudioSelect,
  } = useMediaLibraries();

  const {
    addOption,
    addStaticElement,
    handleDuplicate,
  } = useElementManagement({
    level,
    updateLevel,
    updateActiveStaticElements,
    getActiveStaticElements,
    setSelectedItem,
  });

  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
  const [clipboard, setClipboard] = useState<{ type: 'option' | 'static'; data: any } | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    itemId?: string;
    itemType?: 'option' | 'static';
  }>({ visible: false, x: 0, y: 0 });

  // Reset editing view if level type changes to one that doesn't support success/error screens
  useEffect(() => {
    if ((level.type === 'menu' || level.type === 'info') && editingView !== 'level') {
      setEditingView('level');
    }
  }, [level.type, editingView]);

  // Close context menu on global click
  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If logic editor or preview is open, don't handle global shortcuts for canvas items
      if (showLogicEditor || isPreviewing) return;

      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Spacebar for panning
      if (e.code === 'Space' && !e.repeat && !isInput) {
        e.preventDefault(); // Prevent scrolling
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showLogicEditor, isPreviewing, setIsPanning]);

  const handleContextMenu = (e: React.MouseEvent, item?: { id: string; type: 'option' | 'static' }) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If we clicked on an item, select it
    if (item) {
        setSelectedItem(item);
    }
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      itemId: item?.id,
      itemType: item?.type
    });
  };

  const handleCopy = useCallback(() => {
    if (!selectedItem) return;

    let data;
    if (selectedItem.type === 'option') {
      data = level.options.find(o => o.id === selectedItem.id);
    } else {
      data = getActiveStaticElements().find(e => e.id === selectedItem.id);
    }

    if (data) {
      setClipboard({ type: selectedItem.type as 'option' | 'static', data: { ...data } });
    }
  }, [selectedItem, level.options, getActiveStaticElements]);

  const handleCut = useCallback(() => {
    if (!selectedItem) return;
    handleCopy();
    deleteItem(selectedItem);
  }, [selectedItem, handleCopy, deleteItem]);

  const handlePaste = useCallback(() => {
    if (!clipboard) return;

    const newId = generateId();
    const position = { 
      x: Math.min(90, (clipboard.data.position?.x || 50) + 5), 
      y: Math.min(90, (clipboard.data.position?.y || 50) + 5) 
    };

    if (clipboard.type === 'option' && editingView === 'level') {
      const newOption: Option = { ...clipboard.data, id: newId, position };
      updateLevel({ options: [...level.options, newOption] });
      setSelectedItem({ type: 'option', id: newId });
    } else if (clipboard.type === 'static') {
      const newElement = { ...clipboard.data, id: newId, position };
      updateActiveStaticElements([...getActiveStaticElements(), newElement]);
      setSelectedItem({ type: 'static', id: newId });
    }
  }, [clipboard, editingView, level.options, updateLevel, getActiveStaticElements, updateActiveStaticElements, setSelectedItem]);

  return (
    <div className="flex flex-col gap-4 h-full min-h-[500px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
              title="Voltar"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg w-fit">
             <button onClick={() => { setEditingView('level'); setSelectedItem(null); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${editingView === 'level' ? 'bg-white dark:bg-zinc-700 shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Editor do Nível</button>
             {(level.type === 'game' || !level.type) && (
               <>
                 <button onClick={() => { setEditingView('success'); setSelectedItem(null); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${editingView === 'success' ? 'bg-white dark:bg-zinc-700 shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}>Tela de Sucesso</button>
                 <button onClick={() => { setEditingView('error'); setSelectedItem(null); }} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${editingView === 'error' ? 'bg-white dark:bg-zinc-700 shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Tela de Erro</button>
               </>
             )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsPreviewing(true)}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-full shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95 group"
          >
            <Play size={18} fill="currentColor" />
            <span>PREVISUALIZAR</span>
          </button>
          
          {onSaveGame && (
            <button 
              type="button"
              onClick={handleSaveLevel}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 group disabled:opacity-70 disabled:scale-100 ${
                isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? 'SALVANDO...' : 'SALVAR NÍVEL'}</span>
            </button>
          )}
        </div>
      </div>
    <div className="flex gap-6 flex-1 min-h-0">
      <div className="flex-1 flex flex-col gap-2 h-full relative">
        <Workspace 
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          isSpacePressed={isSpacePressed}
          isPanning={isPanning}
          setIsPanning={setIsPanning}
          panStart={panStart}
          setPanStart={setPanStart}
          level={level}
          editingView={editingView}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          editingItemId={editingItemId}
          setEditingItemId={setEditingItemId}
          isDragging={isDragging}
          resizingHandle={resizingHandle}
          canvasRef={canvasRef}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleWheel={handleWheel}
          handleMouseDown={handleMouseDown}
          handleContextMenu={handleContextMenu}
          handleResizeStart={handleResizeStart}
          deleteItem={deleteItem}
          updateOption={updateOption}
          updateStaticElement={updateStaticElement}
          getActiveStaticElements={getActiveStaticElements}
        />

        <PreviewModal 
          isOpen={isPreviewing}
          onClose={() => setIsPreviewing(false)}
          level={level}
          gameType={gameType}
        />

        <div className="absolute left-4 top-4 z-40">
          <Toolbar 
            level={level}
            editingView={editingView}
            onAddStaticElement={addStaticElement}
            onAddOption={addOption}
            onOpenImageLibrary={openImageLibrary}
            onOpenAudioLibrary={openAudioLibrary}
            onShowLogicEditor={setShowLogicEditor}
            onUpdateLevel={updateLevel}
            onSetSelectedItem={setSelectedItem}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>

      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedItem={selectedItem}
        level={level}
        allLevels={allLevels}
        editingView={editingView}
        updateOption={updateOption}
        updateStaticElement={updateStaticElement}
        onOpenImageLibrary={openImageLibrary}
        onOpenAudioLibrary={openAudioLibrary}
        onShowLogicEditor={(show, focusId) => {
          if (focusId) setLogicFocusElementId(focusId);
          setShowLogicEditor(show);
        }}
        onLayerChange={handleLayerChange}
        getActiveStaticElements={getActiveStaticElements}
        fontFamilies={fontFamilies}
        getAllLayers={getAllLayers}
        handleReorderLayers={handleReorderLayers}
        handleRenameLayer={handleRenameLayer}
        onSetSelectedItem={setSelectedItem}
      />
    </div>

    <ContextMenu 
      visible={contextMenu.visible}
      x={contextMenu.x}
      y={contextMenu.y}
      selectedItem={selectedItem}
      onDuplicate={() => {
        handleDuplicate(selectedItem, editingView);
        setContextMenu(prev => ({ ...prev, visible: false }));
      }}
      onDelete={deleteItem}
      onLayerChange={handleLayerChange}
      onCopy={handleCopy}
      onCut={handleCut}
      onPaste={handlePaste}
      hasClipboard={!!clipboard}
      onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
    />

    <ImageLibraryModal
      isOpen={isImageLibraryOpen}
      onClose={() => setIsImageLibraryOpen(false)}
      onSelect={handleImageSelect}
      initialImages={storedImages}
    />

    <AudioLibraryModal
      isOpen={isAudioLibraryOpen}
      onClose={() => setIsAudioLibraryOpen(false)}
      onSelect={handleAudioSelect}
      initialAudios={storedAudios}
    />

    {showLogicEditor && (
      <LogicEditor 
        initialNodes={level.logic?.nodes || []}
        initialEdges={level.logic?.edges || []}
        focusElementId={logicFocusElementId || undefined}
        onSave={async (nodes, edges) => {
          const updatedLevel = { ...level, logic: { nodes, edges } };
          updateLevel({ logic: { nodes, edges } });
          if (onSaveGame) {
            await onSaveGame(updatedLevel);
          }
          setShowLogicEditor(false);
          setLogicFocusElementId(null);
        }}
        onClose={() => {
          setShowLogicEditor(false);
          setLogicFocusElementId(null);
        }}
        onOpenAudioLibrary={openAudioLibrary}
        availableLevels={allLevels.map(l => ({ id: l.id, name: l.name || `Nível ${l.id.substring(0,4)}` }))}
        elements={[
          ...level.options.map(o => ({ id: o.id, type: 'option', name: o.content.name || o.content.value })),
          ...getActiveStaticElements().map(e => ({ id: e.id, type: 'static', name: e.name || e.value }))
        ]}
      />
    )}

    {/* Snackbar / Toast Notification */}
    <AnimatePresence>
      {snackbar.show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
        >
          <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border ${
            snackbar.type === 'success' 
              ? 'bg-white dark:bg-zinc-900 border-green-100 dark:border-green-900/30 text-green-600 dark:text-green-400' 
              : 'bg-white dark:bg-zinc-900 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {snackbar.type === 'success' ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : (
              <X size={20} className="text-red-500" />
            )}
            <span className="font-medium">{snackbar.message}</span>
            <button 
              onClick={() => setSnackbar(prev => ({ ...prev, show: false }))}
              className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={14} className="text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
