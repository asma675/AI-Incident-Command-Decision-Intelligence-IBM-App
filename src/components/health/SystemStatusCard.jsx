import { Server, AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SystemStatusCard({ system }) {
  const getStatusInfo = () => {
    if (system.criticalCount > 0) {
      return {
        status: "critical",
        icon: AlertTriangle,
        color: "text-rose-400",
        bgColor: "bg-rose-900/20",
        borderColor: "border-rose-700/50",
        label: "Critical"
      };
    }
    
    if (system.activeIncidents > 0) {
      return {
        status: "warning",
        icon: AlertTriangle,
        color: "text-amber-400",
        bgColor: "bg-amber-900/20",
        borderColor: "border-amber-700/50",
        label: "Warning"
      };
    }
    
    return {
      status: "healthy",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bgColor: "bg-emerald-900/20",
      borderColor: "border-emerald-700/50",
      label: "Healthy"
    };
  };
  
  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  
  return (
    <div className={cn(
      "bg-slate-900 border rounded-lg p-5 transition-all hover:shadow-xl",
      statusInfo.borderColor
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded flex items-center justify-center", statusInfo.bgColor)}>
            <Server className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">{system.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusIcon className={cn("h-3.5 w-3.5", statusInfo.color)} />
              <span className={cn("text-xs font-medium", statusInfo.color)}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Active Incidents</span>
          <span className={cn(
            "font-semibold",
            system.activeIncidents > 0 ? "text-rose-400" : "text-emerald-400"
          )}>
            {system.activeIncidents}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Total Incidents</span>
          <span className="text-white font-medium">{system.incidents.length}</span>
        </div>
        
        {system.lastIncident && (
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Clock className="h-3 w-3" />
              Last incident
            </div>
            <Link 
              to={createPageUrl(`IncidentDetail?id=${system.lastIncident.id}`)}
              className="text-sm text-blue-400 hover:text-blue-300 line-clamp-1 transition-colors"
            >
              {system.lastIncident.title}
            </Link>
            <p className="text-xs text-slate-500 mt-1">
              {format(new Date(system.lastIncident.created_date), "MMM d, h:mm a")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}