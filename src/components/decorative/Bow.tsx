type IconProps = {
  className?: string;
};

export default function Bow({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 70"
      className={className}
      role="img"
      aria-label="Pink bow decoration"
    >
      <path d="M50 35 L8 8 C2 4 2 30 8 34 L50 35 Z" fill="currentColor" />
      <path d="M50 35 L92 8 C98 4 98 30 92 34 L50 35 Z" fill="currentColor" />
      <path d="M50 35 L8 62 C2 66 2 40 8 36 L50 35 Z" fill="currentColor" />
      <path d="M50 35 L92 62 C98 66 98 40 92 36 L50 35 Z" fill="currentColor" />
      <circle cx="50" cy="35" r="12" fill="currentColor" />
    </svg>
  );
}
