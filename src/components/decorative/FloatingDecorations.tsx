import Heart from "./Heart";
import PawPrint from "./PawPrint";
import Bow from "./Bow";
import Cloud from "./Cloud";
import Flower from "./Flower";

/**
 * A layer of soft floating decorative shapes. Purely visual, so it is
 * hidden from assistive technology.
 */
export default function FloatingDecorations({
  variant = "default",
}: {
  variant?: "default" | "soft";
}) {
  const opacityClass = variant === "soft" ? "opacity-20" : "opacity-30";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <Heart
        className={`absolute left-[6%] top-[12%] h-8 w-8 text-pink-300 animate-float ${opacityClass}`}
      />
      <PawPrint
        className={`absolute left-[15%] top-[70%] h-7 w-7 text-brown-400 animate-float-slow ${opacityClass}`}
      />
      <Bow
        className={`absolute right-[10%] top-[18%] h-9 w-9 text-pink-400 animate-float-slower ${opacityClass}`}
      />
      <Cloud
        className={`absolute right-[8%] top-[65%] h-10 w-10 text-blush-200 animate-float ${opacityClass}`}
      />
      <Flower
        className={`absolute left-[45%] top-[8%] h-8 w-8 text-pink-300 animate-float-slow ${opacityClass}`}
      />
      <Heart
        className={`absolute right-[22%] top-[40%] h-6 w-6 text-pink-400 animate-float-slower ${opacityClass}`}
      />
      <PawPrint
        className={`absolute right-[35%] top-[85%] h-6 w-6 text-brown-400 animate-float ${opacityClass}`}
      />
    </div>
  );
}
