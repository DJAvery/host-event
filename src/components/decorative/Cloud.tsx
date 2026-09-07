type IconProps = {
  className?: string;
};

export default function Cloud({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      role="img"
      aria-label="Soft cloud decoration"
    >
      <path
        d="M30 60 C12 60 2 46 12 34 C10 18 30 8 42 18 C50 4 78 4 84 20 C102 18 112 38 98 50 C104 64 88 62 84 60 Z"
        fill="currentColor"
      />
    </svg>
  );
}
