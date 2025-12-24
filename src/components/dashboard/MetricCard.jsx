import { cn } from "@/lib/utils";

export default function MetricCard({ title, value, subtext, icon: Icon, trend, trendDirection, className }) {
  return (
    <div className={cn(
      "bg-slate-900 border border-slate-800 rounded-lg p-5 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-semibold text-white tracking-tight">{value}</p>
          {subtext && <p className="text-xs text-slate-500">{subtext}</p>}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded bg-slate-800 flex items-center justify-center">
            <Icon className="h-5 w-5 text-blue-400" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <span className={cn(
            "text-xs font-medium",
            trendDirection === "up" ? "text-emerald-400" : trendDirection === "down" ? "text-rose-400" : "text-slate-400"
          )}>
            {trendDirection === "up" ? "↑" : trendDirection === "down" ? "↓" : "→"} {trend}
          </span>
        </div>
      )}
    </div>
  );
}