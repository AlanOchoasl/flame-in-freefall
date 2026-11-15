import { useEffect, useRef, type ReactNode } from 'react';

// The full list opens in a native <dialog>: it traps focus, closes on Esc and returns focus to the button that opened it.
export function ConsoleDialog({ open, onClose, titleId, className, children }: { open: boolean; onClose: () => void; titleId: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={className ? `ranking-dialog ${className}` : 'ranking-dialog'}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open ? children : null}
    </dialog>
  );
}
