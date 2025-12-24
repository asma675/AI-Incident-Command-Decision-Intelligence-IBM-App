// src/pages/Dashboard.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, BookOpen, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: () => api.entities.Incident.list("-created_date", 100),
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ["predictions"],
    queryFn: () => api.entities.PredictiveAlert.filter({ status: "active" }, "-likelihood", 5),
  });

  const criticalIncidents = incidents.filter((i) => i.severity === "P1").length;
  const activeIncidents = incidents.filter((i) => i.status === "active").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incident Command Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of incidents, predictions, and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalIncidents}</div>
            <p className="text-xs text-muted-foreground">P1 severity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents}</div>
            <p className="text-xs text-muted-foreground">Currently being managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Predictions</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.length}</div>
            <p className="text-xs text-muted-foreground">Active alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
            <BookOpen className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Articles available</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          {incidentsLoading ? (
            <p>Loading...</p>
          ) : incidents.length === 0 ? (
            <p className="text-muted-foreground">No incidents found.</p>
          ) : (
            <div className="space-y-3">
              {incidents.slice(0, 8).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{incident.title}</div>
                    <div className="text-sm text-muted-foreground">{incident.description || "No description"}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant={incident.severity === "P1" ? "destructive" : "secondary"}>{incident.severity}</Badge>
                    <Badge variant="outline">{incident.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
