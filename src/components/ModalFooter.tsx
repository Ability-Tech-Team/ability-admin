type Props = {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel: string;
  confirmLabel: string;
};

export default function ModalFooter({ onCancel, onConfirm, cancelLabel, confirmLabel }: Props) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {cancelLabel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
