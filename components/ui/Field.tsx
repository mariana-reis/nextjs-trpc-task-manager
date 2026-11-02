import { inputStyles } from "./styles";

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
  placeholder?: string;
  optional?: boolean;
  multiline?: boolean;
};

export function Field({
  id,
  label,
  value,
  onChange,
  maxLength,
  error,
  placeholder,
  optional = false,
  multiline = false,
}: FieldProps) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    name: id,
    value,
    placeholder,
    className: inputStyles,
    "aria-invalid": Boolean(error),
    "aria-required": !optional,
    "aria-describedby": error ? errorId : undefined,
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {optional && <span className="text-xs text-muted">Optional</span>}
      </div>

      {multiline ? (
        <textarea {...shared} rows={4} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input {...shared} type="text" onChange={(event) => onChange(event.target.value)} />
      )}

      <div className="mt-1 flex gap-2 text-xs">
        {error && (
          <p id={errorId} role="alert" className="text-danger">
            {error}
          </p>
        )}
        <span className={`ml-auto ${value.length > maxLength ? "text-danger" : "text-muted"}`}>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
