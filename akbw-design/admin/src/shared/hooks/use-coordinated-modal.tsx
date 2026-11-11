'use client';

import { useState, useCallback, useEffect } from 'react';

// Global state to track the currently open modal
let currentOpenModal: string | null = null;
const listeners: Set<(modalId: string | null) => void> = new Set();

function notifyListeners(modalId: string | null) {
  listeners.forEach(listener => listener(modalId));
}

export function useCoordinatedModal(modalId: string) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const listener = (newOpenModal: string | null) => {
      // If another modal is opening, close this one
      if (newOpenModal !== null && newOpenModal !== modalId && isOpen) {
        setIsOpen(false);
        currentOpenModal = null;
      }
    };
    
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      // Clean up current open modal if this modal was open
      if (currentOpenModal === modalId) {
        currentOpenModal = null;
        notifyListeners(null);
      }
    };
  }, [modalId, isOpen]);

  const openModal = useCallback(() => {
    // If there's another modal open, close it first
    if (currentOpenModal && currentOpenModal !== modalId) {
      notifyListeners(null);
    }
    currentOpenModal = modalId;
    setIsOpen(true);
    notifyListeners(modalId);
  }, [modalId]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (currentOpenModal === modalId) {
      currentOpenModal = null;
      notifyListeners(null);
    }
  }, [modalId]);

  const toggleModal = useCallback(() => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Force close this modal (can be called from outside)
  const forceClose = useCallback(() => {
    setIsOpen(false);
    if (currentOpenModal === modalId) {
      currentOpenModal = null;
      notifyListeners(null);
    }
  }, [modalId]);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen,
    forceClose,
  };
}
