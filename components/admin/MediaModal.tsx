"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Check, Music, Mic, Square, Play, RotateCcw, Loader2, Trash2, Folder, FolderPlus, MoreVertical, Edit2, ChevronRight, FolderOpen, Scissors } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

const AudioEditorModal = dynamic(() => import("./AudioEditorModal"), {
  ssr: false,
  loading: () => null
});

interface Media {
  id: string;
  url: string;
  name: string;
  type: string;
  folderId: string | null;
}

interface MediaFolder {
  id: string;
  name: string;
  type: string;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  type: 'image' | 'audio';
  initialItems?: string[];
}

export default function MediaModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  type, 
  initialItems = [] 
}: MediaModalProps) {
  // Common state
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'record'>('gallery');
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [editingAudio, setEditingAudio] = useState<Media | null>(null);

  // Folders state
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all'); // 'all', 'root', or folderId
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [draggedMediaId, setDraggedMediaId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const response = await fetch(`/api/media/folders?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pastas:', error);
    }
  };

  // Fetch media from API
  const fetchMedia = async (folderId?: string) => {
    setIsLoading(true);
    try {
      let url = `/api/media?type=${type}`;
      const fId = folderId || selectedFolderId;
      if (fId !== 'all') {
        url += `&folderId=${fId}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data);
      }
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset tab and fetch media when type changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('gallery');
      setSelectedFolderId('all');
      fetchFolders();
      fetchMedia('all');
    }
  }, [isOpen, type]);

  // Fetch media when selected folder changes
  useEffect(() => {
    if (isOpen && activeTab === 'gallery') {
      fetchMedia();
    }
  }, [selectedFolderId]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName, type }),
      });

      if (response.ok) {
        const folder = await response.json();
        setFolders(prev => [...prev, folder]);
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!editingFolderName.trim()) return;

    try {
      const response = await fetch('/api/media/folders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: folderId, name: editingFolderName }),
      });

      if (response.ok) {
        setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: editingFolderName } : f));
        setEditingFolderId(null);
      }
    } catch (error) {
      console.error('Erro ao renomear pasta:', error);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pasta? As mídias dentro dela não serão excluídas, apenas ficarão sem pasta.')) return;

    try {
      const response = await fetch(`/api/media/folders?id=${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        if (selectedFolderId === folderId) {
          setSelectedFolderId('all');
        }
      }
    } catch (error) {
      console.error('Erro ao excluir pasta:', error);
    }
  };

  // Upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('name', file.name);
        if (selectedFolderId && selectedFolderId !== 'all') {
          formData.append('folderId', selectedFolderId);
        }

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const newMedia = await response.json();
          // Só adiciona à lista se estivermos vendo "Tudo" ou a pasta específica
          if (selectedFolderId === 'all' || selectedFolderId === newMedia.folderId || (selectedFolderId === 'root' && !newMedia.folderId)) {
            setMediaItems(prev => [newMedia, ...prev]);
          }
        } else {
          const error = await response.json();
          alert(error.error || 'Erro no upload');
        }
      }
      setActiveTab('gallery');
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar arquivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMedia = async (e: React.MouseEvent, item: Media) => {
    e.stopPropagation();
    setShowDeleteConfirm({ id: item.id, name: item.name });
  };

  const confirmDeleteMedia = async () => {
    if (!showDeleteConfirm) return;
    
    const id = showDeleteConfirm.id;
    setDeletingId(id);
    setShowDeleteConfirm(null);
    
    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item.id !== id));
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir mídia');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMoveToFolder = async (mediaId: string, folderId: string | null) => {
    try {
      const response = await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mediaId, folderId }),
      });

      if (response.ok) {
        // Se estivermos em uma pasta específica (que não seja "Tudo"), removemos o item da lista
        if (selectedFolderId !== 'all') {
          setMediaItems(prev => prev.filter(item => item.id !== mediaId));
        } else {
          // Se estivermos em "Tudo", apenas atualizamos o folderId do item
          setMediaItems(prev => prev.map(item => 
            item.id === mediaId ? { ...item, folderId } : item
          ));
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao mover mídia');
      }
    } catch (error) {
      console.error('Erro ao mover mídia:', error);
    }
  };

  const handleSaveEditedAudio = async (blob: Blob, newName: string) => {
    setIsLoading(true);
    try {
      const file = new File([blob], newName, { type: blob.type });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'audio');
      formData.append('name', newName);
      if (selectedFolderId && selectedFolderId !== 'all') {
        formData.append('folderId', selectedFolderId);
      }

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newMedia = await response.json();
        if (selectedFolderId === 'all' || selectedFolderId === newMedia.folderId || (selectedFolderId === 'root' && !newMedia.folderId)) {
          setMediaItems(prev => [newMedia, ...prev]);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar áudio editado');
      }
    } catch (error) {
      console.error('Erro ao salvar áudio editado:', error);
      alert('Erro ao salvar áudio editado');
    } finally {
      setIsLoading(false);
    }
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Seu navegador não suporta gravação de áudio ou a conexão não é segura (HTTPS).");
        return;
      }
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
      console.error("Erro ao acessar microfone:", err);
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
    
    setIsLoading(true);
    try {
      const file = new File([audioBlob], `gravacao-${Date.now()}.webm`, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'audio');
      formData.append('name', `Gravação ${new Date().toLocaleTimeString()}`);
      if (selectedFolderId && selectedFolderId !== 'all') {
        formData.append('folderId', selectedFolderId);
      }

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newMedia = await response.json();
        // Só adiciona à lista se estivermos vendo "Tudo" ou a pasta específica
        if (selectedFolderId === 'all' || selectedFolderId === newMedia.folderId || (selectedFolderId === 'root' && !newMedia.folderId)) {
          setMediaItems(prev => [newMedia, ...prev]);
        }
        setActiveTab('gallery');
        resetRecording();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar gravação');
      }
    } catch (error) {
      console.error('Erro ao salvar gravação:', error);
      alert('Erro ao salvar gravação');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const title = type === 'image' ? 'Biblioteca de Imagens' : 'Biblioteca de Áudios';
  const Icon = type === 'image' ? ImageIcon : Music;

  return (
    <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Icon className="text-blue-500" />
            {title}
          </h2>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'gallery' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Galeria ({mediaItems.length})
          </button>
          {type === 'audio' && (
            <button
              type="button"
              onClick={() => setActiveTab('record')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'record' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Gravar
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload' 
                ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Fazer Upload
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden min-h-[450px]">
          {/* Sidebar de Pastas */}
          {activeTab === 'gallery' && (
            <div className="w-48 border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="p-3 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pastas</span>
                <button 
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded text-blue-500 transition-colors"
                  title="Nova Pasta"
                >
                  <FolderPlus size={16} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedFolderId('all')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolderId === 'all' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <FolderOpen size={16} />
                  Todas
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedFolderId('root')}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverFolderId('root');
                  }}
                  onDragLeave={() => setDragOverFolderId(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverFolderId(null);
                    if (draggedMediaId) {
                      handleMoveToFolder(draggedMediaId, null);
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedFolderId === 'root' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                      : dragOverFolderId === 'root'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 ring-2 ring-blue-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <ChevronRight size={16} />
                  Sem Pasta
                </button>

                <div className="h-px bg-gray-200 dark:border-zinc-800 my-2" />

                {folders.map(folder => (
                  <div key={folder.id} className="group relative">
                    {editingFolderId === folder.id ? (
                      <div className="px-2 py-1">
                        <input
                          autoFocus
                          className="w-full text-sm bg-white dark:bg-zinc-800 border border-blue-500 rounded px-2 py-1 focus:outline-none"
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          onBlur={() => handleRenameFolder(folder.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleRenameFolder(folder.id);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedFolderId(folder.id)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverFolderId(folder.id);
                        }}
                        onDragLeave={() => setDragOverFolderId(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverFolderId(null);
                          if (draggedMediaId) {
                            handleMoveToFolder(draggedMediaId, folder.id);
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors pr-8 ${
                          selectedFolderId === folder.id 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                            : dragOverFolderId === folder.id
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 ring-2 ring-blue-500'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Folder size={16} />
                        <span className="truncate">{folder.name}</span>
                      </button>
                    )}
                    
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolderId(folder.id);
                          setEditingFolderName(folder.name);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-400 hover:text-blue-500"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                {isCreatingFolder && (
                  <form onSubmit={handleCreateFolder} className="px-2 py-1">
                    <input
                      autoFocus
                      placeholder="Nome da pasta..."
                      className="w-full text-sm bg-white dark:bg-zinc-800 border border-blue-500 rounded px-2 py-1 focus:outline-none"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onBlur={() => {
                        if (!newFolderName.trim()) setIsCreatingFolder(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateFolder(e);
                        }
                      }}
                    />
                  </form>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 flex flex-col relative min-w-0">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            )}

            {activeTab === 'gallery' ? (
              type === 'image' ? (
                mediaItems.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {mediaItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="group relative aspect-square"
                        draggable
                        onDragStart={() => setDraggedMediaId(item.id)}
                        onDragEnd={() => setDraggedMediaId(null)}
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(item.url)}
                          className="w-full h-full border-2 border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Image src={item.url} alt={item.name} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteMedia(e, item)}
                          disabled={deletingId === item.id}
                          className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          {deletingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={48} className="mb-4 opacity-50" />
                    <p>Nenhuma imagem nesta pasta.</p>
                    <button type="button" onClick={() => setActiveTab('upload')} className="mt-4 text-blue-500 hover:underline">Fazer upload agora</button>
                  </div>
                )
              ) : (
                mediaItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mediaItems.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-3 p-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-800/50 hover:border-blue-500 transition-all group relative cursor-move"
                        draggable
                        onDragStart={() => setDraggedMediaId(item.id)}
                        onDragEnd={() => setDraggedMediaId(null)}
                      >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                          <Music size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate pr-8">{item.name}</p>
                          <audio src={item.url} controls className="h-8 w-full mt-1 scale-90 origin-left" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => onSelect(item.url)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            title="Selecionar Áudio"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAudio(item);
                            }}
                            className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                            title="Editar Áudio"
                          >
                            <Scissors size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMedia(e, item)}
                            disabled={deletingId === item.id}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                            title="Excluir Áudio"
                          >
                            {deletingId === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <Music size={48} className="mb-4 opacity-50" />
                    <p>Nenhum áudio nesta pasta.</p>
                    <div className="flex gap-4 mt-4">
                      <button type="button" onClick={() => setActiveTab('record')} className="text-blue-500 hover:underline">Gravar um áudio</button>
                      <span>ou</span>
                      <button type="button" onClick={() => setActiveTab('upload')} className="text-blue-500 hover:underline">Fazer upload</button>
                    </div>
                  </div>
                )
              )
            ) : activeTab === 'record' && type === 'audio' ? (
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
                    type="button"
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
                      type="button"
                      onClick={resetRecording}
                      className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-zinc-700 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <RotateCcw size={18} />
                      Gravar Novamente
                    </button>
                    <button
                      type="button"
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
            <div 
              className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-zinc-700'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className={`mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Arraste e solte {type === 'image' ? 'imagens' : 'áudios'} aqui
              </p>
              <p className="text-sm text-gray-500 mt-2 mb-6 text-center">
                {type === 'image' 
                  ? 'Formatos suportados: PNG, JPG, GIF, WebP' 
                  : 'Formatos suportados: MP3, WAV, WebM, OGG'}
              </p>
              <label className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-colors shadow-lg font-medium">
                Escolher Arquivos
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept={type === 'image' ? 'image/*' : 'audio/*'}
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </label>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[500] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-zinc-800">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Tem certeza que deseja excluir <strong>{showDeleteConfirm.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteMedia}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/20"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
       )}

       {/* Modal de Edição de Áudio */}
       {editingAudio && (
         <AudioEditorModal
           isOpen={!!editingAudio}
           onClose={() => setEditingAudio(null)}
           audioUrl={editingAudio.url}
           originalName={editingAudio.name}
           onSave={handleSaveEditedAudio}
         />
       )}
     </div>
   );
 }
