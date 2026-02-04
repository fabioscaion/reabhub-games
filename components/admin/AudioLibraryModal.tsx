"use client";

import { useState, useEffect, useRef } from "react";
import { X, Mic, Square, Play, Trash2, Check, Music, Upload, RotateCcw } from "lucide-react";
import { processFiles, generateId } from "@/lib/utils";

interface AudioLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (base64: string) => void;
  initialAudios?: string[];
}

export default function AudioLibraryModal({ isOpen, onClose, onSelect, initialAudios = [] }: AudioLibraryModalProps) {
  const [audios, setAudios] = useState<{ id: string; value: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'gallery' | 'record' | 'upload'>('gallery');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize audios from props
  useEffect(() => {
    if (initialAudios.length > 0) {
      setAudios(prev => {
        const existingValues = new Set(prev.map(a => a.value));
        const newAudios = [...prev];
        initialAudios.forEach((audio, idx) => {
          if (audio && !existingValues.has(audio)) {
            newAudios.push({
              id: `init-${idx}-${Date.now()}`,
              value: audio,
              name: `Áudio ${newAudios.length + 1}`
            });
            existingValues.add(audio);
          }
        });
        return newAudios;
      });
    }
  }, [initialAudios, isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Erro ao acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const saveRecording = async () => {
    if (!audioBlob) return;

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newAudio = {
        id: generateId(),
        value: base64,
        name: `Gravação ${new Date().toLocaleTimeString()}`
      };
      setAudios(prev => [newAudio, ...prev]);
      setActiveTab('gallery');
      resetRecording();
    };
  };

  const handleFileUpload = async (files: FileList | null) => {
    await processFiles(files, 'audio/', (base64) => {
      const newAudio = {
        id: generateId(),
        value: base64,
        name: `Upload ${audios.length + 1}`
      };
      setAudios(prev => [newAudio, ...prev]);
      setActiveTab('gallery');
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Music className="text-blue-500" />
            Biblioteca de Áudios
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'gallery' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Galeria ({audios.length})
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'record' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Gravar
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Upload
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[350px] flex flex-col">
          {activeTab === 'gallery' ? (
            audios.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audios.map((audio) => (
                  <div 
                    key={audio.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-800/50 hover:border-blue-500 transition-all group"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                      <Music size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{audio.name}</p>
                      <audio src={audio.value} controls className="h-8 w-full mt-1 scale-90 origin-left" />
                    </div>
                    <button
                      onClick={() => onSelect(audio.value)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      title="Selecionar Áudio"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Music size={48} className="mb-4 opacity-50" />
                <p>Nenhum áudio na biblioteca.</p>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setActiveTab('record')} className="text-blue-500 hover:underline">Gravar um áudio</button>
                  <span>ou</span>
                  <button onClick={() => setActiveTab('upload')} className="text-blue-500 hover:underline">Fazer upload</button>
                </div>
              </div>
            )
          ) : activeTab === 'record' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              {!audioURL ? (
                <>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all ${isRecording ? 'bg-red-100 dark:bg-red-900/30 text-red-600 animate-pulse scale-110' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                    <Mic size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">
                    {isRecording ? "Gravando..." : "Pronto para gravar"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs">
                    {isRecording ? "Clique no botão para parar a gravação." : "Clique no botão abaixo para iniciar a gravação do seu áudio."}
                  </p>
                  
                  {isRecording && (
                    <div className="text-3xl font-mono font-bold text-red-500 mb-8">
                      {formatTime(recordingTime)}
                    </div>
                  )}

                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <Check size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Gravação Concluída</h3>
                  <div className="w-full max-w-md bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 mb-8">
                    <audio src={audioURL} controls className="w-full" />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={resetRecording}
                      className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-zinc-700 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <RotateCcw size={18} />
                      Gravar Novamente
                    </button>
                    <button
                      onClick={saveRecording}
                      className="flex items-center gap-2 px-8 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg font-medium"
                    >
                      <Check size={18} />
                      Salvar na Galeria
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-8">
              <Upload size={48} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Fazer upload de áudio</p>
              <p className="text-sm text-gray-500 mt-2 mb-6 text-center">Formatos suportados: MP3, WAV, WebM, OGG</p>
              <label className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-colors shadow-lg font-medium">
                Escolher Arquivos
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
