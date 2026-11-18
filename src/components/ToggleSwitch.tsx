"use client";

type Props = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export default function ToggleSwitch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? (checked ? "Enabled" : "Disabled")}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${
          checked
            ? "ltr:translate-x-[18px] rtl:-translate-x-[18px]"
            : "ltr:translate-x-[2px] rtl:-translate-x-[2px]"
        }`}
      />
    </button>
  );
}
