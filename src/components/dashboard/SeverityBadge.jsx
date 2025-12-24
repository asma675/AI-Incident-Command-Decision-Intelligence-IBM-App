import { cn } from "@/lib/utils";

const severityConfig = {
  critical: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
    pulse: true
  },
  high: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    pulse: false
  },
  medium: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-500",
    pulse: false
  },
  low: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
    pulse: false
  }
};

export default function SeverityBadge({ severity, size = "sm" }) {
  const config = severityConfig[severity] || severityConfig.low;
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium capitalize",
      config.bg, config.border, config.text,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <span className={cn(
        "rounded-full",
        config.dot,
        size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        config.pulse && "animate-pulse"
      )} />
      {severity}
    </span>
  );
}