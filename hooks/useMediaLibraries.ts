"use client";

import { useState } from "react";

export function useMediaLibraries() {
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    type: 'image' | 'audio';
    callback: ((url: string) => void) | null;
  }>({
    isOpen: false,
    type: 'image',
    callback: null,
  });

  const [storedImages, setStoredImages] = useState<string[]>([]);
  const [storedAudios, setStoredAudios] = useState<string[]>([]);

  const openMediaLibrary = (type: 'image' | 'audio', callback: (url: string) => void) => {
    setMediaModal({
      isOpen: true,
      type,
      callback,
    });
  };

  const handleMediaSelect = (url: string) => {
    if (mediaModal.callback) {
      mediaModal.callback(url);
    }

    if (mediaModal.type === 'image') {
      if (!storedImages.includes(url)) {
        setStoredImages(prev => [url, ...prev]);
      }
    } else {
      if (!storedAudios.includes(url)) {
        setStoredAudios(prev => [url, ...prev]);
      }
    }

    setMediaModal(prev => ({ ...prev, isOpen: false, callback: null }));
  };

  return {
    isMediaModalOpen: mediaModal.isOpen,
    mediaModalType: mediaModal.type,
    closeMediaModal: () => setMediaModal(prev => ({ ...prev, isOpen: false })),
    storedImages,
    storedAudios,
    openMediaLibrary,
    handleMediaSelect,
  };
}
