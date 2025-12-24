import { format } from "date-fns";
import { 
  AlertCircle, Brain, CheckCircle2, XCircle, User, 
  MessageSquare, RefreshCw, FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

const actionConfig = {
  incident_created: { icon: AlertCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
  ai_analysis_generated: { icon: Brain, color: "text-violet-600", bg: "bg-violet-50" },
  decision_made: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  status_changed: { icon: RefreshCw, color: "text-sky-600", bg: "bg-sky-50" },
  assignment_changed: { icon: User, color: "text-amber-600", bg: "bg-amber-50" },
  resolution_recorded: { icon: FileText, color: "text-teal-600", bg: "bg-teal-50" },
  comment_added: { icon: MessageSquare, color: "text-slate-600", bg: "bg-slate-100" }
};

const actionLabels = {
  incident_created: "Incident Created",
  ai_analysis_generated: "AI Analysis Generated",
  decision_made: "Decision Made",
  status_changed: "Status Changed",
  assignment_changed: "Assignment Changed",
  resolution_recorded: "Resolution Recorded",
  comment_added: "Comment Added"
};

export default function AuditTimeline({ logs }) {
  if (!logs?.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No audit history yet</p>
      </div>
    );
  }
  
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
      
      <div className="space-y-4">
        {logs.map((log, index) => {
          const config = actionConfig[log.action_type] || actionConfig.comment_added;
          const Icon = config.icon;
          
          return (
            <div key={log.id || index} className="relative flex gap-4 ml-0.5">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center z-10",
                config.bg
              )}>
                <Icon className={cn("h-5 w-5", config.color)} />
              </div>
              
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {actionLabels[log.action_type] || log.action_type}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      by {log.actor === "SYSTEM" ? "System" : log.actor}
                    </p>
                  </div>
                  <time className="text-xs text-slate-400">
                    {format(new Date(log.created_date), "MMM d, h:mm a")}
                  </time>
                </div>
                
                {log.details && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-md text-sm text-slate-600">
                    {typeof log.details === "string" 
                      ? log.details 
                      : Object.entries(log.details).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-slate-400">{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))
                    }
                  </div>
                )}
                
                {(log.previous_value || log.new_value) && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    {log.previous_value && (
                      <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded line-through">
                        {log.previous_value}
                      </span>
                    )}
                    {log.previous_value && log.new_value && (
                      <span className="text-slate-400">→</span>
                    )}
                    {log.new_value && (
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
                        {log.new_value}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}