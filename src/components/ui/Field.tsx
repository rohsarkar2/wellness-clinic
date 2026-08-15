import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FieldShellProps {
  id: string;
  label: string;
  icon?: string;
  error?: string;
  children: ReactNode;
}

function FieldShell({ id, label, icon, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-2 text-[0.9rem] font-semibold text-ink">
        {icon ? <i className={`mr-1.5 text-primary ${icon}`} aria-hidden="true" /> : null}
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[0.82rem] text-[#d13b4a]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Wires aria-invalid/aria-describedby so screen readers announce the error. */
function a11yProps(id: string, error?: string) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  } as const;
}

type FieldExtras = { id: string; label: string; icon?: string; error?: string };

export function InputField({
  id,
  label,
  icon,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & FieldExtras) {
  return (
    <FieldShell id={id} label={label} icon={icon} error={error}>
      <input
        id={id}
        name={props.name ?? id}
        className="field-control"
        {...a11yProps(id, error)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  icon,
  error,
  children,
  ...props
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & FieldExtras) {
  return (
    <FieldShell id={id} label={label} icon={icon} error={error}>
      <select
        id={id}
        name={props.name ?? id}
        className="field-control"
        {...a11yProps(id, error)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextareaField({
  id,
  label,
  icon,
  error,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & FieldExtras) {
  return (
    <FieldShell id={id} label={label} icon={icon} error={error}>
      <textarea
        id={id}
        name={props.name ?? id}
        className="field-control h-30 resize-none"
        {...a11yProps(id, error)}
        {...props}
      />
    </FieldShell>
  );
}
