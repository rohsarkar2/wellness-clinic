export function Spinner({ dark = false }: { dark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-4.5 animate-spin rounded-full border-[3px] ${
        dark ? "border-primary/25 border-t-primary" : "border-white/45 border-t-white"
      }`}
    />
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-12 text-[#7a8794]">
      <Spinner dark />
      <span>{label}</span>
    </div>
  );
}

const SHIMMER =
  "animate-shimmer bg-[linear-gradient(90deg,#eef2f7_25%,#f7fafd_37%,#eef2f7_63%)] bg-[length:400%_100%] rounded-lg";

/** Card-shaped placeholder matching the doctor grid's layout. */
export function DoctorCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="rounded-card bg-white p-5 text-center shadow-card sm:p-6"
    >
      <div className={`${SHIMMER} mx-auto mb-5 size-37.5 rounded-full`} />
      <div className={`${SHIMMER} mx-auto my-2.5 h-3.5 w-[70%]`} />
      <div className={`${SHIMMER} mx-auto my-2.5 h-3.5 w-1/2`} />
      <div className={`${SHIMMER} mx-auto my-2.5 h-3.5 w-[85%]`} />
    </article>
  );
}

export function DoctorGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        <DoctorCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="px-5 py-14 text-center text-[#7a8794]">
      <i className={`mb-3.5 text-[2.5rem] text-[#c6d2df] ${icon}`} aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
