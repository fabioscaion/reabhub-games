"use client";

import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Check } from "lucide-react";
import Image from "next/image";
import { processFiles } from "@/lib/utils";

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (base64: string) => void;
  initialImages?: string[];
}

export default function ImageLibraryModal({ isOpen, onClose, onSelect, initialImages = [] }: ImageLibraryModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload'>('gallery');
  const [dragActive, setDragActive] = useState(false);

  // Initialize images from props and ensure uniqueness
  useEffect(() => {
    if (initialImages.length > 0) {
      setImages(prev => {
        const newImages = [...prev];
        initialImages.forEach(img => {
          if (img && !newImages.includes(img)) {
            newImages.push(img);
          }
        });
        return newImages;
      });
    }
  }, [initialImages, isOpen]);

  const handleFileUpload = async (files: FileList | null) => {
    await processFiles(files, 'image/', (base64) => {
      setImages(prev => [base64, ...prev]);
      setActiveTab('gallery');
    });
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <ImageIcon className="text-blue-500" />
            Biblioteca de Imagens
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
            Minhas Imagens ({images.length})
          </button>
          <button
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
        <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
          {activeTab === 'gallery' ? (
            images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelect(img)}
                    className="group relative aspect-square border-2 border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Image src={img} alt={`Gallery image ${idx}`} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p>Nenhuma imagem na biblioteca.</p>
                <button 
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 text-blue-500 hover:underline"
                >
                  Fazer upload agora
                </button>
              </div>
            )
          ) : (
            <div 
              className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-zinc-700'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={48} className={`mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Arraste e solte imagens aqui</p>
              <p className="text-sm text-gray-500 mt-2 mb-6">ou</p>
              <label className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-colors shadow-lg">
                Escolher Arquivos
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
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
