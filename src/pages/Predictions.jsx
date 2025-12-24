import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  AlertTriangle, TrendingUp, CheckCircle2, XCircle, 
  RefreshCw, Clock, Shield, Zap, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import ConfidenceIndicator from "@/components/dashboard/ConfidenceIndicator";

function PredictiveAlertCard({ alert, onDismiss, onMarkPrevented }) {
  const [expanded, setExpanded] = useState(false);
  
  const likelihoodColor = alert.likelihood >= 0.7 ? "text-rose-600" : 
                          alert.likelihood >= 0.5 ? "text-amber-600" : "text-sky-600";
  
  return (
    <Card className={cn(
      "border-l-4 transition-all",
      alert.severity === "critical" && "border-l-rose-500 bg-rose-50/30",
      alert.severity === "high" && "border-l-amber-500 bg-amber-50/30",
      alert.severity === "medium" && "border-l-sky-500 bg-sky-50/30",
      alert.severity === "low" && "border-l-slate-400 bg-slate-50/30"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={alert.severity} />
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {alert.predicted_timeframe}
              </span>
              <span className={cn("text-sm font-semibold", likelihoodColor)}>
                {Math.round(alert.likelihood * 100)}% likely
              </span>
            </div>
            
            <CardTitle className="text-lg font-semibold text-slate-900">
              {alert.predicted_issue}
            </CardTitle>
            
            <p className="text-slate-600 text-sm">{alert.description}</p>
            
            {alert.affected_systems?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {alert.affected_systems.map((sys, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-xs rounded">
                    {sys}
                  </span>
                ))}
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">AI Confidence</p>
              <ConfidenceIndicator score={alert.confidence_score} showLabel={false} size="sm" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded(!expanded)}
              className="text-xs"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-6 pt-0">
          {/* Contributing Factors */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-600" />
              Contributing Factors
            </h4>
            <div className="space-y-2">
              {alert.contributing_factors?.map((factor, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm text-slate-900">{factor.factor}</p>
                    <span className="text-xs font-semibold text-slate-600">
                      {Math.round(factor.impact_score * 100)}% impact
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{factor.evidence}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Preventative Actions */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              Recommended Preventative Actions
            </h4>
            <div className="space-y-3">
              {alert.preventative_actions?.map((action, i) => (
                <div key={i} className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-sm text-slate-900">{action.action}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      action.priority === "critical" && "bg-rose-100 text-rose-700",
                      action.priority === "high" && "bg-amber-100 text-amber-700",
                      action.priority === "medium" && "bg-sky-100 text-sky-700"
                    )}>
                      {action.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>Effort: {action.estimated_effort}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-medium">
                      {Math.round(action.risk_reduction * 100)}% risk reduction
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Similar Historical Incidents */}
          {alert.similar_historical_incidents?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Similar Past Incidents</h4>
              <ul className="space-y-1">
                {alert.similar_historical_incidents.map((incident, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    {incident}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Data Sources */}
          {alert.data_sources?.length > 0 && (
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-400 mb-1">Data Sources:</p>
              <div className="flex flex-wrap gap-2">
                {alert.data_sources.map((source, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-200">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkPrevented(alert)}
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Prevented
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDismiss(alert)}
              className="flex-1 text-rose-600 hover:text-rose-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function Predictions() {
  const queryClient = useQueryClient();
  const [dismissDialog, setDismissDialog] = useState({ open: false, alert: null });
  const [dismissReason, setDismissReason] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["predictiveAlerts"],
    queryFn: () => base44.entities.PredictiveAlert.filter({ status: "active" }, "-created_date"),
  });
  
  const { data: historicalAlerts = [] } = useQuery({
    queryKey: ["historicalAlerts"],
    queryFn: () => base44.entities.PredictiveAlert.filter(
      { status: { $in: ["prevented", "dismissed", "occurred"] } }, 
      "-updated_date", 
      20
    ),
  });
  
  const generatePredictions = async () => {
    setIsGenerating(true);
    try {
      await base44.functions.invoke("generatePredictions", {});
      queryClient.invalidateQueries({ queryKey: ["predictiveAlerts"] });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const updateAlert = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PredictiveAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictiveAlerts"] });
      queryClient.invalidateQueries({ queryKey: ["historicalAlerts"] });
      setDismissDialog({ open: false, alert: null });
      setDismissReason("");
    }
  });
  
  const handleDismiss = (alert) => {
    setDismissDialog({ open: true, alert });
  };
  
  const confirmDismiss = () => {
    updateAlert.mutate({
      id: dismissDialog.alert.id,
      data: { status: "dismissed", dismissed_reason: dismissReason }
    });
  };
  
  const handleMarkPrevented = (alert) => {
    updateAlert.mutate({
      id: alert.id,
      data: { status: "prevented" }
    });
  };
  
  const preventedCount = historicalAlerts.filter(a => a.status === "prevented").length;
  const occurredCount = historicalAlerts.filter(a => a.status === "occurred").length;
  const preventionRate = historicalAlerts.length > 0 
    ? Math.round((preventedCount / (preventedCount + occurredCount)) * 100) 
    : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-indigo-600" />
                Predictive Intelligence
              </h1>
              <p className="text-slate-500 mt-1">
                AI-powered forecasting to prevent incidents before they occur
              </p>
            </div>
            <Button 
              onClick={generatePredictions} 
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate New Predictions
                </>
              )}
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Active Alerts</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{alerts.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Prevention Rate</p>
                    <p className="text-2xl font-semibold text-emerald-600 mt-1">{preventionRate}%</p>
                  </div>
                  <Shield className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Prevented</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{preventedCount}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Active Predictions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Active Predictions</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-800">No active predictions</h3>
                <p className="text-slate-500 mt-1 mb-4">
                  Generate predictions to analyze potential future incidents
                </p>
                <Button onClick={generatePredictions} disabled={isGenerating}>
                  {isGenerating ? "Analyzing..." : "Generate Predictions"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts
                .sort((a, b) => b.likelihood - a.likelihood)
                .map(alert => (
                  <PredictiveAlertCard
                    key={alert.id}
                    alert={alert}
                    onDismiss={handleDismiss}
                    onMarkPrevented={handleMarkPrevented}
                  />
                ))}
            </div>
          )}
        </div>
        
        {/* Historical */}
        {historicalAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Historical Predictions</h2>
            <div className="space-y-3">
              {historicalAlerts.map(alert => (
                <Card key={alert.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <SeverityBadge severity={alert.severity} size="sm" />
                          {alert.status === "prevented" && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Prevented
                            </span>
                          )}
                          {alert.status === "dismissed" && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                              Dismissed
                            </span>
                          )}
                          {alert.status === "occurred" && (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded">
                              Occurred
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-slate-900">{alert.predicted_issue}</p>
                        {alert.dismissed_reason && (
                          <p className="text-xs text-slate-500 mt-1">Reason: {alert.dismissed_reason}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {Math.round(alert.likelihood * 100)}% likely
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Dismiss Dialog */}
      <Dialog open={dismissDialog.open} onOpenChange={(open) => setDismissDialog({ open, alert: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Prediction</DialogTitle>
            <DialogDescription>
              Please provide a reason for dismissing this prediction for audit purposes.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            placeholder="Why are you dismissing this alert? (e.g., false positive, already addressed, etc.)"
            value={dismissReason}
            onChange={(e) => setDismissReason(e.target.value)}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDismissDialog({ open: false, alert: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDismiss} 
              disabled={!dismissReason.trim()}
            >
              Confirm Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}