type IconProps = { className?: string };

export function ChangeUpIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
    >
      <path d="M6 1 L11 10 L1 10 Z" />
    </svg>
  );
}

export function ChangeDownIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 12 12"
      fill="currentColor"
      className={className}
    >
      <path d="M6 11 L11 2 L1 2 Z" />
    </svg>
  );
}
