import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  Shield, CheckCircle2, XCircle, Edit3, 
  TrendingUp, Clock, Users, Brain
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "@/components/dashboard/MetricCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function Governance() {
  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: ["allDecisions"],
    queryFn: () => base44.entities.Decision.list("-created_date", 100)
  });
  
  const { data: incidents = [] } = useQuery({
    queryKey: ["allIncidents"],
    queryFn: () => base44.entities.Incident.list("-created_date", 100)
  });
  
  const approvedCount = decisions.filter(d => d.decision === "approved").length;
  const rejectedCount = decisions.filter(d => d.decision === "rejected").length;
  const modifiedCount = decisions.filter(d => d.decision === "modified").length;
  
  const approvalRate = decisions.length > 0 
    ? Math.round((approvedCount / decisions.length) * 100) 
    : 0;
    
  const avgConfidence = incidents.length > 0
    ? (incidents.reduce((sum, i) => sum + (i.ai_analysis?.confidence_score || 0), 0) / 
       incidents.filter(i => i.ai_analysis?.confidence_score).length * 100).toFixed(0)
    : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
            <Shield className="h-7 w-7 text-indigo-600" />
            AI Governance Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor AI decision quality, human oversight, and system accountability
          </p>
        </div>
        
        {/* Governance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Decisions"
            value={decisions.length}
            icon={CheckCircle2}
            subtext="Human decisions recorded"
          />
          <MetricCard
            title="AI Approval Rate"
            value={`${approvalRate}%`}
            icon={TrendingUp}
            subtext={`${approvedCount} approved / ${rejectedCount} rejected`}
          />
          <MetricCard
            title="Modified Decisions"
            value={modifiedCount}
            icon={Edit3}
            subtext="Human overrides of AI"
          />
          <MetricCard
            title="Avg AI Confidence"
            value={`${avgConfidence}%`}
            icon={Brain}
            subtext="Across all analyses"
          />
        </div>
        
        {/* Trust Principles */}
        <Card className="mb-8 border-indigo-200 bg-gradient-to-r from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              IBM Trustworthy AI Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Explainability</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Every AI recommendation includes rationale, confidence scores, and limitations
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Human Control</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    AI cannot auto-act. All recommendations require human approval
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-sky-600" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-900">Accountability</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Complete audit trail for every decision with timestamps and reasoning
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Decision History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Decision History</CardTitle>
          </CardHeader>
          <CardContent>
            {decisionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
                ))}
              </div>
            ) : decisions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No decisions recorded yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recommendation</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Decided By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Justification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {decisions.slice(0, 20).map(decision => (
                    <TableRow key={decision.id}>
                      <TableCell className="max-w-[200px] truncate">
                        {decision.recommendation_action}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
                          decision.decision === "approved" && "bg-emerald-50 text-emerald-700",
                          decision.decision === "rejected" && "bg-rose-50 text-rose-700",
                          decision.decision === "modified" && "bg-amber-50 text-amber-700"
                        )}>
                          {decision.decision === "approved" && <CheckCircle2 className="h-3 w-3" />}
                          {decision.decision === "rejected" && <XCircle className="h-3 w-3" />}
                          {decision.decision === "modified" && <Edit3 className="h-3 w-3" />}
                          {decision.decision}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {decision.decided_by}
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {decision.decided_at && format(new Date(decision.decided_at), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-slate-500 text-sm">
                        {decision.decision_reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}