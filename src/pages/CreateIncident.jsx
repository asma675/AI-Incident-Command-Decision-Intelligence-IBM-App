// src/pages/CreateIncident.jsx
import React, { useState } from "react";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function CreateIncident() {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("P2");
  const [description, setDescription] = useState("");
  const [logs, setLogs] = useState("");
  const [status, setStatus] = useState("active");
  const [aiResult, setAiResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function create() {
    setErr("");
    setSaving(true);
    try {
      const incident = await api.entities.Incident.create({
        title,
        severity,
        description: description || null,
        logs: logs || null,
        status,
      });

      // Audit log (optional)
      await api.entities.AuditLog.create({
        incident_id: incident.id,
        action_type: "CREATE_INCIDENT",
        actor: "user@demo.local",
        details: { title, severity },
      });

      setTitle("");
      setDescription("");
      setLogs("");
      setAiResult(null);
      return incident;
    } catch (e) {
      setErr(e.message || String(e));
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function runAI() {
    setErr("");
    try {
      const system =
        "You are an incident commander copilot. Analyze the incident and return concise guidance as plain text with: Summary, Suspected Cause, Immediate Actions, Comms Guidance, Owners.";

      const prompt = JSON.stringify({ title, severity, status, description, logs }, null, 2);
      const out = await api.ai.invokeLLM({ prompt, system });
      setAiResult(out?.text || "");
    } catch (e) {
      setErr(e.message || String(e));
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Incident</h1>
        <p className="text-muted-foreground">Create and analyze incidents for command decisions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Title</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., DCPP apps failing to load" />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="text-sm font-medium mr-2">Severity</div>
            {["P1", "P2", "P3"].map((p) => (
              <Button key={p} variant={severity === p ? "default" : "outline"} onClick={() => setSeverity(p)} type="button">
                {p}
              </Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline">{status}</Badge>
              <Button variant={status === "active" ? "default" : "outline"} onClick={() => setStatus("active")} type="button">
                active
              </Button>
              <Button variant={status === "resolved" ? "default" : "outline"} onClick={() => setStatus("resolved")} type="button">
                resolved
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Description</div>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What’s happening? Impact? Scope?" />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Logs / Signals</div>
            <Textarea value={logs} onChange={(e) => setLogs(e.target.value)} placeholder="Paste key alerts, traces, symptoms..." />
          </div>

          <div className="flex gap-2">
            <Button onClick={create} disabled={saving || !title}>
              {saving ? "Saving..." : "Create Incident"}
            </Button>
            <Button variant="secondary" onClick={runAI} disabled={!title}>
              Analyze with AI
            </Button>
          </div>

          {err ? <p className="text-sm text-destructive">{err}</p> : null}

          {aiResult ? (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>AI Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
