import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  ArrowLeft, Server, Clock, User, Brain, FileText,
  CheckCircle2, RefreshCw, Loader2, Sparkles, Zap, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import StatusBadge from "@/components/dashboard/StatusBadge";
import AIAnalysisPanel from "@/components/incident/AIAnalysisPanel";
import AuditTimeline from "@/components/incident/AuditTimeline";
import DecisionDialog from "@/components/incident/DecisionDialog";
import PostIncidentReviewPanel from "@/components/incident/PostIncidentReviewPanel";
import AutomationPanel from "@/components/incident/AutomationPanel";
import KnowledgeArticleSuggestions from "@/components/incident/KnowledgeArticleSuggestions";

export default function IncidentDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get("id");
  
  const [decisionDialog, setDecisionDialog] = useState({ open: false, recIndex: null, rec: null });
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  
  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);
  
  const { data: incident, isLoading } = useQuery({
    queryKey: ["incident", incidentId],
    queryFn: () => base44.entities.Incident.filter({ id: incidentId }).then(r => r[0]),
    enabled: !!incidentId,
    refetchInterval: 5000
  });
  
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["auditLogs", incidentId],
    queryFn: () => base44.entities.AuditLog.filter({ incident_id: incidentId }, "-created_date"),
    enabled: !!incidentId
  });
  
  const { data: decisions = [] } = useQuery({
    queryKey: ["decisions", incidentId],
    queryFn: () => base44.entities.Decision.filter({ incident_id: incidentId }),
    enabled: !!incidentId
  });
  
  const { data: review } = useQuery({
    queryKey: ["postIncidentReview", incidentId],
    queryFn: () => base44.entities.PostIncidentReview.filter({ incident_id: incidentId }).then(r => r[0]),
    enabled: !!incidentId && (incident?.status === "resolved" || incident?.status === "closed")
  });
  
  const { data: automation } = useQuery({
    queryKey: ["incidentAutomation", incidentId],
    queryFn: () => base44.entities.IncidentAutomation.filter({ incident_id: incidentId }).then(r => r[0]),
    enabled: !!incidentId
  });
  
  const updateIncident = useMutation({
    mutationFn: ({ data, auditAction, auditDetails }) => 
      Promise.all([
        base44.entities.Incident.update(incidentId, data),
        base44.entities.AuditLog.create({
          incident_id: incidentId,
          action_type: auditAction,
          actor: currentUser?.email || "Unknown",
          details: auditDetails
        })
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", incidentId] });
    }
  });
  
  const submitDecision = useMutation({
    mutationFn: async (decisionData) => {
      await base44.entities.Decision.create({
        ...decisionData,
        incident_id: incidentId,
        decided_by: currentUser?.email,
        decided_at: new Date().toISOString()
      });
      
      await base44.entities.AuditLog.create({
        incident_id: incidentId,
        action_type: "decision_made",
        actor: currentUser?.email,
        details: {
          action: decisionData.recommendation_action,
          decision: decisionData.decision,
          reason: decisionData.decision_reason
        }
      });
      
      // Update incident status if all recommendations have decisions
      const allDecisions = await base44.entities.Decision.filter({ incident_id: incidentId });
      const totalRecs = incident?.ai_analysis?.recommendations?.length || 0;
      if (allDecisions.length >= totalRecs) {
        await base44.entities.Incident.update(incidentId, { status: "in_progress" });
      }
    },
    onSuccess: () => {
      setDecisionDialog({ open: false, recIndex: null, rec: null });
      queryClient.invalidateQueries({ queryKey: ["decisions", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["auditLogs", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["incident", incidentId] });
    }
  });
  
  const handleStatusChange = (newStatus) => {
    const prevStatus = incident.status;
    updateIncident.mutate({
      data: { status: newStatus },
      auditAction: "status_changed",
      auditDetails: { previous: prevStatus, new: newStatus }
    });
  };
  
  const handleResolve = () => {
    updateIncident.mutate({
      data: { 
        status: "resolved", 
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes
      },
      auditAction: "resolution_recorded",
      auditDetails: { notes: resolutionNotes }
    });
  };
  
  const handleApprove = (index) => {
    const rec = incident.ai_analysis?.recommendations?.[index];
    setDecisionDialog({ open: true, recIndex: index, rec });
  };
  
  const handleReject = (index) => {
    const rec = incident.ai_analysis?.recommendations?.[index];
    setDecisionDialog({ open: true, recIndex: index, rec });
  };
  
  const generateReview = async () => {
    setIsGeneratingReview(true);
    try {
      await base44.functions.invoke("generatePostIncidentReview", { incident_id: incidentId });
      queryClient.invalidateQueries({ queryKey: ["postIncidentReview", incidentId] });
    } finally {
      setIsGeneratingReview(false);
    }
  };
  
  const generateArticle = async () => {
    setIsGeneratingArticle(true);
    try {
      const { data } = await base44.functions.invoke("generateArticleFromIncident", { incident_id: incidentId });
      window.location.href = createPageUrl(`ArticleDetail?id=${data.article.id}`);
    } finally {
      setIsGeneratingArticle(false);
    }
  };
  
  const isPending = incident?.status === "awaiting_approval";
  const isResolved = incident?.status === "resolved" || incident?.status === "closed";
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  
  if (!incident) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Incident not found</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="ghost" className="mb-6 -ml-2 text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={incident.severity} size="lg" />
                <StatusBadge status={incident.status} />
                {incident.status === "analyzing" && (
                  <span className="flex items-center gap-1.5 text-sm text-violet-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI analyzing...
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl font-semibold text-slate-900">{incident.title}</h1>
              
              {incident.description && (
                <p className="text-slate-600">{incident.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {format(new Date(incident.created_date), "MMM d, yyyy 'at' h:mm a")}
                </span>
                {incident.source && (
                  <span className="flex items-center gap-1.5">
                    <Server className="h-4 w-4" />
                    {incident.source}
                  </span>
                )}
                {incident.assigned_to && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {incident.assigned_to}
                  </span>
                )}
              </div>
              
              {incident.affected_systems?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {incident.affected_systems.map((sys, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-sm rounded-md">
                      {sys}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Select value={incident.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="analyzing">AI Analyzing</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              {incident.status === "in_progress" && (
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleStatusChange("resolved")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Resolved
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs Content */}
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Analysis
            </TabsTrigger>
            {automation && (
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automation
              </TabsTrigger>
            )}
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
            <TabsTrigger value="resolution" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Resolution
            </TabsTrigger>
            {isResolved && (
              <TabsTrigger value="review" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Post-Incident Review
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="analysis">
            {incident.ai_analysis ? (
              <AIAnalysisPanel 
                analysis={incident.ai_analysis}
                onApprove={handleApprove}
                onReject={handleReject}
                isPending={isPending}
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                <p className="text-slate-600">AI is analyzing this incident...</p>
                <p className="text-sm text-slate-400 mt-1">This usually takes 10-30 seconds</p>
              </div>
            )}
          </TabsContent>

          {automation && (
            <TabsContent value="automation">
              <AutomationPanel automation={automation} />
            </TabsContent>
          )}
          
          <TabsContent value="audit">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Audit Trail</h2>
              <AuditTimeline logs={auditLogs} />
            </div>
          </TabsContent>
          
          <TabsContent value="resolution">
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Resolution Notes</h2>

                {incident.status === "resolved" || incident.status === "closed" ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
                      <p className="text-sm font-medium text-emerald-300">Resolved</p>
                      {incident.resolved_at && (
                        <p className="text-xs text-emerald-400 mt-1">
                          {format(new Date(incident.resolved_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </div>
                    {incident.resolution_notes && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Notes</p>
                        <p className="text-slate-300">{incident.resolution_notes}</p>
                      </div>
                    )}

                    <Button 
                      onClick={generateArticle}
                      disabled={isGeneratingArticle}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      {isGeneratingArticle ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Article...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Create Knowledge Article
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Document the resolution steps, root cause confirmation, and any follow-up actions..."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="min-h-[150px]"
                    />
                    <Button onClick={handleResolve} className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Record Resolution
                    </Button>
                  </div>
                )}
              </div>

              {/* Knowledge Article Suggestions */}
              <KnowledgeArticleSuggestions incidentId={incidentId} />
            </div>
          </TabsContent>

          {isResolved && (
            <TabsContent value="review">
              {review ? (
                <PostIncidentReviewPanel review={review} />
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Generate Post-Incident Review
                  </h3>
                  <p className="text-slate-400 mb-6 max-w-md mx-auto">
                    Let AI analyze the entire incident lifecycle to create a comprehensive review with learnings, 
                    improvement areas, and follow-up actions.
                  </p>
                  <Button 
                    onClick={generateReview} 
                    disabled={isGeneratingReview}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isGeneratingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Review...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Review
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
          </Tabs>
          </div>
      
      <DecisionDialog
        open={decisionDialog.open}
        onOpenChange={(open) => setDecisionDialog(prev => ({ ...prev, open }))}
        recommendation={decisionDialog.rec}
        recommendationIndex={decisionDialog.recIndex}
        onSubmit={submitDecision.mutate}
        isSubmitting={submitDecision.isPending}
      />
    </div>
  );
}