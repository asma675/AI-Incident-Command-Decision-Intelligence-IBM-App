import { TrendingUp, Shield, AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";

export default function PredictiveRiskPanel({ alerts }) {
  const highRiskAlerts = alerts.filter(a => a.likelihood >= 0.7 && a.severity === "critical");
  const mediumRiskAlerts = alerts.filter(a => 
    (a.likelihood >= 0.5 && a.likelihood < 0.7) || 
    (a.severity === "high" && a.likelihood >= 0.6)
  );
  
  return (
    <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700/50 rounded-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Predictive Risk Analysis
          </h2>
          <p className="text-sm text-blue-300 mt-1">
            AI-identified potential incidents before they occur
          </p>
        </div>
        <Link to={createPageUrl("Predictions")}>
          <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
            View All
            <ChevronRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span className="text-xs font-medium text-slate-400">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-white">{highRiskAlerts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Immediate attention required</p>
        </div>
        
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium text-slate-400">Medium Risk</span>
          </div>
          <p className="text-2xl font-bold text-white">{mediumRiskAlerts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Monitor closely</p>
        </div>
        
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-400">Total Predictions</span>
          </div>
          <p className="text-2xl font-bold text-white">{alerts.length}</p>
          <p className="text-xs text-slate-500 mt-1">Active forecasts</p>
        </div>
      </div>
      
      {highRiskAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-rose-300 mb-3">Top Priority Risks</h3>
          {highRiskAlerts.slice(0, 3).map(alert => (
            <div 
              key={alert.id}
              className="bg-slate-900/70 border border-rose-700/30 rounded-lg p-3 hover:border-rose-700/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white line-clamp-1">
                    {alert.predicted_issue}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">
                      Timeframe: {alert.predicted_timeframe}
                    </span>
                    {alert.affected_systems?.length > 0 && (
                      <>
                        <span className="text-slate-700">•</span>
                        <span className="text-xs text-slate-500">
                          {alert.affected_systems.length} system{alert.affected_systems.length > 1 ? 's' : ''} at risk
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={cn(
                    "text-xs font-semibold mb-1",
                    alert.severity === "critical" ? "text-rose-400" : 
                    alert.severity === "high" ? "text-amber-400" : "text-blue-400"
                  )}>
                    {Math.round(alert.likelihood * 100)}%
                  </div>
                  <div className="text-xs text-slate-500">likelihood</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}