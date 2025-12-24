import { useState } from "react";
import { Sparkles, Users, Terminal, MessageSquare, ChevronDown, ChevronUp, Copy, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AutomationPanel({ automation }) {
  const [expandedScripts, setExpandedScripts] = useState({});
  const [expandedComms, setExpandedComms] = useState({});
  
  const toggleScript = (index) => {
    setExpandedScripts(prev => ({ ...prev, [index]: !prev[index] }));
  };
  
  const toggleComm = (key) => {
    setExpandedComms(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };
  
  const commSections = [
    { key: "executive_summary", label: "Executive Summary", icon: Users },
    { key: "technical_details", label: "Technical Details", icon: Terminal },
    { key: "customer_facing", label: "Customer Communication", icon: MessageSquare },
    { key: "internal_update", label: "Internal Update", icon: MessageSquare }
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-purple-900/30 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">AI Automation Results</h2>
          <p className="text-sm text-slate-400">
            Confidence: {Math.round((automation.automation_confidence || 0.85) * 100)}%
          </p>
        </div>
      </div>
      
      {/* Team Assignment */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            Auto-Assigned Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg text-white">{automation.assigned_team}</p>
              <p className="text-sm text-slate-400 mt-1">{automation.assignment_rationale}</p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
        </CardContent>
      </Card>
      
      {/* Diagnostic Scripts */}
      {automation.diagnostic_scripts?.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              Automated Diagnostics ({automation.diagnostic_scripts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {automation.diagnostic_scripts.map((script, index) => (
                <div key={index} className="border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleScript(index)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        script.status === "completed" ? "bg-emerald-900/30 text-emerald-400" :
                        script.status === "running" ? "bg-blue-900/30 text-blue-400" :
                        script.status === "failed" ? "bg-rose-900/30 text-rose-400" :
                        "bg-slate-700 text-slate-300"
                      )}>
                        {script.status || "pending"}
                      </span>
                      <div>
                        <p className="font-medium text-white text-sm">{script.script_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{script.description}</p>
                      </div>
                    </div>
                    {expandedScripts[index] ? 
                      <ChevronUp className="h-4 w-4 text-slate-400" /> : 
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    }
                  </button>
                  
                  {expandedScripts[index] && (
                    <div className="px-4 pb-4 border-t border-slate-700">
                      <div className="bg-slate-950 rounded p-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">Command:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(script.command, "Command")}
                            className="h-6 px-2"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <code className="text-xs text-emerald-400 font-mono">
                          {script.command}
                        </code>
                      </div>
                      {script.output && (
                        <div className="bg-slate-950 rounded p-3 mt-2">
                          <span className="text-xs text-slate-400 block mb-2">Output:</span>
                          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                            {script.output}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Communication Drafts */}
      {automation.stakeholder_communication && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-400" />
              Communication Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commSections.map(({ key, label, icon: Icon }) => {
                const content = automation.stakeholder_communication[key];
                if (!content) return null;
                
                return (
                  <div key={key} className="border border-slate-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleComm(key)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-amber-400" />
                        <span className="font-medium text-white text-sm">{label}</span>
                      </div>
                      {expandedComms[key] ? 
                        <ChevronUp className="h-4 w-4 text-slate-400" /> : 
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      }
                    </button>
                    
                    {expandedComms[key] && (
                      <div className="px-4 pb-4 border-t border-slate-700">
                        <div className="bg-slate-950 rounded p-4 mt-3">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <p className="text-sm text-slate-300 leading-relaxed flex-1">
                              {content}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(content, label)}
                              className="flex-shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}