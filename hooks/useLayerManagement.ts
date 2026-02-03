import { DragItem, Level, Option, Asset } from "@/types/game";

interface UseLayerManagementProps {
  level: Level;
  editingView: 'level' | 'success' | 'error';
  selectedItem: DragItem | null;
  updateLevel: (updates: Partial<Level>) => void;
  updateOption: (id: string, updates: Partial<Option>) => void;
  updateStaticElement: (id: string, updates: Partial<Asset & { position?: { x: number; y: number } }>) => void;
  getActiveStaticElements: () => any[];
  updateActiveStaticElements: (newElements: any[]) => void;
}

export const useLayerManagement = ({
  level,
  editingView,
  selectedItem,
  updateLevel,
  updateOption,
  updateStaticElement,
  getActiveStaticElements,
  updateActiveStaticElements,
}: UseLayerManagementProps) => {
  const getMinMaxZIndex = () => {
    const items = [
      ...(editingView === 'level' ? level.options.map(o => o.content) : []),
      ...getActiveStaticElements()
    ].filter((i): i is Asset => !!i);
    
    if (items.length === 0) return { min: 10, max: 10 };
    const zIndexes = items.map(i => i.style?.zIndex || 10);
    return { min: Math.min(...zIndexes), max: Math.max(...zIndexes) };
  };

  const handleLayerChange = (action: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedItem) return;
    const { min, max } = getMinMaxZIndex();
    let currentZ = 0;
    let updateFn: (z: number) => void;

    if (selectedItem.type === "static") {
      const el = getActiveStaticElements().find(e => e.id === selectedItem.id);
      if (!el) return;
      currentZ = el.style?.zIndex || 0;
      updateFn = (z) => updateStaticElement(selectedItem.id, { style: { ...el.style, zIndex: z } });
    } else {
      const opt = level.options.find(o => o.id === selectedItem.id);
      if (!opt) return;
      currentZ = opt.content.style?.zIndex || 0;
      updateFn = (z) => updateOption(selectedItem.id, { content: { ...opt.content, style: { ...opt.content.style, zIndex: z } } });
    }

    switch (action) {
      case 'front': updateFn(max + 1); break;
      case 'back': updateFn(min - 1); break;
      case 'forward': updateFn(currentZ + 1); break;
      case 'backward': updateFn(currentZ - 1); break;
    }
  };

  const getAllLayers = () => {
    const layers: { id: string; type: 'option' | 'static'; zIndex: number; name: string; content: Asset }[] = [];
    if (editingView === 'level') {
      level.options.forEach(opt => {
        layers.push({ 
          id: opt.id, 
          type: 'option', 
          zIndex: opt.content.style?.zIndex || 0, 
          name: opt.content.name !== undefined ? opt.content.name : (opt.content.type === 'image' ? 'Imagem (Opção)' : (opt.content.value || 'Opção sem texto').substring(0, 20)), 
          content: opt.content 
        });
      });
    }
    getActiveStaticElements().forEach(el => {
      layers.push({ 
        id: el.id, 
        type: 'static', 
        zIndex: el.style?.zIndex || 0, 
        name: el.name !== undefined ? el.name : (el.type === 'image' ? 'Imagem (Estática)' : (el.value || 'Texto estático').substring(0, 20)), 
        content: el 
      });
    });
    return layers.sort((a, b) => b.zIndex - a.zIndex);
  };

  const handleReorderLayers = (draggedIndex: number, targetIndex: number) => {
    const layers = getAllLayers();
    const item = layers[draggedIndex];
    layers.splice(draggedIndex, 1);
    layers.splice(targetIndex, 0, item);
    
    let newOptions = [...level.options];
    let newStaticElements = [...getActiveStaticElements()];
    
    layers.forEach((layer, index) => {
      const newZIndex = (layers.length - index) * 10;
      if (layer.type === 'static') {
        const elIndex = newStaticElements.findIndex(e => e.id === layer.id);
        if (elIndex !== -1) {
          newStaticElements[elIndex] = { ...newStaticElements[elIndex], style: { ...newStaticElements[elIndex].style, zIndex: newZIndex } };
        }
      } else if (editingView === 'level') {
        const optIndex = newOptions.findIndex(o => o.id === layer.id);
        if (optIndex !== -1) {
          newOptions[optIndex] = { ...newOptions[optIndex], content: { ...newOptions[optIndex].content, style: { ...newOptions[optIndex].content.style, zIndex: newZIndex } } };
        }
      }
    });
    
    updateActiveStaticElements(newStaticElements);
    if (editingView === 'level') {
      updateLevel({ options: newOptions });
    }
  };

  const handleRenameLayer = (id: string, type: 'option' | 'static', newName: string) => {
    if (type === 'static') {
      const el = getActiveStaticElements().find(e => e.id === id);
      if (el) updateStaticElement(id, { name: newName });
    } else {
      const opt = level.options.find(o => o.id === id);
      if (opt) updateOption(id, { content: { ...opt.content, name: newName } });
    }
  };

  return {
    handleLayerChange,
    getAllLayers,
    handleReorderLayers,
    handleRenameLayer,
  };
};
