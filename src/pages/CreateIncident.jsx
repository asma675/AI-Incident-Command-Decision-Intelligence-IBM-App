import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CreateIncidentForm from "@/components/forms/CreateIncidentForm";

export default function CreateIncident() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    const incident = await base44.entities.Incident.create({
      ...formData,
      status: "analyzing"
    });
    
    // Create audit log
    await base44.entities.AuditLog.create({
      incident_id: incident.id,
      action_type: "incident_created",
      actor: (await base44.auth.me()).email,
      details: { severity: formData.severity, source: formData.source }
    });
    
    // Trigger AI analysis
    generateAIAnalysis(incident);
    
    navigate(createPageUrl(`IncidentDetail?id=${incident.id}`));
  };
  
  const generateAIAnalysis = async (incident) => {
    const prompt = `You are an expert Site Reliability Engineer analyzing an incident. 
    
Incident Details:
- Title: ${incident.title}
- Description: ${incident.description || "Not provided"}
- Severity: ${incident.severity}
- Source: ${incident.source || "Unknown"}
- Affected Systems: ${incident.affected_systems?.join(", ") || "Not specified"}
- Logs/Errors: ${incident.logs || "No logs provided"}

Provide a comprehensive analysis in JSON format with:
1. A concise executive summary (2-3 sentences)
2. Top 3 most likely root causes with probability scores (0-1) and supporting evidence
3. 3-5 recommended actions with priority (critical/high/medium/low), confidence scores (0-1), rationale, potential risks, and verification steps
4. Estimated time to recovery
5. Overall confidence score (0-1) based on data quality
6. Data quality notes (what information is missing or unclear)
7. Limitations of this analysis (what could be wrong)`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          root_causes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                cause: { type: "string" },
                probability: { type: "number" },
                evidence: { type: "array", items: { type: "string" } }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                action: { type: "string" },
                priority: { type: "string" },
                confidence: { type: "number" },
                rationale: { type: "string" },
                risks: { type: "string" },
                verification_steps: { type: "array", items: { type: "string" } }
              }
            }
          },
          estimated_recovery_time: { type: "string" },
          confidence_score: { type: "number" },
          data_quality_notes: { type: "string" },
          limitations: { type: "array", items: { type: "string" } }
        }
      }
    });
    
    await base44.entities.Incident.update(incident.id, {
      ai_analysis: analysis,
      status: "awaiting_approval"
    });
    
    await base44.entities.AuditLog.create({
      incident_id: incident.id,
      action_type: "ai_analysis_generated",
      actor: "SYSTEM",
      details: { confidence_score: analysis.confidence_score }
    });
    
    // Trigger AI automation
    await base44.functions.invoke('automateIncidentResponse', { incident_id: incident.id });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl("Dashboard")}>
          <Button variant="ghost" className="mb-6 -ml-2 text-slate-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Report New Incident</h1>
                <p className="text-sm text-slate-500">AI will analyze and provide recommendations</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <CreateIncidentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
}