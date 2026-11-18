"use client";

import { useEffect, useCallback } from "react";

type Props = {
  onClose: () => void;
  /** Tailwind max-width class, e.g. "max-w-md", "max-w-[560px]". Default: "max-w-md" */
  width?: string;
  children: React.ReactNode;
};

export default function ModalWrapper({ onClose, width = "max-w-md", children }: Props) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${width} rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
