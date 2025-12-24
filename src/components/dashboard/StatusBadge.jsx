import { cn } from "@/lib/utils";

const statusConfig = {
  new: { bg: "bg-indigo-50", text: "text-indigo-700", label: "New" },
  analyzing: { bg: "bg-violet-50", text: "text-violet-700", label: "AI Analyzing" },
  awaiting_approval: { bg: "bg-amber-50", text: "text-amber-700", label: "Awaiting Approval" },
  in_progress: { bg: "bg-sky-50", text: "text-sky-700", label: "In Progress" },
  resolved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Resolved" },
  closed: { bg: "bg-slate-100", text: "text-slate-600", label: "Closed" }
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.new;
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
      config.bg, config.text
    )}>
      {config.label}
    </span>
  );
}