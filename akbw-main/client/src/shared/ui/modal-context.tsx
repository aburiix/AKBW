'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type ModalId = string | null;

interface ModalContextType {
  openModalId: ModalId;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openModalId, setOpenModalId] = useState<ModalId>(null);

  const openModal = useCallback((id: string) => {
    setOpenModalId(id);
  }, []);

  const closeModal = useCallback((id: string) => {
    setOpenModalId((current) => (current === id ? null : current));
  }, []);

  const value = useMemo(
    () => ({ openModalId, openModal, closeModal }),
    [openModalId, openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within ModalContextProvider');
  }
  return context;
}
