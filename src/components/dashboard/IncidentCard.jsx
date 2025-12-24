import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, Server, ChevronRight } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";
import ConfidenceIndicator from "./ConfidenceIndicator";
import { cn } from "@/lib/utils";

export default function IncidentCard({ incident }) {
  const hasAnalysis = incident.ai_analysis?.confidence_score;
  
  return (
    <Link 
      to={createPageUrl(`IncidentDetail?id=${incident.id}`)}
      className={cn(
        "block bg-slate-900 border rounded-lg p-4 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300 group",
        incident.severity === "critical" ? "border-rose-900/50 hover:border-rose-700/50" : "border-slate-800 hover:border-slate-700"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
          
          <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
            {incident.title}
          </h3>

          {incident.description && (
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">
              {incident.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(incident.created_date), { addSuffix: true })}
            </span>
            {incident.source && (
              <span className="flex items-center gap-1">
                <Server className="h-3.5 w-3.5" />
                {incident.source}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {hasAnalysis && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">AI Confidence</p>
              <ConfidenceIndicator score={incident.ai_analysis.confidence_score} showLabel={false} size="sm" />
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all mt-auto" />
        </div>
      </div>
      
      {incident.affected_systems?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
          {incident.affected_systems.slice(0, 4).map((sys, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded-md border border-slate-700">
              {sys}
            </span>
          ))}
          {incident.affected_systems.length > 4 && (
            <span className="px-2 py-0.5 text-slate-500 text-xs">
              +{incident.affected_systems.length - 4} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}