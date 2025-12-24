// src/pages/KnowledgeBase.jsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function KnowledgeBase() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["kbArticles"],
    queryFn: () => api.entities.KnowledgeBaseArticle.list("-created_date", 100),
  });

  const publish = useMutation({
    mutationFn: ({ id }) => api.entities.KnowledgeBaseArticle.update(id, { status: "published" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["kbArticles"] }),
  });

  const filtered = articles.filter((a) => {
    const s = search.toLowerCase();
    return (
      !s ||
      (a.title || "").toLowerCase().includes(s) ||
      (a.summary || "").toLowerCase().includes(s) ||
      (a.category || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Articles and runbooks for faster restoration.</p>
        </div>
        <div className="w-full md:w-80">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No articles found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.slice(0, 30).map((a) => (
                <div key={a.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.summary || "—"}</div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{a.category || "general"}</Badge>
                        <Badge variant={a.status === "published" ? "secondary" : "outline"}>{a.status}</Badge>
                      </div>
                    </div>

                    {a.status !== "published" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => publish.mutate({ id: a.id })}
                        disabled={publish.isPending}
                      >
                        Publish
                      </Button>
                    ) : null}
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
