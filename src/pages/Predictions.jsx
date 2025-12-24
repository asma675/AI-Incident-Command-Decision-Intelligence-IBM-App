// src/pages/Predictions.jsx
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Predictions() {
  const qc = useQueryClient();

  const { data: active = [], isLoading: loadingActive } = useQuery({
    queryKey: ["predictionsActive"],
    queryFn: () => api.entities.PredictiveAlert.filter({ status: "active" }, "-created_date", 100),
  });

  const { data: all = [], isLoading: loadingAll } = useQuery({
    queryKey: ["predictionsAll"],
    queryFn: () => api.entities.PredictiveAlert.list("-created_date", 200),
  });

  const generate = useMutation({
    mutationFn: () => api.functions.invoke("generatePredictions", {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionsActive"] });
      qc.invalidateQueries({ queryKey: ["predictionsAll"] });
    },
  });

  const resolveAlert = useMutation({
    mutationFn: ({ id }) => api.entities.PredictiveAlert.update(id, { status: "resolved" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["predictionsActive"] });
      qc.invalidateQueries({ queryKey: ["predictionsAll"] });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Predictions</h1>
          <p className="text-muted-foreground">Proactive alerts and risk signals.</p>
        </div>
        <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
          {generate.isPending ? "Generating..." : "Generate Predictions"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActive ? (
            <p>Loading...</p>
          ) : active.length === 0 ? (
            <p className="text-muted-foreground">No active alerts.</p>
          ) : (
            <div className="space-y-3">
              {active.slice(0, 30).map((p) => (
                <div key={p.id} className="border rounded-lg p-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{p.predicted_issue || p.predictedIssue}</div>
                    <div className="text-sm text-muted-foreground">{p.description || "—"}</div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{p.severity}</Badge>
                      <Badge variant="secondary">Likelihood: {Math.round((p.likelihood || 0) * 100)}%</Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => resolveAlert.mutate({ id: p.id })}>
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAll ? (
            <p>Loading...</p>
          ) : all.length === 0 ? (
            <p className="text-muted-foreground">No alerts found.</p>
          ) : (
            <div className="space-y-2">
              {all.slice(0, 50).map((p) => (
                <div key={p.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.predicted_issue || p.predictedIssue}</div>
                    <Badge variant={p.status === "active" ? "secondary" : "outline"}>{p.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{p.description || "—"}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
