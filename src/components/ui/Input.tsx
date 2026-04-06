import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-light">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-lg border bg-navy-light/60 px-4 py-3 text-warm-white placeholder:text-slate/50 focus:outline-none focus:ring-1 ${
            error
              ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/40"
              : "border-white/10 focus:border-copper/60 focus:ring-copper/40"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;

export function Select({
  label,
  error,
  children,
  className = "",
  id,
  ...props
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-light">
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border border-white/10 bg-navy-light/60 px-4 py-3 text-warm-white focus:border-copper/60 focus:outline-none focus:ring-1 focus:ring-copper/40 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-light">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`w-full rounded-lg border border-white/10 bg-navy-light/60 px-4 py-3 text-warm-white placeholder:text-slate/50 focus:border-copper/60 focus:outline-none focus:ring-1 focus:ring-copper/40 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
