"use client";

import Alert from "@/components/ui/Alert";
import { LoadingBlock } from "@/components/ui/Loading";
import { cn } from "@/lib/cn";
import type { TimeSlot } from "@/lib/types";

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  value: string;
  onChange: (time: string) => void;
  loading?: boolean;
  error?: string;
  /** Clinic-closed / doctor-unavailable explanation from the backend. */
  notice?: string;
  /** Shown before a doctor and date have both been picked. */
  placeholder?: string;
}

export default function TimeSlotSelector({
  slots,
  value,
  onChange,
  loading = false,
  error,
  notice,
  placeholder,
}: TimeSlotSelectorProps) {
  if (loading) return <LoadingBlock label="Checking available slots…" />;
  if (error) return <Alert variant="error">{error}</Alert>;
  if (placeholder) return <Alert variant="info">{placeholder}</Alert>;
  if (notice && slots.length === 0) return <Alert variant="info">{notice}</Alert>;

  if (slots.length === 0) {
    return <Alert variant="info">No slots are published for this date yet.</Alert>;
  }

  const hasAvailable = slots.some((slot) => slot.available);

  return (
    <>
      {notice ? <Alert variant="info">{notice}</Alert> : null}

      {!hasAvailable ? (
        <Alert variant="info">Every slot on this date is booked. Please choose another day.</Alert>
      ) : null}

      <div
        role="group"
        aria-label="Available appointment times"
        className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2.25 sm:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] sm:gap-3"
      >
        {slots.map((slot) => {
          const selected = slot.time === value;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              aria-pressed={selected}
              aria-label={slot.available ? `Select ${slot.label}` : `${slot.label} — already booked`}
              onClick={() => onChange(slot.time)}
              className={cn(
                "cursor-pointer rounded-xl border-2 px-1 py-2.75 text-[0.88rem] font-semibold transition duration-250 sm:px-2 sm:py-3 sm:text-[0.95rem]",
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-white text-ink hover:border-primary hover:text-primary",
                "disabled:cursor-not-allowed disabled:border-[#eaeff5] disabled:bg-[#f2f5f9] disabled:text-[#aeb8c4] disabled:line-through disabled:hover:border-[#eaeff5] disabled:hover:text-[#aeb8c4]",
              )}
            >
              {slot.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-3.5 text-[0.8rem] text-[#7a8794] sm:gap-5 sm:text-[0.85rem]">
        <span className="inline-flex items-center gap-1.75">
          <i className="size-3.5 rounded border-2 border-line bg-white" />
          Available
        </span>
        <span className="inline-flex items-center gap-1.75">
          <i className="size-3.5 rounded border-2 border-primary bg-primary" />
          Selected
        </span>
        <span className="inline-flex items-center gap-1.75">
          <i className="size-3.5 rounded border-2 border-[#eaeff5] bg-[#f2f5f9]" />
          Booked / unavailable
        </span>
      </div>
    </>
  );
}
