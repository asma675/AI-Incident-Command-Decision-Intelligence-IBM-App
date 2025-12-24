import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  AlertTriangle, CheckCircle2, Clock, TrendingUp, 
  Plus, Filter, Search, RefreshCw, Brain, Shield, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MetricCard from "@/components/dashboard/MetricCard";
import IncidentCard from "@/components/dashboard/IncidentCard";

export default function Dashboard() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: incidents = [], isLoading, refetch } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => base44.entities.Incident.list("-created_date", 100),
  });
  
  const { data: predictiveAlerts = [] } = useQuery({
    queryKey: ["activePredictions"],
    queryFn: () => base44.entities.PredictiveAlert.filter({ status: "active" }, "-likelihood", 5),
  });
  
  const filteredIncidents = incidents.filter(incident => {
    const matchesSeverity = severityFilter === "all" || incident.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    const matchesSearch = !searchQuery || 
      incident.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });
  
  const activeIncidents = incidents.filter(i => !["resolved", "closed"].includes(i.status));
  const criticalCount = activeIncidents.filter(i => i.severity === "critical").length;
  const awaitingApproval = incidents.filter(i => i.status === "awaiting_approval").length;
  const resolvedToday = incidents.filter(i => {
    if (i.status !== "resolved") return false;
    const today = new Date().toDateString();
    return new Date(i.resolved_at || i.updated_date).toDateString() === today;
  }).length;
  
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Incident Command Center
            </h1>
            <p className="text-slate-400 mt-1">
              AI-powered decision intelligence for enterprise operations
            </p>
          </div>
          <Link to={createPageUrl("CreateIncident")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </Link>
        </div>
        
        {/* Predictive Alerts Banner */}
        {predictiveAlerts.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-700/50 rounded-lg p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-amber-400" />
                  <h3 className="font-semibold text-amber-200">
                    {predictiveAlerts.length} Proactive Alert{predictiveAlerts.length > 1 ? 's' : ''}
                  </h3>
                </div>
                <p className="text-sm text-amber-300 mb-3">
                  AI has identified potential incidents before they occur. Take preventative action now.
                </p>
                <div className="space-y-2">
                  {predictiveAlerts.slice(0, 2).map(alert => (
                    <div key={alert.id} className="flex items-center gap-3 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        alert.severity === "critical" ? "bg-rose-100 text-rose-700" :
                        alert.severity === "high" ? "bg-amber-100 text-amber-700" :
                        "bg-sky-100 text-sky-700"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-slate-200 flex-1">{alert.predicted_issue}</span>
                      <span className="text-amber-300 font-semibold">
                        {Math.round(alert.likelihood * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Link to={createPageUrl("Predictions")}>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Shield className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Active Incidents"
            value={activeIncidents.length}
            icon={AlertTriangle}
            trend={`${criticalCount} critical`}
            trendDirection={criticalCount > 0 ? "up" : "neutral"}
          />
          <MetricCard
            title="Awaiting Approval"
            value={awaitingApproval}
            icon={Brain}
            subtext="Human decisions pending"
          />
          <MetricCard
            title="Resolved Today"
            value={resolvedToday}
            icon={CheckCircle2}
            trend="Keep it up!"
            trendDirection="neutral"
          />
          <MetricCard
            title="Total Incidents"
            value={incidents.length}
            icon={TrendingUp}
            subtext="All time"
          />
        </div>
        
        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="analyzing">AI Analyzing</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Incidents List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-lg shadow-lg">
            <AlertTriangle className="h-12 w-12 mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-slate-200">No incidents found</h3>
            <p className="text-slate-400 mt-1">
              {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Report a new incident to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map(incident => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}