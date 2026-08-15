interface AlertProps {
  variant: "error" | "success" | "info";
  children: React.ReactNode;
}

const STYLES: Record<AlertProps["variant"], string> = {
  error: "bg-[#fdeced] text-[#a02733] border-[#f7cdd1]",
  success: "bg-[#e8f8f2] text-[#17795a] border-[#c3ecdd]",
  info: "bg-mist text-[#10548c] border-[#cfe6f9]",
};

const ICONS: Record<AlertProps["variant"], string> = {
  error: "fa-solid fa-circle-exclamation",
  success: "fa-solid fa-circle-check",
  info: "fa-solid fa-circle-info",
};

export default function Alert({ variant, children }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`flex items-start gap-3 rounded-xl border px-4.5 py-3.5 text-[0.95rem] ${STYLES[variant]}`}
    >
      <i className={`mt-0.75 ${ICONS[variant]}`} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
