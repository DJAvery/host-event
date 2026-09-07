type IconProps = {
  className?: string;
};

export default function PawPrint({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Paw print decoration"
    >
      <ellipse cx="50" cy="66" rx="28" ry="22" fill="currentColor" />
      <ellipse cx="20" cy="38" rx="11" ry="14" fill="currentColor" />
      <ellipse cx="45" cy="24" rx="11" ry="14" fill="currentColor" />
      <ellipse cx="72" cy="30" rx="11" ry="14" fill="currentColor" />
      <ellipse cx="86" cy="52" rx="10" ry="13" fill="currentColor" />
    </svg>
  );
}
