"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Scissors, Save, Loader2, RotateCcw, MousePointer2 } from "lucide-react";
// @ts-ignore
import WaveformPlaylist from "waveform-playlist";
import "waveform-playlist/styles/playlist.css";

const EDITOR_STYLES = `
  .playlist .playlist-tracks {
    background: transparent !important;
  }
  .playlist .channel {
    background: transparent !important;
  }
  .playlist .cursor {
    background: #ef4444 !important;
  }
  .playlist .selection.point {
    background: #3b82f6 !important;
  }
  .playlist .selection.area {
    background: rgba(59, 130, 246, 0.2) !important;
  }
`;

interface AudioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioUrl: string;
  originalName: string;
  onSave: (blob: Blob, newName: string) => Promise<void>;
}

export default function AudioEditorModal({
  isOpen,
  onClose,
  audioUrl,
  originalName,
  onSave
}: AudioEditorModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const playlistRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const eeRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && audioUrl) {
      setAudioBuffer(null); // Reset buffer when opening new audio
      if (containerRef.current) {
        initPlaylist();
      } else {
        const timeoutId = setTimeout(() => {
          if (containerRef.current) {
            initPlaylist();
          } else {
            console.error("Container ref não encontrado");
            setIsLoading(false);
          }
        }, 100);
        return () => clearTimeout(timeoutId);
      }
      
      setNewName(originalName.replace(/\.[^/.]+$/, "") + "-editado");
    }

    return () => {
      if (playlistRef.current) {
        try {
          playlistRef.current.getAudioContext().close();
        } catch (e) {
          console.error("Erro ao fechar AudioContext:", e);
        }
      }
    };
  }, [isOpen, audioUrl]);

  const [selection, setSelection] = useState<{ start: number, end: number } | null>(null);

  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const initPlaylist = async (buffer?: AudioBuffer) => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    try {
      let currentBuffer = buffer;
      let duration = 0;
      let sampleRate = 44100;

      if (!currentBuffer) {
        const proxyUrl = `/api/proxy/audio?url=${encodeURIComponent(audioUrl)}`;
        const response = await fetch(proxyUrl);
        const arrayBuffer = await response.arrayBuffer();
        const tempCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        currentBuffer = await tempCtx.decodeAudioData(arrayBuffer);
        setAudioBuffer(currentBuffer);
        await tempCtx.close();
      }

      duration = currentBuffer.duration;
      sampleRate = currentBuffer.sampleRate;

      // Calcular samplesPerPixel para ocupar 100% da largura
      const containerWidth = containerRef.current?.clientWidth || 800;
      const idealSamplesPerPixel = Math.floor((duration * sampleRate) / containerWidth);
      
      // Limpar container antes de inicializar
      if (containerRef.current) containerRef.current.innerHTML = '';
      
      const playlist = WaveformPlaylist({
        container: containerRef.current,
        timescale: true,
        state: 'select',
        waveHeight: 120,
        colors: {
          waveOutlineColor: '#3b82f6',
          timeColor: '#94a3b8',
          fadeColor: '#000000'
        },
        controls: {
          show: false,
          width: 0
        },
        samplesPerPixel: idealSamplesPerPixel,
        zoomLevels: [idealSamplesPerPixel]
      });

      eeRef.current = playlist.getEventEmitter();
      playlistRef.current = playlist;

      // Carregar o buffer na playlist
      playlist.load([
        {
          src: currentBuffer,
          name: originalName,
        }
      ]).then(() => {
        setIsLoading(false);
      }).catch((err: any) => {
        console.error("Erro ao carregar buffer:", err);
        setIsLoading(false);
      });

      // Listen for time updates
      eeRef.current.on('timeupdate', (time: number) => {
        setCurrentTime(time);
      });

      eeRef.current.on('finished', () => {
        setIsPlaying(false);
      });

      eeRef.current.on('select', (start: number, end: number) => {
        if (start === end) {
          setSelection(null);
        } else {
          setSelection({ start, end });
        }
      });

    } catch (error) {
      console.error("Erro ao inicializar playlist:", error);
      alert("Erro ao inicializar o editor de áudio.");
      setIsLoading(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      eeRef.current.emit('pause');
      setIsPlaying(false);
    } else {
      eeRef.current.emit('play');
      setIsPlaying(true);
    }
  };

  const handlePlaySelection = () => {
    if (!eeRef.current) return;
    
    if (selection && selection.start !== selection.end) {
      eeRef.current.emit('play', selection.start, selection.end);
      setIsPlaying(true);
    } else {
      eeRef.current.emit('play');
      setIsPlaying(true);
    }
  };

  const handleTrim = async () => {
    if (!audioBuffer || !selection) return;

    const start = selection.start;
    const end = selection.end;
    const sampleRate = audioBuffer.sampleRate;
    
    const startSample = Math.floor(start * sampleRate);
    const endSample = Math.floor(end * sampleRate);
    const frameCount = endSample - startSample;

    if (frameCount <= 0) return;

    setIsLoading(true);
    try {
      // Usar o AudioContext da playlist se disponível, ou criar um novo
      const ctx = playlistRef.current?.getAudioContext() || new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Criar um novo buffer para o trecho recortado
      const newBuffer = ctx.createBuffer(
        audioBuffer.numberOfChannels,
        frameCount,
        sampleRate
      );

      // Copiar os dados de cada canal
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channelData = audioBuffer.getChannelData(i);
        const newChannelData = newBuffer.getChannelData(i);
        newChannelData.set(channelData.slice(startSample, endSample));
      }

      // Atualizar o estado e re-inicializar a playlist
      setAudioBuffer(newBuffer);
      setSelection(null); // Limpar seleção após o recorte
      
      // Fechar a playlist atual antes de re-inicializar
      if (playlistRef.current) {
        try {
          playlistRef.current.getAudioContext().close();
        } catch (e) {
          console.error("Erro ao fechar AudioContext:", e);
        }
      }

      // Re-inicializar com o novo buffer (o zoom de 100% será recalculado)
      await initPlaylist(newBuffer);
    } catch (error) {
      console.error("Erro ao recortar áudio:", error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!eeRef.current || !playlistRef.current) return;
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    if (!eeRef.current || !playlistRef.current || !newName.trim() || !audioBuffer) return;
    
    setIsSaving(true);
    setShowSaveModal(false);
    try {
      console.log("Iniciando exportação do áudio...");
      
      const bufferToWave = (abuffer: AudioBuffer) => {
        const numOfChan = abuffer.numberOfChannels;
        const length = abuffer.length * numOfChan * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);
        const channels = [];
        let i;
        let sample;
        let offset = 0;
        let pos = 0;

        // Escrever cabeçalho WAVE
        setUint32(0x46464952); // "RIFF"
        setUint32(length - 8); // tamanho do arquivo - 8
        setUint32(0x45564157); // "WAVE"

        setUint32(0x20746d66); // "fmt " chunk
        setUint32(16); // comprimento do chunk
        setUint16(1); // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // byte rate
        setUint16(numOfChan * 2); // block align
        setUint16(16); // bits por amostra

        setUint32(0x61746164); // "data" chunk
        setUint32(length - pos - 4); // tamanho do chunk

        // Escrever dados de áudio intercalados
        for (i = 0; i < abuffer.numberOfChannels; i++) {
          channels.push(abuffer.getChannelData(i));
        }

        while (pos < length) {
          for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF); // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
          }
          offset++;
        }

        return new Blob([buffer], { type: "audio/wav" });

        function setUint16(data: number) {
          view.setUint16(pos, data, true);
          pos += 2;
        }

        function setUint32(data: number) {
          view.setUint32(pos, data, true);
          pos += 4;
        }
      };

      const blob = bufferToWave(audioBuffer);
      console.log("Blob gerado com sucesso, salvando...");
      
      await onSave(blob, newName.trim() + ".wav");
      onClose();
      
    } catch (error) {
      console.error("Erro ao exportar áudio:", error);
      alert("Erro ao processar o áudio para salvamento.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <style>{EDITOR_STYLES}</style>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-5xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal de Nome do Arquivo */}
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Salvar Áudio</h3>
              </div>
              <div className="p-4 space-y-3">
                <label className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                  Nome do arquivo
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Digite o nome do arquivo..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-100"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmSave();
                    if (e.key === 'Escape') setShowSaveModal(false);
                  }}
                />
              </div>
              <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmSave}
                  disabled={!newName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Scissors className="text-blue-500" size={20} />
            Editar Áudio
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6 relative">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white/80 dark:bg-zinc-900/80 flex flex-col items-center justify-center text-gray-500 backdrop-blur-sm">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Carregando editor de áudio...</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome do Arquivo</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Nome do novo áudio"
            />
          </div>

          <div className="relative bg-white dark:bg-zinc-950 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
            <div ref={containerRef} className="w-full min-h-[200px]" />
            <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 pointer-events-none bg-white/50 dark:bg-zinc-950/50 px-1 rounded">
              Clique e arraste para selecionar uma área
            </div>
          </div>

          <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    title={isPlaying ? "Pausar" : "Reproduzir"}
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (eeRef.current) {
                        eeRef.current.emit('stop');
                        setIsPlaying(false);
                      }
                    }}
                    disabled={isLoading}
                    className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
                    title="Parar"
                  >
                    <RotateCcw size={20} />
                  </button>

                  <div className="w-px h-8 bg-gray-200 dark:bg-zinc-800 mx-1" />

                  <button
                    type="button"
                    onClick={handlePlaySelection}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 font-medium text-sm"
                    title="Reproduzir Seleção"
                  >
                    <Play size={16} />
                    Seleção
                  </button>

                  <button
                    type="button"
                    onClick={handleTrim}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-50 font-medium text-sm"
                    title="Recortar para a Seleção"
                  >
                    <Scissors size={18} />
                    Recortar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (eeRef.current) {
                        eeRef.current.emit('select', 0, 0);
                        setSelection(null);
                      }
                    }}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                    title="Limpar Seleção"
                  >
                    <MousePointer2 size={18} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Tempo Atual</p>
                  <p className="text-xl font-mono font-bold text-blue-600">{formatTime(currentTime)}</p>
                </div>
              </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving || !newName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Salvar Novo Áudio
          </button>
        </div>
      </div>
    </div>
  );
}
