import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Rating out of `max`. Fractional values render a partially filled star. */
  value: number;
  max?: number;
  className?: string;
}

export default function StarRating({
  value,
  max = 5,
  className,
}: StarRatingProps) {
  return (
    <div
      role="img"
      aria-label={`Rated ${value} out of ${max}`}
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      {Array.from({ length: max }, (_, index) => {
        // How much of this star is filled, 0–1: 4.9 gives four full stars
        // and one that is 90% filled.
        const fill = Math.min(Math.max(value - index, 0), 1);

        return (
          <span
            key={index}
            className="relative inline-flex leading-none"
            aria-hidden="true"
          >
            <i className="fa-solid fa-star text-line" />

            {/* Clipped overlay — its width is what makes a star look partial. */}
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${(fill * 100).toFixed(1)}%` }}
            >
              <i className="fa-solid fa-star text-star" />
            </span>
          </span>
        );
      })}
    </div>
  );
}
