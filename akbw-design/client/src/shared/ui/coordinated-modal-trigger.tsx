'use client';

import React from 'react';
import { ModalTrigger } from './modal';

interface CoordinatedModalTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
  modalIdToClose?: string;
  asChild?: boolean;
}

/**
 * A modal trigger that can coordinate with other modals.
 * When clicked, it can optionally close another modal before opening this one.
 */
export function CoordinatedModalTrigger({
  children,
  onClick,
  modalIdToClose,
  asChild,
}: CoordinatedModalTriggerProps) {
  const handleClick = (_e: React.MouseEvent) => {
    // Close the other modal first if specified
    if (modalIdToClose) {
      window.dispatchEvent(
        new CustomEvent('modal:close', { detail: modalIdToClose }),
      );
    }

    if (onClick) {
      onClick();
    }
  };

  return (
    <ModalTrigger asChild={asChild} onClick={handleClick}>
      {children}
    </ModalTrigger>
  );
}
