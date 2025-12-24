import { useState } from "react";
import { Brain, AlertTriangle, Lightbulb, Clock, ChevronDown, ChevronUp, Shield, AlertCircle } from "lucide-react";
import ConfidenceIndicator from "../dashboard/ConfidenceIndicator";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function RootCauseItem({ cause, index }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-medium text-slate-800 text-sm text-left">{cause.cause}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            cause.probability >= 0.7 ? "bg-rose-100 text-rose-700" :
            cause.probability >= 0.4 ? "bg-amber-100 text-amber-700" :
            "bg-slate-100 text-slate-600"
          )}>
            {Math.round(cause.probability * 100)}% likely
          </span>
          {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>
      
      {expanded && cause.evidence?.length > 0 && (
        <div className="px-4 py-3 bg-white border-t border-slate-100">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Supporting Evidence</p>
          <ul className="space-y-1.5">
            {cause.evidence.map((ev, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                {ev}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec, index, onApprove, onReject, isPending }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      rec.priority === "critical" ? "border-rose-200" :
      rec.priority === "high" ? "border-amber-200" :
      "border-slate-200"
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <span className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-semibold",
              rec.priority === "critical" ? "bg-rose-100 text-rose-700" :
              rec.priority === "high" ? "bg-amber-100 text-amber-700" :
              "bg-sky-100 text-sky-700"
            )}>
              {index + 1}
            </span>
            <div>
              <h4 className="font-semibold text-slate-900">{rec.action}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">Confidence:</span>
                <ConfidenceIndicator score={rec.confidence} showLabel={false} size="sm" />
              </div>
            </div>
          </div>
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-md capitalize",
            rec.priority === "critical" ? "bg-rose-50 text-rose-700" :
            rec.priority === "high" ? "bg-amber-50 text-amber-700" :
            "bg-sky-50 text-sky-700"
          )}>
            {rec.priority}
          </span>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
        >
          {expanded ? "Hide details" : "Why this recommendation?"}
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            {rec.rationale && (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Rationale</p>
                <p className="text-sm text-slate-600">{rec.rationale}</p>
              </div>
            )}
            {rec.risks && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-md">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Potential Risks</p>
                  <p className="text-xs text-amber-700">{rec.risks}</p>
                </div>
              </div>
            )}
            {rec.verification_steps?.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Verification Steps</p>
                <ul className="space-y-1">
                  {rec.verification_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isPending && (
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={() => onReject(index)}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => onApprove(index)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Approve Action
          </button>
        </div>
      )}
    </div>
  );
}

export default function AIAnalysisPanel({ analysis, onApprove, onReject, isPending }) {
  if (!analysis) return null;
  
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-indigo-600" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Overall Confidence</span>
            <ConfidenceIndicator score={analysis.confidence_score} />
          </div>
          
          <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
          
          {analysis.estimated_recovery_time && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">Estimated Recovery:</span>
              <span className="font-semibold text-slate-900">{analysis.estimated_recovery_time}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Root Causes */}
      {analysis.root_causes?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Probable Root Causes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.root_causes.map((cause, i) => (
              <RootCauseItem key={i} cause={cause} index={i} />
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-5 w-5 text-emerald-600" />
              Recommended Actions
              {isPending && (
                <span className="ml-auto text-xs font-normal text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Requires Approval
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <RecommendationCard 
                key={i} 
                rec={rec} 
                index={i} 
                onApprove={onApprove}
                onReject={onReject}
                isPending={isPending}
              />
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Limitations & Data Quality */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-slate-700">
            <Shield className="h-5 w-5 text-slate-500" />
            AI Transparency & Limitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.data_quality_notes && (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-slate-600">{analysis.data_quality_notes}</p>
            </div>
          )}
          {analysis.limitations?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Known Limitations</p>
              <ul className="space-y-1.5">
                {analysis.limitations.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}