// src/pages/SystemHealth.jsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SystemHealth() {
  const qc = useQueryClient();

  const { data: incidents = [], isLoading: loadingIncidents } = useQuery({
    queryKey: ["healthIncidents"],
    queryFn: () => api.entities.Incident.list("-created_date", 100),
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["healthAlerts"],
    queryFn: () => api.entities.PredictiveAlert.filter({ status: "active" }, "-created_date", 100),
  });

  const generate = useMutation({
    mutationFn: () => api.functions.invoke("generatePredictions", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["healthAlerts"] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Signals, incidents, and active alerts.</p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
          {generate.isPending ? "Generating..." : "Generate Alerts"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingIncidents ? (
              <p>Loading...</p>
            ) : incidents.length === 0 ? (
              <p className="text-muted-foreground">No incidents.</p>
            ) : (
              <div className="space-y-2">
                {incidents.slice(0, 10).map((i) => (
                  <div key={i.id} className="border rounded-lg p-3 flex items-start justify-between">
                    <div>
                      <div className="font-medium">{i.title}</div>
                      <div className="text-sm text-muted-foreground">{i.description || "—"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={i.severity === "P1" ? "destructive" : "secondary"}>{i.severity}</Badge>
                      <Badge variant="outline">{i.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAlerts ? (
              <p>Loading...</p>
            ) : alerts.length === 0 ? (
              <p className="text-muted-foreground">No active alerts.</p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 10).map((a) => (
                  <div key={a.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{a.predicted_issue || a.predictedIssue}</div>
                      <Badge variant="secondary">{Math.round((a.likelihood || 0) * 100)}%</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{a.description || "—"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
