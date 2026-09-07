type IconProps = {
  className?: string;
};

export default function Flower({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Soft watercolor-style flower decoration"
    >
      <g fill="currentColor">
        <ellipse cx="50" cy="28" rx="16" ry="22" />
        <ellipse cx="50" cy="72" rx="16" ry="22" />
        <ellipse cx="28" cy="50" rx="22" ry="16" />
        <ellipse cx="72" cy="50" rx="22" ry="16" />
        <ellipse cx="34" cy="34" rx="16" ry="20" transform="rotate(-45 34 34)" />
        <ellipse cx="66" cy="66" rx="16" ry="20" transform="rotate(-45 66 66)" />
        <ellipse cx="66" cy="34" rx="16" ry="20" transform="rotate(45 66 34)" />
        <ellipse cx="34" cy="66" rx="16" ry="20" transform="rotate(45 34 66)" />
      </g>
      <circle cx="50" cy="50" r="14" fill="#FFF3E9" />
    </svg>
  );
}
