'use client';

import { useCallback } from 'react';
import { forceCloseAllModals, openCoordinatedModal } from '../ui/modal';

export function useCoordinatedModal(defaultModalId?: string) {
  const openModal = useCallback(
    (modalId?: string) => {
      const idToOpen = modalId || defaultModalId;
      if (idToOpen) {
        openCoordinatedModal(idToOpen);
      }
    },
    [defaultModalId],
  );

  const closeModal = useCallback(() => {
    forceCloseAllModals();
  }, []);

  return {
    openModal,
    closeModal,
  };
}
