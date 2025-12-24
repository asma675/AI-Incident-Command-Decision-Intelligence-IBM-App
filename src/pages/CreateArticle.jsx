// src/pages/CreateArticle.jsx
import React, { useState } from "react";
import { api } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateArticle() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    setErr("");
    setSaving(true);
    try {
      await api.entities.KnowledgeBaseArticle.create({
        title,
        summary: summary || null,
        content,
        category,
        status: "published",
        author: "user@demo.local",
        tags: [],
        related_systems: [],
      });
      setTitle("");
      setSummary("");
      setContent("");
      setCategory("general");
    } catch (e) {
      setErr(e.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Knowledge Article</h1>
        <p className="text-muted-foreground">Publish operational learnings for faster incident resolution.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Title</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Resolving DCPP login failures" />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Summary</div>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short overview..." />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Content</div>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Steps, runbooks, lessons learned..." rows={10} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Category</div>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="general / networking / auth / database..." />
          </div>

          <Button onClick={save} disabled={saving || !title || !content}>
            {saving ? "Saving..." : "Publish Article"}
          </Button>

          {err ? <p className="text-sm text-destructive">{err}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
