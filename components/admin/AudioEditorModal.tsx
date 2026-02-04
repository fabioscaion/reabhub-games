"use client";

import { useState, useEffect, useRef } from "react";
import { X, Play, Pause, Scissors, Save, Loader2, RotateCcw } from "lucide-react";

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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen && audioUrl) {
      loadAudio();
      setNewName(originalName.replace(/\.[^/.]+$/, "") + "-editado");
    }
    return () => {
      stopPlayback();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isOpen, audioUrl]);

  const loadAudio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioBufferRef.current = audioBuffer;
      
      setDuration(audioBuffer.duration);
      setStartTime(0);
      setEndTime(audioBuffer.duration);
      drawWaveform(audioBuffer);
    } catch (error) {
      console.error("Erro ao carregar áudio:", error);
      alert("Erro ao carregar o áudio para edição.");
    } finally {
      setIsLoading(false);
    }
  };

  const drawWaveform = (buffer: AudioBuffer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 1;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  };

  const startPlayback = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    stopPlayback();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    
    const playOffset = Math.max(startTime, currentTime);
    const durationToPlay = Math.max(0, endTime - playOffset);

    if (durationToPlay <= 0) {
      setCurrentTime(startTime);
      return;
    }

    source.start(0, playOffset, durationToPlay);
    sourceNodeRef.current = source;
    startTimeRef.current = audioContextRef.current.currentTime - playOffset;
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
      if (currentTime >= endTime) {
        setCurrentTime(startTime);
      }
    };

    updateProgress();
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
  };

  const updateProgress = () => {
    if (!isPlaying || !audioContextRef.current) return;

    const current = audioContextRef.current.currentTime - startTimeRef.current;
    setCurrentTime(current);

    if (current >= endTime) {
      stopPlayback();
      setCurrentTime(startTime);
    } else {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleSave = async () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    
    setIsSaving(true);
    try {
      const sampleRate = audioBufferRef.current.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const frameCount = endSample - startSample;
      
      if (frameCount <= 0) {
        alert("Seleção inválida");
        return;
      }

      const editedBuffer = audioContextRef.current.createBuffer(
        audioBufferRef.current.numberOfChannels,
        frameCount,
        sampleRate
      );

      for (let channel = 0; channel < audioBufferRef.current.numberOfChannels; channel++) {
        const originalData = audioBufferRef.current.getChannelData(channel);
        const editedData = editedBuffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          editedData[i] = originalData[startSample + i];
        }
      }

      // Convert AudioBuffer to WebM blob (smaller and web-friendly)
      const blob = await audioBufferToWebmBlob(editedBuffer);
      await onSave(blob, newName + ".webm");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar áudio:", error);
      alert("Erro ao salvar o áudio editado.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to convert AudioBuffer to WebM using MediaRecorder
  const audioBufferToWebmBlob = (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Since MediaRecorder needs a MediaStream, we use a regular AudioContext
      // to play the buffer into a MediaStreamDestination.
      const recordCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const recordSource = recordCtx.createBufferSource();
      recordSource.buffer = buffer;
      
      const recordDest = recordCtx.createMediaStreamDestination();
      recordSource.connect(recordDest);
      
      const recorder = new MediaRecorder(recordDest.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const recordChunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordChunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        resolve(new Blob(recordChunks, { type: 'audio/webm' }));
        recordCtx.close();
      };
      
      recorder.onerror = (e) => {
        reject(e);
        recordCtx.close();
      };
      
      recorder.start();
      recordSource.start();
      recordSource.onended = () => {
        // Give it a tiny bit of time to ensure all data is captured
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 100);
      };
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Scissors className="text-blue-500" size={20} />
            Editar Áudio
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {isLoading ? (
            <div className="h-48 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Carregando áudio...</p>
            </div>
          ) : (
            <>
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

              <div className="relative bg-gray-50 dark:bg-zinc-950 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
                <canvas 
                  ref={canvasRef} 
                  width={600} 
                  height={120} 
                  className="w-full h-[120px]"
                />
                
                {/* Playhead */}
                <div 
                  className="absolute top-4 bottom-4 w-px bg-red-500 z-10"
                  style={{ left: `${(currentTime / duration) * 100}%`, marginLeft: '1rem', marginRight: '1rem', width: 'calc(100% - 2rem)' }}
                >
                  <div className="absolute top-0 left-0 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-red-500" />
                </div>

                {/* Selection Range Overlay */}
                <div 
                  className="absolute top-4 bottom-4 bg-blue-500/10 border-x border-blue-500/30"
                  style={{ 
                    left: `calc(${(startTime / duration) * 100}% + 1rem)`, 
                    width: `calc(${((endTime - startTime) / duration) * 100}%)` 
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Início</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min={0} 
                      max={duration} 
                      step={0.01} 
                      value={startTime} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setStartTime(Math.min(val, endTime - 0.1));
                        setCurrentTime(val);
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-16">{formatTime(startTime)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Fim</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min={0} 
                      max={duration} 
                      step={0.01} 
                      value={endTime} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setEndTime(Math.max(val, startTime + 0.1));
                        setCurrentTime(val);
                      }}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-16">{formatTime(endTime)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                  >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                  </button>
                  <button
                    onClick={() => {
                      stopPlayback();
                      setCurrentTime(startTime);
                    }}
                    className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                    title="Reiniciar Seleção"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Duração Final</p>
                  <p className="text-xl font-mono font-bold text-blue-600">{formatTime(endTime - startTime)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
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
