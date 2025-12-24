import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ConfidenceIndicator({ score, showLabel = true, size = "md" }) {
  const percentage = Math.round(score * 100);
  
  const getColor = () => {
    if (percentage >= 80) return { bar: "bg-emerald-500", text: "text-emerald-700", label: "High Confidence" };
    if (percentage >= 60) return { bar: "bg-sky-500", text: "text-sky-700", label: "Moderate Confidence" };
    if (percentage >= 40) return { bar: "bg-amber-500", text: "text-amber-700", label: "Low Confidence" };
    return { bar: "bg-rose-500", text: "text-rose-700", label: "Very Low Confidence" };
  };
  
  const color = getColor();
  
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", size === "sm" ? "gap-1.5" : "gap-2")}>
        <div className={cn(
          "relative bg-slate-100 rounded-full overflow-hidden",
          size === "sm" ? "h-1.5 w-16" : "h-2 w-24"
        )}>
          <div 
            className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", color.bar)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={cn(
          "font-semibold tabular-nums",
          color.text,
          size === "sm" ? "text-xs" : "text-sm"
        )}>
          {percentage}%
        </span>
        {showLabel && (
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{color.label}</p>
              <p className="text-xs text-slate-400 mt-1">AI certainty based on available data</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}