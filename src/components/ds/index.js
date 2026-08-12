"use client";

import { useState } from "react";

/* Button */

const BUTTON_SIZES = {
  sm: { padding: "7px 13px", fontSize: "var(--text-xs)" },
  md: { padding: "10px 18px", fontSize: "var(--text-sm)" },
  lg: { padding: "14px 26px", fontSize: "var(--text-base)" },
};

const BUTTON_VARIANTS = {
  primary: {
    background: "var(--accent-primary)",
    color: "var(--text-on-accent)",
    border: "none",
  },
  secondary: {
    background: "var(--white)",
    color: "var(--accent-primary)",
    border: "1.5px solid var(--primary-200)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  children,
  onClick,
  ...rest
}) {
  const [hover, setHover] = useState(false);

  const base = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;
  const hoverStyle = !disabled && hover
    ? variant === "primary"
      ? { background: "var(--accent-primary-hover)" }
      : { background: "var(--gray-100)" }
    : null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...base,
        ...BUTTON_SIZES[size],
        ...hoverStyle,
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        borderRadius: "var(--radius-full)",
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--weight-semibold)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: `background var(--duration-fast) var(--ease-out)`,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* IconButton */

const ICON_BUTTON_SIZES = { sm: 30, md: 38, lg: 46 };

const ICON_BUTTON_VARIANTS = {
  ghost:   { background: "transparent", border: "none", color: "var(--text-secondary)" },
  filled:  { background: "var(--accent-primary)", border: "none", color: "var(--text-on-accent)" },
  outline: { background: "var(--white)", border: "1px solid var(--border-strong)", color: "var(--text-secondary)" },
};

export function IconButton({ icon, size = "md", variant = "ghost", label, onClick }) {
  const px = ICON_BUTTON_SIZES[size] ?? ICON_BUTTON_SIZES.md;

  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        ...(ICON_BUTTON_VARIANTS[variant] ?? ICON_BUTTON_VARIANTS.ghost),
        width: px,
        height: px,
        borderRadius: "var(--radius-full)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: `background var(--duration-fast) var(--ease-out)`,
      }}
    >
      {icon}
    </button>
  );
}

/* ------------------------------------------------------------------ Card */

export function Card({ title, footer, padding = "var(--space-6)", children }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {title && (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-xl)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            {title}
          </div>
        )}
        {children}
      </div>
      {footer && (
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            padding: `var(--space-4) ${padding}`,
            background: "var(--surface-sunken)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

/* Badge */

const BADGE_VARIANTS = {
  neutral: { background: "var(--surface-sunken)", color: "var(--text-secondary)" },
  accent:  { background: "var(--accent-primary-subtle)", color: "var(--accent-primary)" },
  success: { background: "var(--status-success-subtle)", color: "var(--status-success-strong)" },
  warning: { background: "var(--status-warning-subtle)", color: "var(--status-warning-strong)" },
  error:   { background: "var(--status-error-subtle)", color: "var(--status-error-strong)" },
};

export function Badge({ variant = "neutral", children }) {
  return (
    <span
      style={{
        ...(BADGE_VARIANTS[variant] ?? BADGE_VARIANTS.neutral),
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "var(--tracking-wide)",
        borderRadius: "var(--radius-full)",
        padding: "4px 12px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* Alert */

const ALERT_VARIANTS = {
  info:    { background: "var(--accent-primary-subtle)", color: "var(--primary-800)", stroke: "var(--accent-primary)" },
  success: { background: "var(--status-success-subtle)", color: "var(--status-success-strong)", stroke: "var(--status-success-strong)" },
  warning: { background: "var(--status-warning-subtle)", color: "var(--status-warning-strong)", stroke: "var(--status-warning-strong)" },
  error:   { background: "var(--status-error-subtle)", color: "var(--status-error-strong)", stroke: "var(--status-error-strong)" },
};

export function Alert({ variant = "info", title, children, onDismiss }) {
  const v = ALERT_VARIANTS[variant] ?? ALERT_VARIANTS.info;
  const isWarning = variant === "warning" || variant === "error";

  return (
    <div
      role={isWarning ? "alert" : "status"}
      style={{
        display: "flex",
        gap: "var(--space-3)",
        alignItems: "flex-start",
        background: v.background,
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4)",
      }}
    >
      <svg
        width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke={v.stroke} strokeWidth="1.9" strokeLinecap="round"
        style={{ flex: "none", marginTop: 2 }}
        aria-hidden="true"
      >
        {isWarning ? (
          <>
            <path d="M12 4l8.5 15H3.5z" />
            <path d="M12 10v3.5M12 16.5v.01" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v.01M12 11.5V16" />
          </>
        )}
      </svg>

      <div style={{ flex: 1, color: v.color }}>
        {title && (
          <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", marginBottom: 4 }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: "var(--text-sm)", lineHeight: "var(--leading-relaxed)" }}>
          {children}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: v.color, padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* Input */

export function Input({ label, placeholder, value, onChange, error, helperText, type = "text" }) {
  const [focus, setFocus] = useState(false);

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {label && (
        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>{label}</span>
      )}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        aria-invalid={error ? "true" : undefined}
        style={{
          border: `1.5px solid ${
            error ? "var(--status-error)" : focus ? "var(--accent-primary)" : "var(--border-strong)"
          }`,
          borderRadius: "var(--radius-md)",
          padding: "13px 16px",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-base)",
          color: "var(--text-primary)",
          background: "var(--white)",
          outline: "none",
          boxShadow: focus ? "var(--shadow-focus)" : "none",
          transition: `border-color var(--duration-fast) var(--ease-out)`,
        }}
      />
      {(error || helperText) && (
        <span
          style={{
            fontSize: "var(--text-sm)",
            color: error ? "var(--status-error-strong)" : "var(--text-tertiary)",
          }}
        >
          {error || helperText}
        </span>
      )}
    </label>
  );
}

/* Tabs / SelectOption */

export function TabItem() {
  // Declarative marker consumed by <Tabs>. Renders nothing itself.
  return null;
}

export function Tabs({ children, active, onChange }) {
  const items = Array.isArray(children) ? children : [children];

  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: "var(--space-1)",
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-full)",
        padding: 4,
        alignSelf: "flex-start",
      }}
    >
      {items.filter(Boolean).map((child) => {
        const { key, label } = child.props;
        const isActive = key === active;

        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            style={{
              background: isActive ? "var(--white)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-full)",
              padding: "9px 18px",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--weight-semibold)",
              cursor: "pointer",
              boxShadow: isActive ? "var(--shadow-sm)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function SelectOption({ label, value }) {
  return <option value={value}>{label}</option>;
}

export function Select({ label, value, onChange, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {label && (
        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>{label}</span>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          border: "1.5px solid var(--border-strong)",
          borderRadius: "var(--radius-md)",
          padding: "13px 16px",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-base)",
          background: "var(--white)",
          color: "var(--text-primary)",
        }}
      >
        {children}
      </select>
    </label>
  );
}
