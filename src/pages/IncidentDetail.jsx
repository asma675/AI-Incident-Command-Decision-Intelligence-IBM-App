// src/pages/IncidentDetail.jsx
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function IncidentDetail() {
  const { id: incidentId } = useParams();
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data: incident, isLoading } = useQuery({
    queryKey: ["incident", incidentId],
    queryFn: async () => api.entities.Incident.get(incidentId),
    enabled: !!incidentId,
  });

  const { data: audits = [] } = useQuery({
    queryKey: ["audits", incidentId],
    queryFn: () => api.entities.AuditLog.filter({ incident_id: incidentId }, "-created_date", 200),
    enabled: !!incidentId,
  });

  const { data: decisions = [] } = useQuery({
    queryKey: ["decisionsByIncident", incidentId],
    queryFn: () => api.entities.Decision.filter({ incident_id: incidentId }, "-created_date", 50),
    enabled: !!incidentId,
  });

  const addAudit = useMutation({
    mutationFn: () =>
      api.entities.AuditLog.create({
        incident_id: incidentId,
        action_type: "NOTE",
        actor: "user@demo.local",
        details: { note },
      }),
    onSuccess: () => {
      setNote("");
      qc.invalidateQueries({ queryKey: ["audits", incidentId] });
    },
  });

  const severityBadge = useMemo(() => {
    if (!incident?.severity) return "secondary";
    if (incident.severity === "P1") return "destructive";
    if (incident.severity === "P2") return "secondary";
    return "outline";
  }, [incident?.severity]);

  return (
    <div className="p-6 space-y-6">
      {isLoading ? (
        <p>Loading...</p>
      ) : !incident ? (
        <p className="text-muted-foreground">Incident not found.</p>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{incident.title}</h1>
              <p className="text-muted-foreground">{incident.description || "No description provided."}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={severityBadge}>{incident.severity}</Badge>
              <Badge variant="outline">{incident.status}</Badge>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Logs / Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">{incident.logs || "—"}</pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {decisions.length === 0 ? (
                <p className="text-muted-foreground">No decisions recorded.</p>
              ) : (
                decisions.map((d) => (
                  <div key={d.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{d.decision}</div>
                      <Badge variant="outline">{d.decided_by || "—"}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{d.decision_reason || "—"}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit / Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
                <Button onClick={() => addAudit.mutate()} disabled={addAudit.isPending || !note}>
                  {addAudit.isPending ? "Saving..." : "Add Note"}
                </Button>
              </div>

              <div className="space-y-2">
                {audits.length === 0 ? (
                  <p className="text-muted-foreground">No audit logs.</p>
                ) : (
                  audits.slice(0, 30).map((a) => (
                    <div key={a.id} className="border rounded-lg p-3">
                      <div className="text-sm font-medium">{a.action_type}</div>
                      <div className="text-xs text-muted-foreground">{a.actor || "—"}</div>
                      <pre className="whitespace-pre-wrap text-sm mt-2">{JSON.stringify(a.details || {}, null, 2)}</pre>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
