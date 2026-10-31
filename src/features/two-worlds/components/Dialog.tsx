"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { flushSync } from "react-dom";
import { Icon } from "./Icon";

interface DialogProps {
  open: boolean;
  title: string;
  kicker?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Native modal dialog: the browser traps focus and closes on Escape. Focus returns to the
 * element that opened it.
 */
export function Dialog({ open, title, kicker, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const returnFocus = useRef<Element | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement;
      dialog.showModal();
      // Start on the title, not on the first option, so the player hears what the dialog is about.
      heading.current?.focus();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    // Escape fires "cancel" synchronously but "close" only later as a task. Committing the
    // closed state on "cancel" keeps a quick reopen from being swallowed.
    const handleCancel = () => flushSync(onClose);
    const handleClose = () => {
      // A late "close" from an earlier dismissal must not shut a dialog reopened since.
      if (dialog.open) return;
      if (returnFocus.current instanceof HTMLElement) returnFocus.current.focus();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  return (
    <dialog ref={ref} aria-labelledby={titleId} className="ds-dialog m-auto">
      <div className="sticky top-0 z-10 -mx-4 flex items-start justify-between gap-4 bg-sheet px-4 pt-4 sm:static sm:mx-0 sm:p-0">
        <div className="pt-2">
          {kicker && <p className="font-mono text-meta">{kicker}</p>}
          <h2
            id={titleId}
            ref={heading}
            tabIndex={-1}
            className="mt-3 font-display text-h2 leading-tight font-extrabold tracking-display"
          >
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="ds-dialog__close -mr-2.5 shrink-0"
        >
          <Icon name="close" />
          <span className="sr-only">Zavřít</span>
        </button>
      </div>
      <div className="mt-5">{children}</div>
      {footer && <div className="mt-6">{footer}</div>}
    </dialog>
  );
}
