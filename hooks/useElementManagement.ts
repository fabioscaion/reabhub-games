"use client";

import { Asset, Level, Option, DragItem } from "@/types/game";
import { useCallback } from "react";
import { generateId } from "@/lib/utils";

interface UseElementManagementProps {
  level: Level;
  updateLevel: (updates: Partial<Level>) => void;
  updateActiveStaticElements: (newElements: any[]) => void;
  getActiveStaticElements: () => any[];
  setSelectedItem: (item: DragItem | null) => void;
}

export function useElementManagement({
  level,
  updateLevel,
  updateActiveStaticElements,
  getActiveStaticElements,
  setSelectedItem,
}: UseElementManagementProps) {
  
  const addOption = useCallback((type: "text" | "image" | "shape", initialStyle?: any, initialValue?: string) => {
    const newOption: Option = {
      id: generateId(),
      content: { 
        type, 
        value: initialValue || (type === "text" ? (initialStyle?.fontSize && initialStyle.fontSize > 20 ? "Novo Título" : "Nova Opção") : type === "shape" ? "square" : ""),
        style: initialStyle || (type === "shape" ? { backgroundColor: "#3b82f6", borderWidth: 0, borderColor: "#000000" } : type === "text" ? { color: "#000000" } : undefined)
      },
      isCorrect: false,
      position: { x: 50, y: 50 }
    };
    updateLevel({ options: [...level.options, newOption] });
    setSelectedItem({ type: "option", id: newOption.id });
  }, [level.options, updateLevel, setSelectedItem]);

  const addStaticElement = useCallback((type: "text" | "image" | "shape" | "audio" | "input", initialStyle?: any, initialValue?: string) => {
    const newElement: Asset & { id: string; position: { x: number; y: number } } = {
      id: generateId(),
      type,
      value: initialValue || (type === "text" ? (initialStyle?.fontSize && initialStyle.fontSize > 20 ? "Novo Título" : "Novo Texto") : type === "shape" ? "square" : type === "input" ? "Digite aqui..." : ""),
      style: initialStyle || (type === "shape" ? { backgroundColor: "#3b82f6", borderWidth: 0, borderColor: "#000000" } : type === "text" ? { color: "#000000" } : type === "audio" ? { width: 48, height: 48 } : type === "input" ? { width: 200, height: 40, backgroundColor: "#ffffff", borderColor: "#cccccc", borderWidth: 1 } : undefined),
      position: { x: 50, y: 50 }
    };
    updateActiveStaticElements([...getActiveStaticElements(), newElement]);
    setSelectedItem({ type: "static", id: newElement.id });
  }, [getActiveStaticElements, updateActiveStaticElements, setSelectedItem]);

  const handleDuplicate = useCallback((selectedItem: DragItem | null, editingView: string) => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'static') {
        const original = getActiveStaticElements().find(e => e.id === selectedItem.id);
        if (!original || !original.position) return;
        
        const newId = generateId();
        const position = { 
            x: Math.min(90, original.position.x + 2), 
            y: Math.min(90, original.position.y + 2) 
        };
        
        const newData = { ...original, id: newId, position };
        updateActiveStaticElements([...getActiveStaticElements(), newData]);
        setSelectedItem({ type: 'static', id: newId });
    } else if (editingView === 'level') {
        const original = level.options.find(o => o.id === selectedItem.id);
        if (!original || !original.position) return;
        
        const newId = generateId();
        const position = { 
            x: Math.min(90, original.position.x + 2), 
            y: Math.min(90, original.position.y + 2) 
        };
        
        const newData = { ...original, id: newId, position };
        updateLevel({ options: [...level.options, newData] });
        setSelectedItem({ type: 'option', id: newId });
    }
  }, [level.options, getActiveStaticElements, updateActiveStaticElements, updateLevel, setSelectedItem]);

  return {
    addOption,
    addStaticElement,
    handleDuplicate,
  };
}
