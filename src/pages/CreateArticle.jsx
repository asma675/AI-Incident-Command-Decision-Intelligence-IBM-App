import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Save, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "general",
    tags: "",
    related_systems: "",
    status: "draft"
  });
  
  const createArticle = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.KnowledgeBaseArticle.create({
        ...data,
        author: user.email,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        related_systems: data.related_systems ? data.related_systems.split(',').map(s => s.trim()).filter(Boolean) : []
      });
    },
    onSuccess: (article) => {
      navigate(createPageUrl(`ArticleDetail?id=${article.id}`));
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createArticle.mutate(formData);
  };
  
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl("KnowledgeBase")}>
          <Button variant="ghost" className="mb-6 -ml-2 text-slate-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </Link>
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-semibold text-white">Create Knowledge Article</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-slate-200">Title *</Label>
              <Input
                id="title"
                placeholder="Article title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="summary" className="text-slate-200">Summary</Label>
              <Textarea
                id="summary"
                placeholder="Brief summary of the article (2-3 sentences)"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="mt-1.5 min-h-[80px]"
              />
            </div>
            
            <div>
              <Label htmlFor="content" className="text-slate-200">Content * (Markdown supported)</Label>
              <Textarea
                id="content"
                placeholder="Write your article content here. You can use markdown formatting..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                className="mt-1.5 min-h-[300px] font-mono text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-slate-200">Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                    <SelectItem value="runbook">Runbook</SelectItem>
                    <SelectItem value="postmortem">Postmortem</SelectItem>
                    <SelectItem value="best_practices">Best Practices</SelectItem>
                    <SelectItem value="architecture">Architecture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status" className="text-slate-200">Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags" className="text-slate-200">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., kubernetes, database, performance"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="systems" className="text-slate-200">Related Systems (comma-separated)</Label>
              <Input
                id="systems"
                placeholder="e.g., API Gateway, Payment Service"
                value={formData.related_systems}
                onChange={(e) => setFormData({ ...formData, related_systems: e.target.value })}
                className="mt-1.5"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={createArticle.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {createArticle.isPending ? "Creating..." : "Create Article"}
              </Button>
              <Link to={createPageUrl("KnowledgeBase")}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}