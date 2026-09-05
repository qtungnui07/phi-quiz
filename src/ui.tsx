import type { CSSProperties, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Icons (Material Symbols Outlined)                                    */
/* ------------------------------------------------------------------ */

export function Icon({
  name,
  size = 24,
  filled = false,
  className = "",
  style,
}: {
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden
      className={`msr ${filled ? "msr-filled" : ""} ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Neubrutalism card                                                    */
/* ------------------------------------------------------------------ */

export function NeuCard({
  children,
  className = "",
  fill = "bg-surface",
  rounded = "rounded-3xl",
  press = false,
  shadow = "shadow-hard",
  style,
  onClick,
  role,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  fill?: string;
  rounded?: string;
  press?: boolean;
  shadow?: string;
  style?: CSSProperties;
  onClick?: () => void;
  role?: string;
  ariaLabel?: string;
}) {
  const base = `stroke-outer ${fill} ${rounded} ${shadow}`;
  const interactive = press ? "pressable cursor-pointer" : "";
  return (
    <div
      className={`${base} ${interactive} ${className}`}
      style={style}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                              */
/* ------------------------------------------------------------------ */

export type Tone = "yellow" | "cyan" | "white" | "ink" | "orange" | "green" | "soft" | "transparent";

const toneClasses: Record<Tone, string> = {
  yellow: "bg-yellow text-ink",
  cyan: "bg-cyan text-ink",
  white: "bg-surface text-ink",
  ink: "bg-ink text-surface",
  orange: "bg-orange text-ink",
  green: "bg-green text-ink",
  soft: "bg-surface2 text-ink",
  transparent: "bg-transparent text-ink",
};

export function NeuButton({
  children,
  tone = "yellow",
  shape = "rounded-full",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  shape?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-3.5 text-base",
  };
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 select-none border-[2.5px] border-ink font-bold",
        "shadow-hard pressable",
        disabled ? "cursor-not-allowed opacity-50 hover:translate-x-0 hover:translate-y-0 hover:shadow-hard !shadow-hard" : "",
        toneClasses[tone],
        shape,
        sizes[size],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Pills / tags                                                         */
/* ------------------------------------------------------------------ */

export function PillIcon({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 border-[2.5px] border-ink ${className}`}>{children}</div>
  );
}

export function Pill({
  children,
  className = "",
  filled = false,
  icon,
}: {
  children: ReactNode;
  className?: string;
  filled?: boolean;
  icon?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold",
        filled ? buttonFill("yellow") : "bg-surface2 text-ink",
        className,
      ].join(" ")}
    >
      {icon && <Icon name={icon} size={14} filled={filled} />}
      {children}
    </span>
  );
}

/* Expand tailwind fill for Pill */
function buttonFill(tone: Tone) {
  return toneClasses[tone] ?? "bg-yellow text-ink";
}

/* ------------------------------------------------------------------ */
/* Progress bar                                                         */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  color = "bg-cyan",
  className = "",
  trackClassName = "",
  fillClassName = "",
}: {
  value: number;
  color?: string;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`bar ${className} ${trackClassName}`}>
      <div className={`bar-fill ${color} ${fillClassName}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Star rating                                                          */
/* ------------------------------------------------------------------ */

export function Stars({ value, size = 18, className = "" }: { value: number; size?: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Đánh giá ${value} trên 5 sao`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon key={index} name={index < full ? "star" : "star"} filled={index < full} size={size} className={index < full ? "text-yellow-deep" : "text-faint/50"} />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Screen scaffolding                                                   */
/* ------------------------------------------------------------------ */

export function ScreenShell({
  children,
  fluid = false,
  className = "",
}: {
  children: ReactNode;
  fluid?: boolean;
  className?: string;
}) {
  return (
    <main className={`mx-auto w-full px-4 pb-32 pt-6 sm:px-6 md:pt-8 lg:pb-14 ${fluid ? "" : "max-w-[1240px]"} ${className}`}>
      {children}
    </main>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`font-extrabold text-2xl text-ink ${className}`}>{children}</h2>
  );
}

/* ------------------------------------------------------------------ */
/* Stat card                                                            */
/* ------------------------------------------------------------------ */

export function StatCard({
  label,
  value,
  icon,
  iconClass = "text-ink",
  className = "",
}: {
  label: string;
  value: ReactNode;
  icon: string;
  iconClass?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-3xl border-[2.5px] border-ink bg-surface p-5 shadow-hard ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-faint">{label}</span>
        <Icon name={icon} size={20} filled className={iconClass} />
      </div>
      <div className="mt-2 text-2xl font-extrabold text-ink">{value}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Back link                                                            */
/* ------------------------------------------------------------------ */

export function BackButton({ label = "Quay lại", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pressable inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink bg-surface px-5 py-2.5 text-sm font-bold text-ink shadow-hard"
    >
      <Icon name="arrow_back" size={20} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Decorative border strip (card header)                                */
/* ------------------------------------------------------------------ */

export function Stripe({ color }: { color: string }) {
  return <div className={`h-4 w-full border-b-[2.5px] border-ink ${color}`} />;
}