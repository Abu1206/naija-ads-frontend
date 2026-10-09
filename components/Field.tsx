import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// One field pattern (design-system.md): 48px control, label above the input
// (never a placeholder), helper line underneath in Muted, Naija Green focus
// ring. Errors render as an alert list so colour is never the only signal.
const CONTROL =
  "mt-1 h-12 w-full rounded-lg border border-mist bg-white px-3 text-ink placeholder:text-muted/60 focus:border-naija focus:ring-2 focus:ring-naija/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

interface FieldShellProps {
  id: string;
  label: ReactNode;
  helper?: string;
  children: ReactNode;
}

export function Field({ id, label, helper, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {helper && <p className="mt-1 text-xs text-muted">{helper}</p>}
    </div>
  );
}

interface FieldErrorProps {
  errors: string[];
}

/** Shared error list for forms: what went wrong, in words. */
export function FieldErrors({ errors }: FieldErrorProps) {
  if (errors.length === 0) return null;
  return (
    <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-alert">
      {errors.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: InputProps) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function SelectInput(props: SelectProps) {
  return <select {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea(props: TextAreaProps) {
  // Textareas grow with content, so the fixed 48px height does not apply —
  // padding and border treatment stay identical.
  return (
    <textarea
      {...props}
      className={`mt-1 w-full rounded-lg border border-mist bg-white px-3 py-2.5 text-ink placeholder:text-muted/60 focus:border-naija focus:ring-2 focus:ring-naija/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`}
    />
  );
}
