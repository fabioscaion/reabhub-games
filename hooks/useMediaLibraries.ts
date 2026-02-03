"use client";

import { useState } from "react";

export function useMediaLibraries() {
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  const [imageLibraryCallback, setImageLibraryCallback] = useState<((base64: string) => void) | null>(null);
  const [storedImages, setStoredImages] = useState<string[]>([]);

  const [isAudioLibraryOpen, setIsAudioLibraryOpen] = useState(false);
  const [audioLibraryCallback, setAudioLibraryCallback] = useState<((base64: string) => void) | null>(null);
  const [storedAudios, setStoredAudios] = useState<string[]>([]);

  const openImageLibrary = (callback: (base64: string) => void) => {
    setImageLibraryCallback(() => callback);
    setIsImageLibraryOpen(true);
  };

  const openAudioLibrary = (callback: (base64: string) => void) => {
    setAudioLibraryCallback(() => callback);
    setIsAudioLibraryOpen(true);
  };

  const handleImageSelect = (base64: string) => {
    if (imageLibraryCallback) {
      imageLibraryCallback(base64);
    }
    if (!storedImages.includes(base64)) {
        setStoredImages(prev => [base64, ...prev]);
    }
    setIsImageLibraryOpen(false);
    setImageLibraryCallback(null);
  };

  const handleAudioSelect = (base64: string) => {
    if (audioLibraryCallback) {
      audioLibraryCallback(base64);
    }
    if (!storedAudios.includes(base64)) {
        setStoredAudios(prev => [base64, ...prev]);
    }
    setIsAudioLibraryOpen(false);
    setAudioLibraryCallback(null);
  };

  return {
    isImageLibraryOpen,
    setIsImageLibraryOpen,
    storedImages,
    openImageLibrary,
    handleImageSelect,
    isAudioLibraryOpen,
    setIsAudioLibraryOpen,
    storedAudios,
    openAudioLibrary,
    handleAudioSelect,
  };
}
