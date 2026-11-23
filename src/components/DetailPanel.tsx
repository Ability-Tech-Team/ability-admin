"use client";

import { useEffect, useCallback, useId } from "react";
import CloseButton from "./CloseButton";

type Props = {
  title: string;
  onClose: () => void;
  /** Tailwind width class. Default: "w-[480px]" */
  width?: string;
  /** The close button's label in the page's language (default "Close"). */
  closeLabel?: string;
  children: React.ReactNode;
};

export default function DetailPanel({ title, onClose, width = "w-[480px]", closeLabel, children }: Props) {
  const titleId = useId();
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
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`fixed inset-y-0 end-0 z-50 ${width} overflow-y-auto bg-white shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 id={titleId} className="text-[15px] font-bold text-gray-900">{title}</h2>
          <CloseButton onClick={onClose} label={closeLabel} />
        </div>
        {children}
      </div>
    </>
  );
}
