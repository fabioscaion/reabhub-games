import React from 'react';
import { Level, Option, Asset, DragItem } from "@/types/game";
import { 
  Image as ImageIcon, 
  Type, 
  Square, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Music, 
  X, 
  CopyPlus, 
  LayoutGrid, 
  MousePointerClick, 
  ImagePlus, 
  BrainCircuit, 
  Tag, 
  ChevronsUp, 
  ChevronsDown, 
  ArrowUp, 
  ArrowDown,
  Move 
} from "lucide-react";
import Image from "next/image";
import { cn, handleFileUpload } from "@/lib/utils";

interface PropertiesPanelProps {
  selectedItem: DragItem | null;
  level: Level;
  allLevels: Level[];
  editingView: 'level' | 'success' | 'error';
  updateOption: (id: string, updates: Partial<Option>) => void;
  updateStaticElement: (id: string, updates: Partial<Asset & { position?: { x: number; y: number } }>) => void;
  onOpenImageLibrary: (callback: (base64: string) => void) => void;
  onOpenAudioLibrary: (callback: (base64: string) => void) => void;
  onShowLogicEditor: (show: boolean, focusId?: string) => void;
  onLayerChange: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  getActiveStaticElements: () => any[];
  fontFamilies: { name: string; value: string }[];
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedItem,
  level,
  allLevels,
  editingView,
  updateOption,
  updateStaticElement,
  onOpenImageLibrary,
  onOpenAudioLibrary,
  onShowLogicEditor,
  onLayerChange,
  getActiveStaticElements,
  fontFamilies
}) => {
  if (!selectedItem) {
    return (
      <div className="text-center text-gray-400 text-sm mt-10 px-4">
        <MousePointerClick size={32} className="mx-auto mb-2 opacity-50" />
        <p>Selecione um elemento na tela para editar suas propriedades.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedItem.type === "static" ? (
        (() => {
          const el = getActiveStaticElements().find(e => e.id === selectedItem.id);
          if (!el) return null;
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md">
                  {el.type === 'image' ? <ImageIcon size={16} /> : el.type === 'shape' ? <Square size={16} /> : <Type size={16} />}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {el.type === 'image' ? 'Imagem' : el.type === 'shape' ? 'Forma' : 'Texto'}
                </h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome do Elemento</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={el.name || ""}
                    placeholder="Ex: Botão Iniciar, Personagem..."
                    onChange={(e) => updateStaticElement(el.id, { name: e.target.value })}
                    className="w-full p-2.5 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all pr-8"
                  />
                  <Tag size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-[10px] text-gray-400 italic">Este nome aparecerá nos blocos da lógica visual.</p>
              </div>

              {/* Visual Logic Shortcut */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button 
                  type="button"
                  onClick={() => onShowLogicEditor(true, el.id)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-all font-medium text-sm"
                >
                  <BrainCircuit size={18} />
                  Editar Lógica Visual (Flow)
                </button>
              </div>

              {/* Behavior Section */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Comportamento</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                  <input 
                    type="checkbox" 
                    id="isDraggableStatic"
                    checked={el.draggable || false}
                    onChange={(e) => updateStaticElement(el.id, { draggable: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isDraggableStatic" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2">
                      <Move size={14} className="text-gray-400" />
                      Arrastável
                    </label>
                    <p className="text-[10px] text-gray-400">Permite que o jogador mova o elemento.</p>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Conteúdo</h4>
                {el.type === 'image' ? (
                  <div className="mt-1">
                    <button 
                      type="button"
                      onClick={() => onOpenImageLibrary((b64) => updateStaticElement(el.id, { value: b64 }))}
                      className="group relative w-full aspect-video border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors bg-gray-50 dark:bg-zinc-800"
                    >
                      {el.value ? (
                        <div className="relative w-full h-full">
                          <Image src={el.value} alt="Preview" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Trocar Imagem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImagePlus size={24} className="mb-2" />
                          <span className="text-xs">Selecionar Imagem</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : el.type === 'shape' ? (
                  <div className="grid grid-cols-5 gap-2">
                    {['square', 'rounded', 'circle', 'triangle', 'star'].map((shape) => (
                      <button
                        key={shape}
                        onClick={() => updateStaticElement(el.id, { value: shape })}
                        className={`p-2 rounded-md border transition-all ${el.value === shape ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400' : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}
                        title={shape}
                      >
                        <div className={`w-4 h-4 bg-current mx-auto ${shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-sm' : ''}`} 
                             style={{ clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined }} 
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <textarea 
                      value={el.value}
                      onChange={(e) => updateStaticElement(el.id, { value: e.target.value, style: { ...el.style, height: undefined } })}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-y text-sm"
                      placeholder="Conteúdo do texto"
                    />
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 block">Fonte</label>
                      <select 
                        value={el.style?.fontFamily || 'inherit'}
                        onChange={(e) => updateStaticElement(el.id, { style: { ...el.style, fontFamily: e.target.value } })}
                        className="w-full p-2 text-sm rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                      >
                        {fontFamilies.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Estilo</label>
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-md">
                          <button onClick={() => updateStaticElement(el.id, { style: { ...el.style, fontWeight: el.style?.fontWeight === 'bold' ? 'normal' : 'bold' } })} className={`flex-1 p-1.5 rounded ${el.style?.fontWeight === 'bold' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'}`}><Bold size={14} className="mx-auto" /></button>
                          <button onClick={() => updateStaticElement(el.id, { style: { ...el.style, fontStyle: el.style?.fontStyle === 'italic' ? 'normal' : 'italic' } })} className={`flex-1 p-1.5 rounded ${el.style?.fontStyle === 'italic' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'}`}><Italic size={14} className="mx-auto" /></button>
                          <button onClick={() => updateStaticElement(el.id, { style: { ...el.style, textDecoration: el.style?.textDecoration === 'underline' ? 'none' : 'underline' } })} className={`flex-1 p-1.5 rounded ${el.style?.textDecoration === 'underline' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'}`}><Underline size={14} className="mx-auto" /></button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Alinhamento</label>
                        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-md">
                          <button onClick={() => updateStaticElement(el.id, { style: { ...el.style, textAlign: 'left' } })} className={`flex-1 p-1.5 rounded ${el.style?.textAlign === 'left' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'}`}><AlignLeft size={14} className="mx-auto" /></button>
                          <button onClick={() => updateStaticElement(el.id, { style: { ...el.style, textAlign: 'center' } })} className={`flex-1 p-1.5 rounded ${!el.style?.textAlign || el.style?.textAlign === 'center' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'}`}><AlignCenter size={14} className="mx-auto" /></button>
                          <button onClick={() => updateStaticElement(el.id, { style: { ...el.style, textAlign: 'right' } })} className={`flex-1 p-1.5 rounded ${el.style?.textAlign === 'right' ? 'bg-white dark:bg-zinc-600 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-zinc-700'}`}><AlignRight size={14} className="mx-auto" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tamanho (px)</label>
                        <input 
                          type="number" 
                          min="12"
                          max="200"
                          value={el.style?.fontSize || 18}
                          onChange={(e) => updateStaticElement(el.id, { style: { ...el.style, fontSize: Number(e.target.value) } })}
                          className="w-full p-2 text-sm rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Cor</label>
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                          <input 
                            type="color" 
                            value={el.style?.color || "#000000"}
                            onChange={(e) => updateStaticElement(el.id, { style: { ...el.style, color: e.target.value } })}
                            className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-xs text-gray-500 flex-1 uppercase">{el.style?.color || "#000"}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {el.type === 'shape' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Cor de Preenchimento</label>
                      <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                        <input 
                          type="color" 
                          value={el.style?.backgroundColor || "#3b82f6"}
                          onChange={(e) => updateStaticElement(el.id, { style: { ...el.style, backgroundColor: e.target.value } })}
                          className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-500 flex-1 uppercase">{el.style?.backgroundColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Cor da Borda</label>
                      <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                        <input 
                          type="color" 
                          value={el.style?.borderColor || "#000000"}
                          onChange={(e) => updateStaticElement(el.id, { style: { ...el.style, borderColor: e.target.value } })}
                          className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-500 flex-1 uppercase">{el.style?.borderColor}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Espessura da Borda</label>
                      <input 
                        type="range" 
                        min="0"
                        max="20"
                        value={el.style?.borderWidth || 0}
                        onChange={(e) => updateStaticElement(el.id, { style: { ...el.style, borderWidth: Number(e.target.value) } })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Ordering Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <label className="text-xs text-gray-500 block mb-2">Ordem das Camadas</label>
                <div className="grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => onLayerChange('back')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Enviar para Trás"><ChevronsDown size={16} /></button>
                  <button type="button" onClick={() => onLayerChange('backward')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Recuar"><ArrowDown size={16} /></button>
                  <button type="button" onClick={() => onLayerChange('forward')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Avançar"><ArrowUp size={16} /></button>
                  <button type="button" onClick={() => onLayerChange('front')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Trazer para Frente"><ChevronsUp size={16} /></button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        // Option Properties
        (() => {
          const opt = level.options.find(o => o.id === selectedItem.id);
          if (!opt) return null;
          const isMenu = level.type === 'menu';
          
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-zinc-800">
                <span className={`p-1.5 rounded-md ${isMenu ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'}`}>
                  {isMenu ? <LayoutGrid size={16} /> : <MousePointerClick size={16} />}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {isMenu ? 'Botão de Menu' : 'Opção Interativa'}
                </h3>
              </div>

              {/* Logic Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Lógica</h4>
                {isMenu ? (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Destino do Botão</label>
                    <select
                      value={opt.targetLevelId || ""}
                      onChange={(e) => updateOption(opt.id, { targetLevelId: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Selecione um nível...</option>
                      {allLevels.map((l, idx) => (
                        <option key={l.id} value={l.id}>
                          Nível {idx + 1}: {l.id === level.id ? '(Atual)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <input 
                        type="checkbox" 
                        id="isCorrectCheck"
                        checked={opt.isCorrect}
                        onChange={(e) => updateOption(opt.id, { isCorrect: e.target.checked })}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="isCorrectCheck" className="text-sm font-medium cursor-pointer select-none">Esta é a resposta correta?</label>
                    </div>

                    {/* Visual Logic Shortcut */}
                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                      <button 
                        type="button"
                        onClick={() => onShowLogicEditor(true, opt.id)}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-all font-medium text-sm"
                      >
                        <BrainCircuit size={18} />
                        Editar Lógica Visual (Flow)
                      </button>
                    </div>

                    {/* Behavior Section */}
                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                      <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Comportamento</h4>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                        <input 
                          type="checkbox" 
                          id="isDraggableOption"
                          checked={opt.content.draggable || false}
                          onChange={(e) => updateOption(opt.id, { content: { ...opt.content, draggable: e.target.checked } })}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <label htmlFor="isDraggableOption" className="text-sm font-medium cursor-pointer select-none flex items-center gap-2">
                            <Move size={14} className="text-gray-400" />
                            Arrastável
                          </label>
                          <p className="text-[10px] text-gray-400">Permite que o jogador mova o elemento.</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Game Logic based on type */}
                    {/* ... (Memory, Sequencing logic omitted for brevity or can be included) */}
                  </div>
                )}
              </div>

              {/* Content Type */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Aparência</h4>
                  <select 
                    value={opt.content.type}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      updateOption(opt.id, { 
                        content: { 
                          ...opt.content, 
                          type: newType,
                          value: newType === "shape" ? "square" : (newType === "text" ? "Novo Texto" : ""),
                          style: newType === "shape" ? { backgroundColor: "#3b82f6", borderWidth: 0 } : undefined
                        } 
                      });
                    }}
                    className="text-xs p-1 rounded border bg-transparent"
                  >
                    <option value="text">Texto</option>
                    <option value="image">Imagem</option>
                    <option value="shape">Forma</option>
                  </select>
                </div>

                {opt.content.type === "image" ? (
                  <div className="mt-1">
                    <button 
                      type="button"
                      onClick={() => onOpenImageLibrary((b64) => updateOption(opt.id, { content: { ...opt.content, value: b64 } }))}
                      className="group relative w-full aspect-video border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors bg-gray-50 dark:bg-zinc-800"
                    >
                      {opt.content.value ? (
                        <div className="relative w-full h-full">
                          <Image src={opt.content.value} alt="Preview" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Trocar Imagem</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImagePlus size={24} className="mb-2" />
                          <span className="text-xs">Selecionar Imagem</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : opt.content.type === "shape" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-2">Forma</label>
                      <div className="grid grid-cols-5 gap-2">
                        {['square', 'rounded', 'circle', 'triangle', 'star'].map((shape) => (
                          <button
                            key={shape}
                            onClick={() => updateOption(opt.id, { content: { ...opt.content, value: shape } })}
                            className={`p-2 rounded-md border transition-all ${opt.content.value === shape ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400' : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-500 hover:border-gray-300'}`}
                            title={shape}
                          >
                            <div className={`w-4 h-4 bg-current mx-auto ${shape === 'circle' ? 'rounded-full' : shape === 'rounded' ? 'rounded-sm' : ''}`} 
                                 style={{ clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : undefined }} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Cor de Fundo</label>
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                          <input 
                            type="color" 
                            value={opt.content.style?.backgroundColor || "#3b82f6"}
                            onChange={(e) => updateOption(opt.id, { content: { ...opt.content, style: { ...opt.content.style, backgroundColor: e.target.value } } })}
                            className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-xs text-gray-500 flex-1 uppercase">{opt.content.style?.backgroundColor}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Cor da Borda</label>
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                          <input 
                            type="color" 
                            value={opt.content.style?.borderColor || "#000000"}
                            onChange={(e) => updateOption(opt.id, { content: { ...opt.content, style: { ...opt.content.style, borderColor: e.target.value } } })}
                            className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-xs text-gray-500 flex-1 uppercase">{opt.content.style?.borderColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea 
                      value={opt.content.value}
                      onChange={(e) => updateOption(opt.id, { content: { ...opt.content, value: e.target.value, style: { ...opt.content.style, height: undefined } } })}
                      className="w-full p-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px] resize-y text-sm"
                      placeholder="Texto da opção"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tamanho da Fonte</label>
                        <input 
                          type="number" 
                          min="12"
                          max="100"
                          value={opt.content.style?.fontSize || 18}
                          onChange={(e) => updateOption(opt.id, { content: { ...opt.content, style: { ...opt.content.style, fontSize: Number(e.target.value) } } })}
                          className="w-full p-2 text-sm rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Cor do Texto</label>
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                          <input 
                            type="color" 
                            value={opt.content.style?.color || "#000000"}
                            onChange={(e) => updateOption(opt.id, { content: { ...opt.content, style: { ...opt.content.style, color: e.target.value } } })}
                            className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-xs text-gray-500 flex-1 uppercase">{opt.content.style?.color || "#000"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Cor de Fundo</label>
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                          <input 
                            type="color" 
                            value={opt.content.style?.backgroundColor || "#ffffff"}
                            onChange={(e) => updateOption(opt.id, { content: { ...opt.content, style: { ...opt.content.style, backgroundColor: e.target.value } } })}
                            className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-xs text-gray-500 flex-1 uppercase">{opt.content.style?.backgroundColor || "#fff"}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Cor da Borda</label>
                        <div className="flex items-center gap-2 border border-gray-200 dark:border-zinc-700 rounded-md p-1 bg-white dark:bg-zinc-800">
                          <input 
                            type="color" 
                            value={opt.content.style?.borderColor || "#cccccc"}
                            onChange={(e) => updateOption(opt.id, { content: { ...opt.content, style: { ...opt.content.style, borderColor: e.target.value } } })}
                            className="h-6 w-6 rounded cursor-pointer border-0 p-0"
                          />
                          <span className="text-xs text-gray-500 flex-1 uppercase">{opt.content.style?.borderColor || "#ccc"}</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Espessura da Borda</label>
                        <input 
                          type="range" 
                          min="0"
                          max="10"
                          value={opt.content.style?.borderWidth || 0}
                          onChange={(e) => updateOption(opt.id, { content: { ...opt.content, style: { ...opt.content.style, borderWidth: Number(e.target.value) } } })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Ordering Section */}
              <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                <label className="text-xs text-gray-500 block mb-2">Ordem das Camadas</label>
                <div className="grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => onLayerChange('back')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Enviar para Trás"><ChevronsDown size={16} /></button>
                  <button type="button" onClick={() => onLayerChange('backward')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Recuar"><ArrowDown size={16} /></button>
                  <button type="button" onClick={() => onLayerChange('forward')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Avançar"><ArrowUp size={16} /></button>
                  <button type="button" onClick={() => onLayerChange('front')} className="p-2 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg flex justify-center text-gray-600 dark:text-gray-400" title="Trazer para Frente"><ChevronsUp size={16} /></button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

export default PropertiesPanel;
