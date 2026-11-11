import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '../lib/utils';

// Global state for coordinated modals - stores the currently open modal ID
let currentOpenModal: string | null = null;
const modalControl: Record<string, (open: boolean) => void> = {};

// Function to force close all modals - can be called from anywhere
export function forceCloseAllModals() {
  currentOpenModal = null;
  // Call all registered modal controllers to close
  Object.values(modalControl).forEach((ctrl) => ctrl(false));
}

// Function to programmatically open a specific modal by ID
export function openCoordinatedModal(modalId: string) {
  if (currentOpenModal === modalId) return;
  forceCloseAllModals();
  const openFn = modalControl[modalId];
  if (openFn) {
    openFn(true);
    currentOpenModal = modalId;
  }
}

interface ModalProps extends React.ComponentProps<typeof DialogPrimitive.Root> {
  modalId?: string;
}

function Modal({ modalId, children, ...props }: ModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const modalIdRef = React.useRef(modalId);

  React.useEffect(() => {
    modalIdRef.current = modalId;
  }, [modalId]);

  // Register this modal's control function
  React.useEffect(() => {
    if (!modalId) return;

    modalControl[modalId] = (open: boolean) => {
      setIsOpen(open);
    };

    return () => {
      delete modalControl[modalId];
    };
  }, [modalId]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        if (currentOpenModal && currentOpenModal !== modalId) {
          const closeFn = modalControl[currentOpenModal];
          if (closeFn) {
            closeFn(false);
          }
        }
        currentOpenModal = modalId || null;
      } else {
        if (currentOpenModal === modalId) {
          currentOpenModal = null;
        }
      }
      setIsOpen(open);
    },
    [modalId],
  );

  return (
    <DialogPrimitive.Root
      data-slot="modal"
      data-modal-id={modalId}
      open={isOpen}
      onOpenChange={handleOpenChange}
      {...props}
    >
      {children}
    </DialogPrimitive.Root>
  );
}

function ModalTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="modal-trigger" {...props} />;
}

function ModalPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="modal-portal" {...props} />;
}

function ModalOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="modal-overlay"
      className={cn(
        'fixed inset-0 z-[70] bg-night/60 backdrop-blur-[6px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

function ModalContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <ModalPortal>
      <ModalOverlay />
      <DialogPrimitive.Content
        data-slot="modal-content"
        className={cn(
          'fixed left-[50%] top-[50%] z-[70] grid bg-[var(--color-akbw-filter-bg)] w-[calc(100%-24px)] max-w-lg max-h-[calc(100dvh-24px)] overflow-y-auto translate-x-[-50%] translate-y-[-50%] text-black p-7 md:p-10 shadow-2xl shadow-night/40 rounded-[26px] border border-line-2 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=bottom]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </ModalPortal>
  );
}

function ModalTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

function ModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn('text-sm text-ivory/50', className)}
      {...props}
    />
  );
}

function ModalClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="modal-close"
      {...props}
      className={cn(
        'cursor-pointer absolute top-4 right-4 z-10 grid place-items-center size-10 rounded-full border border-line text-ivory/70 hover:text-ivory hover:bg-ivory/[0.06] transition-colors [&_svg]:size-[18px]',
        props.className,
      )}
    />
  );
}

export {
  Modal,
  ModalPortal,
  ModalOverlay,
  ModalTrigger,
  ModalClose,
  ModalContent,
  ModalTitle,
  ModalDescription,
};
