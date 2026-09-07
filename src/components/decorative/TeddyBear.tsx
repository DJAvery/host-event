type IconProps = {
  className?: string;
};

/**
 * A cute sitting teddy bear wearing a pink bow, used as the hero illustration.
 */
export default function TeddyBear({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      className={className}
      role="img"
      aria-label="Illustration of a cute teddy bear wearing a pink bow"
    >
      {/* ears */}
      <circle cx="88" cy="70" r="34" fill="#C69C74" />
      <circle cx="212" cy="70" r="34" fill="#C69C74" />
      <circle cx="88" cy="70" r="16" fill="#EBCBA6" />
      <circle cx="212" cy="70" r="16" fill="#EBCBA6" />

      {/* head */}
      <circle cx="150" cy="120" r="82" fill="#D4AC81" />

      {/* muzzle */}
      <ellipse cx="150" cy="142" rx="42" ry="34" fill="#F3DEC0" />

      {/* eyes */}
      <circle cx="122" cy="108" r="7" fill="#5B4636" />
      <circle cx="178" cy="108" r="7" fill="#5B4636" />

      {/* nose */}
      <ellipse cx="150" cy="128" rx="11" ry="8" fill="#5B4636" />
      <path
        d="M150 136 Q150 148 138 150"
        stroke="#5B4636"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M150 136 Q150 148 162 150"
        stroke="#5B4636"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* body */}
      <ellipse cx="150" cy="252" rx="92" ry="72" fill="#D4AC81" />
      <ellipse cx="150" cy="258" rx="52" ry="42" fill="#F3DEC0" />

      {/* arms */}
      <circle cx="62" cy="230" r="30" fill="#D4AC81" />
      <circle cx="238" cy="230" r="30" fill="#D4AC81" />

      {/* bow */}
      <g transform="translate(150 178)">
        <path d="M0 0 L-32 -20 L-32 20 Z" fill="#F491B8" />
        <path d="M0 0 L32 -20 L32 20 Z" fill="#EF6FA0" />
        <circle cx="0" cy="0" r="10" fill="#E0568A" />
      </g>
    </svg>
  );
}
