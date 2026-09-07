type IconProps = {
  className?: string;
};

export default function Heart({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 90"
      className={className}
      role="img"
      aria-label="Heart decoration"
    >
      <path
        d="M50 85 C10 55 0 30 20 14 C34 3 48 10 50 24 C52 10 66 3 80 14 C100 30 90 55 50 85 Z"
        fill="currentColor"
      />
    </svg>
  );
}
