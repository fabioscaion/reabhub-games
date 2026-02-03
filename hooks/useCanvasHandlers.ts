import { useState, useRef, useEffect } from "react";
import { DragItem, Level, Option, Asset } from "@/types/game";

interface UseCanvasHandlersProps {
  zoom: number;
  setZoom: (zoom: number | ((z: number) => number)) => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number } | ((p: { x: number; y: number }) => { x: number; y: number })) => void;
  selectedItem: DragItem | null;
  setSelectedItem: (item: DragItem | null) => void;
  editingItemId: string | null;
  isSpacePressed: boolean;
  level: Level;
  updateOption: (id: string, updates: Partial<Option>) => void;
  updateStaticElement: (id: string, updates: Partial<Asset & { position?: { x: number; y: number } }>) => void;
  getActiveStaticElements: () => any[];
  deleteItem: (item: DragItem) => void;
  showLogicEditor: boolean;
  isPreviewing: boolean;
}

export const useCanvasHandlers = ({
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
}: UseCanvasHandlersProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ mouseX: 0, mouseY: 0, width: 0, height: 0, itemX: 0, itemY: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.min(3, Math.max(0.25, (typeof z === 'number' ? z : 1) + delta)));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLogicEditor || isPreviewing) return;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedItem && !isInput) {
        e.preventDefault();
        deleteItem(selectedItem);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, showLogicEditor, isPreviewing, deleteItem]);

  const handleMouseDown = (e: React.MouseEvent, item: DragItem, currentPos: { x: number; y: number }) => {
    if (e.button !== 0 || isSpacePressed || editingItemId === item.id) return;
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    e.stopPropagation();
    e.preventDefault();

    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
    const mouseY = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;

    setDragOffset({ x: mouseX - currentPos.x, y: mouseY - currentPos.y });
    setSelectedItem(item);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleResizeStart = (e: React.MouseEvent, item: DragItem, direction: string, width: number, height: number, position: { x: number; y: number }) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingHandle(direction);
    setResizeStart({ mouseX: e.clientX, mouseY: e.clientY, width, height, itemX: position.x, itemY: position.y });
    setSelectedItem(item);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!canvasRef.current) return;

    if (!isDragging && dragStartPos && selectedItem && !resizingHandle) {
      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        setIsDragging(true);
      } else {
        return;
      }
    }

    if (resizingHandle && selectedItem) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const deltaScreenX = e.clientX - resizeStart.mouseX;
      const deltaScreenY = e.clientY - resizeStart.mouseY;
      const deltaWidth = deltaScreenX / zoom;
      const deltaHeight = deltaScreenY / zoom;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.itemX;
      let newY = resizeStart.itemY;

      if (resizingHandle.includes('e')) newWidth = Math.max(20, resizeStart.width + deltaWidth);
      if (resizingHandle.includes('w')) newWidth = Math.max(20, resizeStart.width - deltaWidth);
      if (resizingHandle.includes('s')) newHeight = Math.max(20, resizeStart.height + deltaHeight);
      if (resizingHandle.includes('n')) newHeight = Math.max(20, resizeStart.height - deltaHeight);

      if (e.shiftKey) {
        const aspectRatio = resizeStart.width / resizeStart.height;
        if (resizingHandle.length > 1) {
          const widthRatio = newWidth / resizeStart.width;
          const heightRatio = newHeight / resizeStart.height;
          if (Math.abs(heightRatio - 1) > Math.abs(widthRatio - 1)) {
            newWidth = newHeight * aspectRatio;
          } else {
            newHeight = newWidth / aspectRatio;
          }
        } else {
          if (resizingHandle === 'e' || resizingHandle === 'w') {
            newHeight = newWidth / aspectRatio;
          } else if (resizingHandle === 'n' || resizingHandle === 's') {
            newWidth = newHeight * aspectRatio;
          }
        }
      }

      const widthChange = newWidth - resizeStart.width;
      const heightChange = newHeight - resizeStart.height;
      const widthChangePercent = (widthChange * zoom / canvasRect.width) * 100;
      const heightChangePercent = (heightChange * zoom / canvasRect.height) * 100;

      if (resizingHandle.includes('e')) newX = resizeStart.itemX + (widthChangePercent / 2);
      else if (resizingHandle.includes('w')) newX = resizeStart.itemX - (widthChangePercent / 2);

      if (resizingHandle.includes('s')) newY = resizeStart.itemY + (heightChangePercent / 2);
      else if (resizingHandle.includes('n')) newY = resizeStart.itemY - (heightChangePercent / 2);

      if (selectedItem.type === "static") {
        const el = getActiveStaticElements().find(e => e.id === selectedItem.id);
        if (el) {
          const isText = el.type === 'text';
          updateStaticElement(selectedItem.id, {
            position: { x: newX, y: newY },
            style: { ...el.style, width: newWidth, height: isText ? undefined : newHeight }
          });
        }
      } else {
        const opt = level.options.find(o => o.id === selectedItem.id);
        if (opt) {
          const isText = opt.content.type === 'text';
          updateOption(selectedItem.id, {
            position: { x: newX, y: newY },
            content: { ...opt.content, style: { ...opt.content.style, width: newWidth, height: isText ? undefined : newHeight } }
          });
        }
      }
      return;
    }

    if (!isDragging || !selectedItem) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
    const mouseY = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;

    const newX = mouseX - dragOffset.x;
    const newY = mouseY - dragOffset.y;

    if (selectedItem.type === "static") {
      updateStaticElement(selectedItem.id, { position: { x: newX, y: newY } });
    } else {
      updateOption(selectedItem.id, { position: { x: newX, y: newY } });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizingHandle(null);
    setIsPanning(false);
    setDragStartPos(null);
  };

  return {
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
  };
};
