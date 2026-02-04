import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Level, Option, Asset, DragItem } from "@/types/game";
import DraggableItem from "./DraggableItem";

interface WorkspaceProps {
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isSpacePressed: boolean;
  isPanning: boolean;
  setIsPanning: (panning: boolean) => void;
  panStart: { x: number; y: number };
  setPanStart: (start: { x: number; y: number }) => void;
  level: Level;
  editingView: 'level' | 'success' | 'error';
  selectedItem: DragItem | null;
  setSelectedItem: (item: DragItem | null) => void;
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;
  isDragging: boolean;
  resizingHandle: string | null;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleWheel: (e: React.WheelEvent) => void;
  handleMouseDown: (e: React.MouseEvent, item: DragItem, currentPos: { x: number; y: number }) => void;
  handleContextMenu: (e: React.MouseEvent, item?: { id: string; type: 'option' | 'static' }) => void;
  handleResizeStart: (e: React.MouseEvent, item: DragItem, direction: string, width: number, height: number, position: { x: number; y: number }) => void;
  deleteItem: (item: DragItem) => void;
  updateOption: (id: string, updates: Partial<Option>) => void;
  updateStaticElement: (id: string, updates: Partial<Asset & { position?: { x: number; y: number } }>) => void;
  getActiveStaticElements: () => any[];
}

const Workspace: React.FC<WorkspaceProps> = ({
  zoom,
  setZoom,
  pan,
  setPan,
  isSpacePressed,
  isPanning,
  setIsPanning,
  panStart,
  setPanStart,
  level,
  editingView,
  selectedItem,
  setSelectedItem,
  editingItemId,
  setEditingItemId,
  isDragging,
  resizingHandle,
  canvasRef,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  handleMouseDown,
  handleContextMenu,
  handleResizeStart,
  deleteItem,
  updateOption,
  updateStaticElement,
  getActiveStaticElements,
}) => {
  const [zoomInputValue, setZoomInputValue] = React.useState(Math.round(zoom * 100).toString());

  React.useEffect(() => {
    setZoomInputValue(Math.round(zoom * 100).toString());
  }, [zoom]);

  const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZoomInputValue(e.target.value);
  };

  const handleZoomInputBlur = () => {
    const value = parseInt(zoomInputValue);
    if (!isNaN(value)) {
      const newZoom = Math.min(3, Math.max(0.25, value / 100));
      setZoom(newZoom);
      setZoomInputValue(Math.round(newZoom * 100).toString());
    } else {
      setZoomInputValue(Math.round(zoom * 100).toString());
    }
  };

  const handleZoomInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div 
      className={`flex-1 bg-slate-200 rounded-lg border border-gray-200 dark:border-zinc-800 relative overflow-hidden flex items-center justify-center ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{
        backgroundImage: `radial-gradient(circle, ${isPanning ? '#94a3b8' : '#cbd5e1'} 1.5px, transparent 1.5px)`,
        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
        backgroundPosition: `calc(50% + ${pan.x}px) calc(50% + ${pan.y}px)`,
      }}
      onMouseDown={(e) => {
        if (isSpacePressed) {
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
        } else if (e.target === e.currentTarget) {
          setSelectedItem(null);
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-50 flex gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800">
        <button 
          type="button"
          onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-600 dark:text-gray-300"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <div className="flex items-center px-1">
          <input 
            type="text"
            value={zoomInputValue}
            onChange={handleZoomInputChange}
            onBlur={handleZoomInputBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleZoomInputBlur();
              }
              handleZoomInputKeyDown(e);
            }}
            className="w-10 text-xs font-mono text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
          />
          <span className="text-xs font-mono">%</span>
        </div>
        <button 
          type="button"
          onClick={() => setZoom(z => Math.min(3, z + 0.25))}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-600 dark:text-gray-300"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px bg-gray-200 dark:bg-zinc-800 mx-1" />
        <button 
          type="button"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded text-gray-600 dark:text-gray-300"
          title="Reset Zoom & Pan"
        >
          <Maximize size={16} />
        </button>
      </div>

      {/* The "Paper" (Canvas) */}
      <div 
        ref={canvasRef}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
          backgroundColor: (editingView === 'level' ? level.style?.backgroundColor : (editingView === 'success' ? level.successScreen?.style?.backgroundColor : level.errorScreen?.style?.backgroundColor)) || '#ffffff'
        }}
        className="w-full max-w-5xl aspect-video bg-white shadow-2xl relative select-none border border-gray-200 dark:border-zinc-800"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isSpacePressed) {
            setSelectedItem(null);
          }
        }}
        onContextMenu={(e) => handleContextMenu(e)}
      >
        {/* Options */}
        {editingView === 'level' && level.options.map(opt => (
          <DraggableItem
            key={opt.id}
            item={{ type: "option", id: opt.id }}
            position={opt.position || { x: 50, y: 50 }}
            content={opt.content}
            isCorrect={opt.isCorrect}
            isSelected={selectedItem?.type === 'option' && selectedItem.id === opt.id}
            isEditing={editingItemId === opt.id}
            isDragging={isDragging}
            resizingHandle={resizingHandle}
            level={level}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            onDoubleClick={(e, item) => {
              e.stopPropagation();
              if (opt.content.type === 'text' || opt.content.type === 'shape') {
                setEditingItemId(item.id);
              }
            }}
            onResizeStart={handleResizeStart}
            onDelete={deleteItem}
            onUpdate={(id, type, updates) => {
              if (type === 'static') updateStaticElement(id, updates);
              else updateOption(id, updates);
            }}
            onSetEditing={setEditingItemId}
          />
        ))}
        
        {/* Static Elements */}
        {getActiveStaticElements().map(el => (
          <DraggableItem
            key={el.id}
            item={{ type: "static", id: el.id }}
            position={el.position}
            content={el}
            isSelected={selectedItem?.type === 'static' && selectedItem.id === el.id}
            isEditing={editingItemId === el.id}
            isDragging={isDragging}
            resizingHandle={resizingHandle}
            level={level}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
            onDoubleClick={(e, item) => {
              e.stopPropagation();
              if (el.type === 'text' || el.type === 'shape') {
                setEditingItemId(item.id);
              }
            }}
            onResizeStart={handleResizeStart}
            onDelete={deleteItem}
            onUpdate={(id, type, updates) => {
              if (type === 'static') updateStaticElement(id, updates);
              else updateOption(id, updates);
            }}
            onSetEditing={setEditingItemId}
          />
        ))}
      </div>
    </div>
  );
};

export default Workspace;
