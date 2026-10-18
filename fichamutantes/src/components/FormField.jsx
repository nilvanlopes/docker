import React from "react";

export function LineField({ name, label, value, onChange, className = "" }) {
  return (
    <input
      className={("line-input " + className).trim()}
      data-field={name}
      aria-label={label}
      value={value ?? ""}
      onChange={(event) => onChange(name, event.target.value)}
    />
  );
}

export function BoxField({
  name,
  label,
  value,
  onChange,
  className = "",
  readOnly = false,
}) {
  return (
    <input
      className={("box-input " + (readOnly ? "readonly " : "") + className).trim()}
      data-field={name}
      aria-label={label}
      value={value ?? ""}
      readOnly={readOnly}
      onChange={(event) => onChange(name, event.target.value)}
    />
  );
}

export function MiniField({ name, label, value, onChange, readOnly = false }) {
  return (
    <input
      className={"mini-input" + (readOnly ? " readonly" : "")}
      data-field={name}
      aria-label={label}
      value={value ?? ""}
      readOnly={readOnly}
      onChange={(event) => onChange(name, event.target.value)}
    />
  );
}

export function TextField({ name, label, value, onChange, className = "" }) {
  return (
    <textarea
      className={className}
      data-field={name}
      aria-label={label}
      value={value ?? ""}
      onChange={(event) => onChange(name, event.target.value)}
    />
  );
}

export function CheckField({ name, label, value, onChange }) {
  return (
    <input
      className="check"
      type="checkbox"
      data-field={name}
      aria-label={label}
      checked={Boolean(value)}
      onChange={(event) => onChange(name, event.target.checked)}
    />
  );
}
