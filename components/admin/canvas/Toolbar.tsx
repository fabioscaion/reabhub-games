import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Type, 
  Edit3, 
  Square, 
  Music, 
  MousePointerClick, 
  LayoutGrid, 
  Gamepad2, 
  BrainCircuit, 
  X, 
  Puzzle, 
  ArrowRightLeft, 
  Search,
  Palette
} from 'lucide-react';
import { Level, Option } from '@/types/game';
import { generateId } from '@/lib/utils';

interface ToolbarProps {
  level: Level;
  editingView: 'level' | 'success' | 'error';
  onAddStaticElement: (type: "text" | "image" | "shape" | "audio" | "input", initialStyle?: any, initialValue?: string) => void;
  onAddOption: (type: "text" | "image" | "shape", initialStyle?: any, initialValue?: string) => void;
  onOpenImageLibrary: (callback: (base64: string) => void) => void;
  onOpenAudioLibrary: (callback: (base64: string) => void) => void;
  onShowLogicEditor: (show: boolean) => void;
  onUpdateLevel: (updates: Partial<Level>) => void;
  onSetSelectedItem: (item: { type: "option" | "static"; id: string } | null) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  level,
  editingView,
  onAddStaticElement,
  onAddOption,
  onOpenImageLibrary,
  onOpenAudioLibrary,
  onShowLogicEditor,
  onUpdateLevel,
  onSetSelectedItem,
  onFileUpload
}) => {
  const [isGamesPanelOpen, setIsGamesPanelOpen] = useState(false);
  const [isWordHuntConfigOpen, setIsWordHuntConfigOpen] = useState(false);
  const [wordHuntText, setWordHuntText] = useState("");
  const [wordHuntShowChecklist, setWordHuntShowChecklist] = useState(true);

  const addMemoryPair = () => {
    const matchId = `pair-${Math.floor(Math.random() * 1000)}`;
    const id1 = generateId();
    const id2 = generateId();
    
    const opt1: Option = {
      id: id1,
      content: { 
        type: 'image', 
        value: '', 
        style: { width: 150, height: 150, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#3b82f6' } 
      },
      isCorrect: false,
      matchId,
      position: { x: 40, y: 50 }
    };

    const opt2: Option = {
      id: id2,
      content: { 
        type: 'image', 
        value: '', 
        style: { width: 150, height: 150, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#3b82f6' } 
      },
      isCorrect: false,
      matchId,
      position: { x: 60, y: 50 }
    };

    onUpdateLevel({ options: [...level.options, opt1, opt2] });
    onSetSelectedItem({ type: "option", id: id1 });
    setIsGamesPanelOpen(false);
  };

  const addSequenceSet = () => {
    const id1 = generateId();
    const id2 = generateId();
    const id3 = generateId();
    
    const baseStyle = { width: 150, height: 150, backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#f97316' };

    const opt1: Option = {
      id: id1,
      content: { type: 'image', value: '', style: baseStyle },
      isCorrect: false,
      order: 1,
      position: { x: 30, y: 50 }
    };

    const opt2: Option = {
      id: id2,
      content: { type: 'image', value: '', style: baseStyle },
      isCorrect: false,
      order: 2,
      position: { x: 50, y: 50 }
    };

    const opt3: Option = {
      id: id3,
      content: { type: 'image', value: '', style: baseStyle },
      isCorrect: false,
      order: 3,
      position: { x: 70, y: 50 }
    };

    onUpdateLevel({ options: [...level.options, opt1, opt2, opt3] });
    onSetSelectedItem({ type: "option", id: id1 });
    setIsGamesPanelOpen(false);
  };

  const generateWordHunt = () => {
    if (!wordHuntText.trim()) return;
    
    const lines = wordHuntText.split(',').filter(l => l.trim()).sort(() => Math.random() - 0.5);
    if (lines.length === 0) return;

    const total = lines.length;
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    
    const hasExplicitTargets = lines.some(l => l.trim().startsWith('*'));

    const newOptions: Option[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      let text = trimmedLine;
      let isCorrect = true;

      if (hasExplicitTargets) {
          if (trimmedLine.startsWith('*')) {
              text = trimmedLine.substring(1);
              isCorrect = true;
          } else {
              isCorrect = false;
          }
      }

      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = 5 + (col * (90/cols)) + (90/cols/2);
      const y = 10 + (row * (80/rows)) + (80/rows/2);
      
      newOptions.push({
        id: generateId(),
        content: { 
            type: 'text', 
            value: text,
            style: {
                backgroundColor: '#ffffff',
                color: '#000000',
                borderWidth: 1,
                borderColor: '#e5e7eb',
                fontSize: 16,
                fontWeight: 'bold',
            }
        },
        position: { x, y },
        isCorrect: isCorrect
      });
    });
    
    onUpdateLevel({ 
        options: [...level.options, ...newOptions],
        showChecklist: wordHuntShowChecklist 
    });
    setWordHuntText("");
    setIsWordHuntConfigOpen(false);
    setIsGamesPanelOpen(false);
  };

  const currentBgColor = (editingView === 'level' ? level.style?.backgroundColor : (editingView === 'success' ? level.successScreen?.style?.backgroundColor : level.errorScreen?.style?.backgroundColor)) || '#ffffff';

  return (
    <div className="w-24 flex flex-col gap-2 bg-white dark:bg-zinc-900 p-2 rounded-xl border border-gray-200 dark:border-zinc-800 items-center py-3 h-fit shadow-xl">
      <div className="w-full">
        <p className="text-[10px] text-center text-gray-400 font-medium mb-2 uppercase tracking-wider">Adicionar</p>
        <div className="grid grid-cols-2 gap-1">
          <button 
            type="button"
            onClick={() => onOpenImageLibrary((base64) => onAddStaticElement("image", undefined, base64))}
            className="p-2 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors tooltip group relative flex justify-center"
          >
            <ImageIcon size={20} />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Imagem</span>
          </button>
          <button 
            type="button"
            onClick={() => onAddStaticElement("text")}
            className="p-2 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors tooltip group relative flex justify-center"
          >
            <Type size={20} />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Texto</span>
          </button>
          <button 
            type="button"
            onClick={() => onAddStaticElement("input")}
            className="p-2 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors tooltip group relative flex justify-center"
          >
            <Edit3 size={20} />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Campo</span>
          </button>
          <button 
            type="button"
            onClick={() => onAddStaticElement("shape")}
            className="p-2 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors tooltip group relative flex justify-center"
          >
            <Square size={20} />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Forma</span>
          </button>
          <button 
            type="button"
            onClick={() => onOpenAudioLibrary((base64) => onAddStaticElement("audio", undefined, base64))}
            className="p-2 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors tooltip group relative flex justify-center col-span-2"
          >
            <Music size={20} />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Áudio na Cena</span>
          </button>
        </div>
      </div>

      {(editingView === 'level') && (
        <>
          <div className="h-px w-12 bg-gray-100 dark:bg-zinc-800 my-1" />
          <div className="w-full">
            <p className="text-[10px] text-center text-gray-400 font-medium mb-2 uppercase tracking-wider">Interação</p>
            <div className="grid grid-cols-2 gap-1">
              {(level.type === 'game' || !level.type) && (
                <button 
                  type="button"
                  onClick={() => onAddOption("text")}
                  className="p-2 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/10 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors tooltip group relative flex justify-center col-span-2"
                >
                  <MousePointerClick size={20} />
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Opção Interativa</span>
                </button>
              )}
              {level.type === 'menu' && (
                <button 
                  type="button"
                  onClick={() => onAddOption("text")}
                  className="p-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors tooltip group relative flex justify-center col-span-2"
                >
                  <LayoutGrid size={20} />
                  <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Botão de Menu</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="h-px w-12 bg-gray-100 dark:bg-zinc-800 my-1" />
          <div className="w-full relative">
            <p className="text-[10px] text-center text-gray-400 font-medium mb-2 uppercase tracking-wider">Extras</p>
            <div className="grid grid-cols-2 gap-1">
              <button 
                type="button"
                onClick={() => setIsGamesPanelOpen(!isGamesPanelOpen)}
                className={`p-2 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/10 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded-lg transition-colors tooltip group flex justify-center ${isGamesPanelOpen ? 'ring-2 ring-pink-500 bg-pink-100 dark:bg-pink-900/40' : ''}`}
              >
                <Gamepad2 size={20} />
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Jogos</span>
              </button>

              <button 
                type="button"
                onClick={() => onShowLogicEditor(true)}
                className="p-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors tooltip group relative flex justify-center"
              >
                <BrainCircuit size={20} />
                <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Lógica</span>
              </button>
            </div>

            {isGamesPanelOpen && (
              <div className="absolute left-full top-0 ml-3 z-[100] bg-white dark:bg-zinc-900 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-xl flex flex-col gap-3 w-56 animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Modelos de Jogos</span>
                  <button onClick={() => { setIsGamesPanelOpen(false); setIsWordHuntConfigOpen(false); }} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                </div>
                
                {isWordHuntConfigOpen ? (
                   <div className="flex flex-col gap-2">
                      <textarea
                         value={wordHuntText}
                         onChange={(e) => setWordHuntText(e.target.value)}
                         placeholder="Digite as palavras separadas por vírgula. Use * antes da palavra para marcar apenas algumas como corretas (opcional)."
                         className="w-full text-xs p-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 h-32 resize-none"
                      />
                      <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                          <input 
                              type="checkbox" 
                              checked={wordHuntShowChecklist}
                              onChange={(e) => setWordHuntShowChecklist(e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Exibir lista de palavras
                      </label>
                      <div className="flex gap-2">
                          <button 
                              type="button"
                              onClick={() => setIsWordHuntConfigOpen(false)}
                              className="flex-1 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                              Cancelar
                          </button>
                          <button 
                              type="button"
                              onClick={generateWordHunt}
                              className="flex-1 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          >
                              Gerar
                          </button>
                      </div>
                   </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={addMemoryPair}
                      className="flex items-center gap-3 p-2 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg text-left group transition-colors"
                    >
                      <div className="p-1.5 bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 rounded-md group-hover:scale-110 transition-transform">
                        <Puzzle size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Jogo da Memória</span>
                        <span className="text-[10px] text-gray-400">Adicionar par de cartas</span>
                      </div>
                    </button>

                    <button 
                      onClick={addSequenceSet}
                      className="flex items-center gap-3 p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg text-left group transition-colors"
                    >
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-md group-hover:scale-110 transition-transform">
                        <ArrowRightLeft size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Sequenciamento</span>
                        <span className="text-[10px] text-gray-400">Adicionar 3 elementos</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setIsWordHuntConfigOpen(true)}
                      className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-left group transition-colors"
                    >
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md group-hover:scale-110 transition-transform">
                        <Search size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">Caça-Palavras</span>
                        <span className="text-[10px] text-gray-400">Gerar grade de palavras</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <div className="h-px w-12 bg-gray-100 dark:bg-zinc-800 my-1" />
      
      <div className="w-full">
        <p className="text-[10px] text-center text-gray-400 font-medium mb-2 uppercase tracking-wider">Cena</p>
        <div className="grid grid-cols-2 gap-1">
          <label className="p-2 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer group relative flex justify-center">
            <Music size={20} className={level.backgroundAudio ? "text-green-500" : ""} />
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden"
              onChange={(e) => onFileUpload(e, (base64) => onUpdateLevel({ backgroundAudio: base64 }))}
            />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Música</span>
          </label>
          
          <label className="p-2 text-gray-600 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer group relative flex justify-center">
            <Palette size={20} style={{ color: currentBgColor }} />
            <input 
              type="color" 
              className="hidden" 
              value={currentBgColor}
              onChange={(e) => {
                if (editingView === 'success') {
                  onUpdateLevel({ successScreen: { ...(level.successScreen || {}), style: { ...(level.successScreen?.style || {}), backgroundColor: e.target.value } } });
                } else if (editingView === 'error') {
                  onUpdateLevel({ errorScreen: { ...(level.errorScreen || {}), style: { ...(level.errorScreen?.style || {}), backgroundColor: e.target.value } } });
                } else {
                  onUpdateLevel({ style: { ...level.style, backgroundColor: e.target.value } });
                }
              }}
            />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Cor</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
