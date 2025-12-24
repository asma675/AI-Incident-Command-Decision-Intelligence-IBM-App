// src/pages/Layout.jsx
import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { api } from "@/api/client.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, BookOpen, Brain, Shield, TrendingUp } from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/create-incident", label: "Create Incident", icon: Brain },
  { to: "/predictions", label: "Predictions", icon: TrendingUp },
  { to: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { to: "/governance", label: "Governance", icon: Shield },
];

export default function Layout() {
  const loc = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.auth.me().then(setUser).catch(() => setUser({ email: "user@demo.local" }));
  }, []);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r p-4 hidden md:block">
        <div className="mb-4">
          <div className="font-bold text-lg">Incident Command</div>
          <div className="text-xs text-muted-foreground">Decision Intelligence Platform</div>
        </div>

        <div className="space-y-1">
          {nav.map((n) => {
            const active = loc.pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted",
                  active && "bg-muted font-medium"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <Badge variant="outline" className="truncate">
              {user?.email || "user@demo.local"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => api.auth.logout()} title="Logout (demo)">
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
