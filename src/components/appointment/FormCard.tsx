import { cn } from "@/lib/utils";

/** The frosted white card that wraps every form on the site. */
export default function FormCard({
  icon = "fa-solid fa-calendar-check",
  title,
  subtitle,
  wide = false,
  className,
  children,
}: {
  icon?: string;
  title: string;
  subtitle: string;
  /** Wider standalone card, used on /contact. */
  wide?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative z-5 rounded-[16px] bg-white/95 p-5.5 shadow-panel backdrop-blur-[15px] sm:rounded-[22px] sm:p-9",
        wide && "mx-auto max-w-187.5 border border-primary/10",
        className,
      )}
    >
      {/* <div className="mx-auto mb-5 flex size-17.5 items-center justify-center rounded-full bg-mist text-[2rem] text-primary">
        <i className={icon} aria-hidden="true" />
      </div> */}

      <h2 className=" text-center font-display text-[1.6rem] font-bold text-ink sm:text-[2rem]">
        {title}
      </h2>
      <p className="mb-7 text-center">{subtitle}</p>

      {children}
    </div>
  );
}

/** Two columns from `md` up, stacked below. */
export function FormRow({ children }: { children: React.ReactNode }) {
  // `grid-cols-1` (i.e. minmax(0, 1fr)) rather than an implicit auto track, so a
  // long option label in a child can't stretch the column past the viewport.
  return (
    <div className="grid grid-cols-1 gap-4.5 md:grid-cols-2">{children}</div>
  );
}

export const SUBMIT_BUTTON =
  "mt-2.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary p-4 text-base font-semibold text-white transition duration-300 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:bg-primary";
