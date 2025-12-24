import { 
  FileText, TrendingUp, AlertCircle, CheckCircle2, 
  Target, Lightbulb, ChevronDown, ChevronUp, Calendar, User
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ConfidenceIndicator from "@/components/dashboard/ConfidenceIndicator";

export default function PostIncidentReviewPanel({ review }) {
  const [expandedSections, setExpandedSections] = useState({
    timeline: false,
    rootCause: true,
    learnings: true,
    improvements: true,
    actions: true
  });
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const priorityColors = {
    critical: "bg-rose-100 text-rose-700 border-rose-200",
    high: "bg-amber-100 text-amber-700 border-amber-200",
    medium: "bg-sky-100 text-sky-700 border-sky-200",
    low: "bg-slate-100 text-slate-600 border-slate-200"
  };
  
  const categoryColors = {
    Process: "bg-blue-100 text-blue-700",
    Technical: "bg-purple-100 text-purple-700",
    Organizational: "bg-emerald-100 text-emerald-700"
  };
  
  return (
    <div className="space-y-6">
      {/* Header with Confidence */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Post-Incident Review
          </h2>
          <p className="text-sm text-slate-400">AI-generated comprehensive analysis</p>
        </div>
        {review.confidence_score && (
          <div className="w-48">
            <ConfidenceIndicator score={review.confidence_score} showLabel />
          </div>
        )}
      </div>
      
      {/* Executive Summary */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
            {review.executive_summary}
          </p>
        </CardContent>
      </Card>
      
      {/* Impact Assessment */}
      {review.impact_assessment && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              Impact Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Duration</p>
                <p className="text-lg font-semibold text-white">{review.impact_assessment.duration}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Severity</p>
                <p className="text-lg font-semibold text-white">{review.impact_assessment.severity_level}</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Systems</p>
                <p className="text-lg font-semibold text-white">{review.impact_assessment.systems_affected?.length || 0}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Business Impact</p>
              <p className="text-slate-300">{review.impact_assessment.business_impact}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Timeline */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader 
          className="cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={() => toggleSection('timeline')}
        >
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Timeline Summary
            </span>
            {expandedSections.timeline ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.timeline && (
          <CardContent>
            <p className="text-slate-300 whitespace-pre-line">{review.timeline_summary}</p>
          </CardContent>
        )}
      </Card>
      
      {/* Root Cause Analysis */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader 
          className="cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={() => toggleSection('rootCause')}
        >
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-400" />
              Root Cause Analysis
            </span>
            {expandedSections.rootCause ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.rootCause && (
          <CardContent>
            <p className="text-slate-300 whitespace-pre-line leading-relaxed">
              {review.root_cause_analysis}
            </p>
          </CardContent>
        )}
      </Card>
      
      {/* Decision Effectiveness */}
      {review.decision_effectiveness && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              AI Decision Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-2xl font-bold text-blue-400">{review.decision_effectiveness.ai_recommendations_count}</p>
                <p className="text-xs text-slate-400 mt-1">AI Recommendations</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-2xl font-bold text-emerald-400">{review.decision_effectiveness.approved_count}</p>
                <p className="text-xs text-slate-400 mt-1">Approved</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-2xl font-bold text-amber-400">{review.decision_effectiveness.modified_count}</p>
                <p className="text-xs text-slate-400 mt-1">Modified</p>
              </div>
              <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <p className="text-2xl font-bold text-rose-400">{review.decision_effectiveness.rejected_count}</p>
                <p className="text-xs text-slate-400 mt-1">Rejected</p>
              </div>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Effectiveness Score</span>
                <span className="text-lg font-bold text-emerald-400">
                  {Math.round(review.decision_effectiveness.effectiveness_score * 100)}%
                </span>
              </div>
              <p className="text-sm text-slate-400">{review.decision_effectiveness.analysis}</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Key Learnings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader 
          className="cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={() => toggleSection('learnings')}
        >
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              Key Learnings
            </span>
            {expandedSections.learnings ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.learnings && (
          <CardContent>
            <div className="space-y-3">
              {review.key_learnings?.map((learning, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge className={categoryColors[learning.category] || "bg-slate-100 text-slate-700"}>
                      {learning.category}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", priorityColors[learning.priority?.toLowerCase()])}>
                      {learning.priority}
                    </Badge>
                  </div>
                  <p className="text-slate-300">{learning.learning}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Improvement Areas */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader 
          className="cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={() => toggleSection('improvements')}
        >
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-400" />
              Improvement Areas
            </span>
            {expandedSections.improvements ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.improvements && (
          <CardContent>
            <div className="space-y-4">
              {review.improvement_areas?.map((area, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-white">{area.area}</h4>
                    <Badge className={priorityColors[area.priority?.toLowerCase()]}>
                      {area.priority}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-slate-400">Current State:</p>
                      <p className="text-slate-300">{area.current_state}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Recommendation:</p>
                      <p className="text-slate-300">{area.recommended_improvement}</p>
                    </div>
                    {area.estimated_effort && (
                      <p className="text-xs text-slate-500">Estimated Effort: {area.estimated_effort}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Follow-up Actions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader 
          className="cursor-pointer hover:bg-slate-800/50 transition-colors"
          onClick={() => toggleSection('actions')}
        >
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Follow-up Actions
            </span>
            {expandedSections.actions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CardTitle>
        </CardHeader>
        {expandedSections.actions && (
          <CardContent>
            <div className="space-y-3">
              {review.follow_up_actions?.map((action, i) => (
                <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-white mb-2">{action.action}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {action.owner && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <User className="h-3 w-3" />
                            {action.owner}
                          </span>
                        )}
                        {action.deadline && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {action.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={priorityColors[action.priority?.toLowerCase()]}>
                      {action.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Prevention Recommendations */}
      {review.prevention_recommendations?.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              Prevention Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {review.prevention_recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-300">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}