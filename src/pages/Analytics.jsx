import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/dashboard/MetricCard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COLORS = {
  critical: "#f43f5e",
  high: "#f59e0b",
  medium: "#0ea5e9",
  low: "#94a3b8"
};

const STATUS_COLORS = {
  new: "#6366f1",
  analyzing: "#8b5cf6",
  awaiting_approval: "#f59e0b",
  in_progress: "#0ea5e9",
  resolved: "#10b981",
  closed: "#64748b"
};

export default function Analytics() {
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["analyticsIncidents"],
    queryFn: () => base44.entities.Incident.list("-created_date", 200)
  });
  
  const { data: reviews = [] } = useQuery({
    queryKey: ["postIncidentReviews"],
    queryFn: () => base44.entities.PostIncidentReview.list("-created_date", 10),
  });
  
  // Severity distribution
  const severityData = ["critical", "high", "medium", "low"].map(severity => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: incidents.filter(i => i.severity === severity).length,
    color: COLORS[severity]
  })).filter(d => d.value > 0);
  
  // Status distribution
  const statusData = Object.entries(STATUS_COLORS).map(([status, color]) => ({
    name: status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    value: incidents.filter(i => i.status === status).length,
    color
  })).filter(d => d.value > 0);
  
  // AI confidence distribution
  const confidenceBuckets = [
    { range: "90-100%", min: 0.9, max: 1, count: 0 },
    { range: "70-89%", min: 0.7, max: 0.89, count: 0 },
    { range: "50-69%", min: 0.5, max: 0.69, count: 0 },
    { range: "0-49%", min: 0, max: 0.49, count: 0 }
  ];
  
  incidents.forEach(incident => {
    const conf = incident.ai_analysis?.confidence_score;
    if (conf !== undefined) {
      const bucket = confidenceBuckets.find(b => conf >= b.min && conf <= b.max);
      if (bucket) bucket.count++;
    }
  });
  
  // Source distribution
  const sourceMap = {};
  incidents.forEach(i => {
    if (i.source) {
      sourceMap[i.source] = (sourceMap[i.source] || 0) + 1;
    }
  });
  const sourceData = Object.entries(sourceMap)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
  
  // Weekly trend (last 4 weeks)
  const weeklyData = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    
    const weekIncidents = incidents.filter(inc => {
      const date = new Date(inc.created_date);
      return date >= weekStart && date < weekEnd;
    });
    
    weeklyData.push({
      week: `Week ${4 - i}`,
      total: weekIncidents.length,
      critical: weekIncidents.filter(i => i.severity === "critical").length,
      resolved: weekIncidents.filter(i => i.status === "resolved" || i.status === "closed").length
    });
  }
  
  const avgConfidence = incidents
    .filter(i => i.ai_analysis?.confidence_score)
    .reduce((sum, i) => sum + i.ai_analysis.confidence_score, 0) / 
    incidents.filter(i => i.ai_analysis?.confidence_score).length * 100 || 0;
  
  const resolvedIncidents = incidents.filter(i => i.status === "resolved" || i.status === "closed");
  
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-blue-600" />
            Analytics & Insights
          </h1>
          <p className="text-slate-400 mt-1">
            Operational metrics and AI performance analysis
          </p>
        </div>
        
        {/* Recent Post-Incident Reviews */}
        {reviews.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                Recent Post-Incident Reviews
              </h2>
            </div>
            <div className="space-y-3">
              {reviews.slice(0, 3).map(review => (
                <Link 
                  key={review.id} 
                  to={createPageUrl(`IncidentDetail?id=${review.incident_id}`)}
                  className="block"
                >
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:shadow-xl hover:shadow-blue-600/10 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">
                            Review for Incident #{review.incident_id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">
                          {review.executive_summary}
                        </p>
                        {review.key_learnings?.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-500">
                              {review.key_learnings.length} key learnings
                            </span>
                            <span className="text-slate-700">•</span>
                            <span className="text-xs text-slate-500">
                              {review.follow_up_actions?.length || 0} follow-up actions
                            </span>
                          </div>
                        )}
                      </div>
                      {review.confidence_score && (
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">Confidence</div>
                          <div className="text-lg font-semibold text-blue-400">
                            {Math.round(review.confidence_score * 100)}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Incidents"
            value={incidents.length}
            icon={AlertTriangle}
          />
          <MetricCard
            title="Resolution Rate"
            value={`${incidents.length > 0 ? Math.round(resolvedIncidents.length / incidents.length * 100) : 0}%`}
            icon={CheckCircle2}
          />
          <MetricCard
            title="Avg AI Confidence"
            value={`${avgConfidence.toFixed(0)}%`}
            icon={TrendingUp}
          />
          <MetricCard
            title="Critical Active"
            value={incidents.filter(i => i.severity === "critical" && !["resolved", "closed"].includes(i.status)).length}
            icon={Clock}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Severity Distribution */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Status Distribution */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Trend */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Weekly Incident Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="critical" name="Critical" stroke="#f43f5e" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Confidence Distribution */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">AI Confidence Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceBuckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Alert Sources */}
        {sourceData.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Incidents by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}