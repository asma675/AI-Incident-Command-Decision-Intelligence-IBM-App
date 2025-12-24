import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Activity, Server, Zap, TrendingUp, AlertCircle, 
  CheckCircle2, Clock, Shield, RefreshCw, Loader2, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SystemStatusCard from "@/components/health/SystemStatusCard";
import PerformanceChart from "@/components/health/PerformanceChart";
import AnomalyAlert from "@/components/health/AnomalyAlert";
import PredictiveRiskPanel from "@/components/health/PredictiveRiskPanel";
import MetricCard from "@/components/dashboard/MetricCard";

export default function SystemHealth() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isGeneratingPredictions, setIsGeneratingPredictions] = useState(false);
  
  const { data: incidents = [], refetch: refetchIncidents } = useQuery({
    queryKey: ["healthIncidents"],
    queryFn: () => base44.entities.Incident.list("-created_date", 100),
    refetchInterval: autoRefresh ? 30000 : false
  });
  
  const { data: predictiveAlerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ["healthPredictiveAlerts"],
    queryFn: () => base44.entities.PredictiveAlert.filter({ status: "active" }),
    refetchInterval: autoRefresh ? 30000 : false
  });
  
  // Extract affected systems from incidents
  const systemsMap = {};
  incidents.forEach(incident => {
    incident.affected_systems?.forEach(system => {
      if (!systemsMap[system]) {
        systemsMap[system] = {
          name: system,
          incidents: [],
          activeIncidents: 0,
          criticalCount: 0,
          lastIncident: null
        };
      }
      
      systemsMap[system].incidents.push(incident);
      
      if (!["resolved", "closed"].includes(incident.status)) {
        systemsMap[system].activeIncidents++;
        if (incident.severity === "critical") {
          systemsMap[system].criticalCount++;
        }
      }
      
      if (!systemsMap[system].lastIncident || 
          new Date(incident.created_date) > new Date(systemsMap[system].lastIncident.created_date)) {
        systemsMap[system].lastIncident = incident;
      }
    });
  });
  
  const systems = Object.values(systemsMap);
  
  // Detect anomalies
  const anomalies = [];
  const now = new Date();
  const last24h = new Date(now - 24 * 60 * 60 * 1000);
  
  systems.forEach(system => {
    const recent = system.incidents.filter(i => new Date(i.created_date) > last24h);
    
    if (recent.length >= 3) {
      anomalies.push({
        system: system.name,
        type: "spike",
        severity: "high",
        message: `${recent.length} incidents in last 24h`,
        incidents: recent
      });
    }
    
    if (system.criticalCount >= 2) {
      anomalies.push({
        system: system.name,
        type: "critical_cluster",
        severity: "critical",
        message: `${system.criticalCount} critical incidents active`,
        incidents: system.incidents.filter(i => 
          i.severity === "critical" && !["resolved", "closed"].includes(i.status)
        )
      });
    }
  });
  
  // Calculate metrics
  const activeIncidents = incidents.filter(i => !["resolved", "closed"].includes(i.status));
  const healthySystemsCount = systems.filter(s => s.activeIncidents === 0).length;
  const systemsAtRisk = systems.filter(s => s.activeIncidents > 0).length;
  const overallHealth = systems.length > 0 
    ? Math.round((healthySystemsCount / systems.length) * 100) 
    : 100;
  
  const handleRefresh = () => {
    refetchIncidents();
    refetchAlerts();
  };
  
  const handleGeneratePredictions = async () => {
    setIsGeneratingPredictions(true);
    try {
      await base44.functions.invoke('generatePredictions', {});
      await refetchAlerts();
    } finally {
      setIsGeneratingPredictions(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
              <Activity className="h-7 w-7 text-emerald-500" />
              System Health Dashboard
            </h1>
            <p className="text-slate-400 mt-1">
              Real-time monitoring and predictive risk analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Now
            </Button>
          </div>
        </div>
        
        {/* Overall Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Overall System Health"
            value={`${overallHealth}%`}
            icon={Shield}
            trend={overallHealth >= 90 ? "Excellent" : overallHealth >= 70 ? "Good" : "Critical"}
            trendDirection={overallHealth >= 90 ? "neutral" : overallHealth >= 70 ? "neutral" : "down"}
            className={overallHealth >= 90 ? "border-emerald-600/30" : overallHealth >= 70 ? "border-yellow-600/30" : "border-rose-600/30"}
          />
          <MetricCard
            title="Systems at Risk"
            value={systemsAtRisk}
            icon={AlertCircle}
            subtext={`${healthySystemsCount} healthy`}
          />
          <MetricCard
            title="Active Incidents"
            value={activeIncidents.length}
            icon={Zap}
            trend={`${incidents.filter(i => i.severity === "critical" && !["resolved", "closed"].includes(i.status)).length} critical`}
            trendDirection={activeIncidents.length > 0 ? "up" : "neutral"}
          />
          <MetricCard
            title="Predictive Alerts"
            value={predictiveAlerts.length}
            icon={TrendingUp}
            subtext="Potential risks detected"
          />
        </div>
        
        {/* Anomaly Alerts */}
        {anomalies.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" />
              System Anomalies Detected
            </h2>
            <div className="space-y-3">
              {anomalies.map((anomaly, idx) => (
                <AnomalyAlert key={idx} anomaly={anomaly} />
              ))}
            </div>
          </div>
        )}
        
        {/* Predictive Risk Panel */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              AI Predictive Alerts
            </h2>
            <Button
              onClick={handleGeneratePredictions}
              disabled={isGeneratingPredictions}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {isGeneratingPredictions ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
          {predictiveAlerts.length > 0 ? (
            <PredictiveRiskPanel alerts={predictiveAlerts} />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Active Predictions</h3>
              <p className="text-slate-500 mb-4">
                AI hasn't detected any potential risks yet. Generate predictions based on historical data.
              </p>
              <Button
                onClick={handleGeneratePredictions}
                disabled={isGeneratingPredictions}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingPredictions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Predictions
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {/* Performance Charts */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Real-Time Performance Trends
          </h2>
          <PerformanceChart incidents={incidents} />
        </div>
        
        {/* System Status Cards */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-slate-400" />
            Integrated Systems Status
          </h2>
          {systems.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <Server className="h-12 w-12 mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No Systems Detected</h3>
              <p className="text-slate-500">
                Systems will appear here once incidents with affected systems are reported
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systems.map(system => (
                <SystemStatusCard key={system.name} system={system} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}