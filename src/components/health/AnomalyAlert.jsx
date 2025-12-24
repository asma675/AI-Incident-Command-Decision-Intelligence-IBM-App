import { AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AnomalyAlert({ anomaly }) {
  const getAnomalyConfig = () => {
    switch (anomaly.type) {
      case "spike":
        return {
          icon: TrendingUp,
          title: "Incident Spike Detected",
          color: "amber",
          bgColor: "bg-amber-900/30",
          borderColor: "border-amber-700/50",
          iconColor: "text-amber-400"
        };
      case "critical_cluster":
        return {
          icon: AlertTriangle,
          title: "Critical Incident Cluster",
          color: "rose",
          bgColor: "bg-rose-900/30",
          borderColor: "border-rose-700/50",
          iconColor: "text-rose-400"
        };
      default:
        return {
          icon: Zap,
          title: "System Anomaly",
          color: "blue",
          bgColor: "bg-blue-900/30",
          borderColor: "border-blue-700/50",
          iconColor: "text-blue-400"
        };
    }
  };
  
  const config = getAnomalyConfig();
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "border rounded-lg p-4 transition-all hover:shadow-lg",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
          `bg-${config.color}-900/50`
        )}>
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-semibold text-white text-sm">{config.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">System: {anomaly.system}</p>
            </div>
            <span className={cn(
              "px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
              anomaly.severity === "critical" 
                ? "bg-rose-900/50 text-rose-300 border border-rose-700/50"
                : "bg-amber-900/50 text-amber-300 border border-amber-700/50"
            )}>
              {anomaly.severity.toUpperCase()}
            </span>
          </div>
          
          <p className="text-sm text-slate-300 mb-3">{anomaly.message}</p>
          
          {anomaly.incidents?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-slate-500 mb-2">Related incidents:</p>
              {anomaly.incidents.slice(0, 3).map(incident => (
                <Link
                  key={incident.id}
                  to={createPageUrl(`IncidentDetail?id=${incident.id}`)}
                  className="block text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  • {incident.title}
                </Link>
              ))}
              {anomaly.incidents.length > 3 && (
                <p className="text-xs text-slate-500 mt-1">
                  +{anomaly.incidents.length - 3} more incidents
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}