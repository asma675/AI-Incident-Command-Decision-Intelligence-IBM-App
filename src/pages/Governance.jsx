// src/pages/Governance.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Governance() {
  const queryClient = useQueryClient();
  const [selectedIncidentId, setSelectedIncidentId] = useState("");
  const [decision, setDecision] = useState("approve");
  const [reason, setReason] = useState("");

  const { data: decisions = [], isLoading: loadingDecisions } = useQuery({
    queryKey: ["decisions"],
    queryFn: () => api.entities.Decision.list("-created_date", 100),
  });

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => api.entities.Incident.list("-created_date", 100),
  });

  const createDecision = useMutation({
    mutationFn: async () => {
      if (!selectedIncidentId) throw new Error("Select an incident first.");

      return api.entities.Decision.create({
        incident_id: selectedIncidentId,
        recommendation_action: "Manual decision logged",
        decision,
        decision_reason: reason || null,
        decided_by: "user@demo.local",
        decided_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Governance</h1>
        <p className="text-muted-foreground">Track decision approvals and accountability.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log a Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Incident</div>
              <Select value={selectedIncidentId} onValueChange={setSelectedIncidentId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingIncidents ? "Loading..." : "Select incident"} />
                </SelectTrigger>
                <SelectContent>
                  {incidents.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.title} ({i.severity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Decision</div>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">approve</SelectItem>
                  <SelectItem value="reject">reject</SelectItem>
                  <SelectItem value="defer">defer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Reason</div>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Add rationale for the decision..." />
          </div>

          <Button onClick={() => createDecision.mutate()} disabled={createDecision.isPending}>
            {createDecision.isPending ? "Saving..." : "Save Decision"}
          </Button>

          {createDecision.isError && (
            <p className="text-sm text-destructive">Error: {String(createDecision.error?.message || createDecision.error)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDecisions ? (
            <p>Loading...</p>
          ) : decisions.length === 0 ? (
            <p className="text-muted-foreground">No decisions yet.</p>
          ) : (
            <div className="space-y-3">
              {decisions.slice(0, 20).map((d) => (
                <div key={d.id} className="border rounded-lg p-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{d.recommendation_action || "Decision"}</div>
                    <div className="text-sm text-muted-foreground">{d.decision_reason || "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Incident: {d.incident_id || "—"} • By: {d.decided_by || "—"}
                    </div>
                  </div>
                  <Badge variant={d.decision === "approve" ? "secondary" : d.decision === "reject" ? "destructive" : "outline"}>
                    {d.decision}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
