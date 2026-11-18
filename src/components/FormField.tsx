type Props = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

export default function FormField({ label, required, children }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
