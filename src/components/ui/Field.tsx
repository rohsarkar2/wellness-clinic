"use client";

import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { parseDateInput, toDateInput } from "@/lib/utils/date";

/** Shared sizing so every control in a row lines up exactly. */
const CONTROL =
  "h-13.25 w-full rounded-xl border-2 border-line px-4 text-base text-ink transition-colors focus-visible:border-primary focus-visible:ring-0 aria-invalid:border-destructive md:text-base";

interface FieldShellProps {
  id: string;
  label: string;
  icon?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldShell({ id, label, icon, error, children }: FieldShellProps) {
  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="mb-2 text-[0.9rem] font-semibold text-ink">
        {icon ? (
          <i className={cn("text-primary", icon)} aria-hidden="true" />
        ) : null}
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-[0.82rem] text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

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
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "id"> & FieldExtras) {
  return (
    <FieldShell id={id} label={label} icon={icon} error={error}>
      <Input
        id={id}
        name={props.name ?? id}
        className={cn(CONTROL, className)}
        {...a11yProps(id, error)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextareaField({
  id,
  label,
  icon,
  error,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Textarea>, "id"> & FieldExtras) {
  return (
    <FieldShell id={id} label={label} icon={icon} error={error}>
      <Textarea
        id={id}
        name={props.name ?? id}
        className={cn(CONTROL, "h-30 resize-none py-3", className)}
        {...a11yProps(id, error)}
        {...props}
      />
    </FieldShell>
  );
}

interface Option {
  value: string;
  label: string;
}

/** Select built on shadcn's listbox rather than a native `<select>`. */
export function SelectField({
  id,
  label,
  icon,
  error,
  value,
  onValueChange,
  placeholder,
  options,
}: FieldExtras & {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Option[];
}) {
  return (
    <FieldShell id={id} label={label} icon={icon} error={error}>
      <Select value={value} onValueChange={(next) => onValueChange(next ?? "")}>
        {/* The height override has to carry the same `data-[size=...]` modifier
            as shadcn's own rule, or tailwind-merge keeps both and the variant
            one wins. */}
        <SelectTrigger
          id={id}
          className={cn(CONTROL, "justify-between data-[size=default]:h-13.25")}
          {...a11yProps(id, error)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

/**
 * Date picker built from shadcn's Popover + Calendar.
 *
 * This deliberately avoids `<input type="date">`: its rendering is inconsistent
 * across browsers (iOS Safari shows no hint at all and sizes itself taller than
 * its neighbours) and its picker cannot be styled. The value is still exchanged
 * as a "YYYY-MM-DD" string, so form state and validation are unchanged.
 */
export function DateField({
  id,
  label,
  icon,
  error,
  value,
  onChange,
  min,
  max,
  placeholder = "Select a date",
}: FieldExtras & {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? (parseDateInput(value) ?? undefined) : undefined;

  const minDate = min ? parseDateInput(min) : null;
  const maxDate = max ? parseDateInput(max) : null;

  return (
    <FieldShell id={id} label={label} icon={icon} error={error}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                CONTROL,
                "justify-between border-2 bg-white font-normal hover:bg-white",
                !selected && "text-muted-foreground",
              )}
              {...a11yProps(id, error)}
            >
              {selected ? format(selected, "dd MMM yyyy") : placeholder}
              <CalendarIcon className="size-4 text-primary" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            /* Roomier than the 28px default, so day cells are tappable. */
            className="[--cell-size:--spacing(9)]"
            mode="single"
            selected={selected}
            defaultMonth={selected}
            captionLayout="dropdown"
            startMonth={minDate ?? undefined}
            endMonth={maxDate ?? undefined}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            onSelect={(date) => {
              onChange(date ? toDateInput(date) : "");
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldShell>
  );
}

/** Kept for callers that still pass a raw date string through an input. */
export { format, parse };
