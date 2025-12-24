import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, Eye, ThumbsUp, Edit, Save, X, Trash2,
  BookOpen, Calendar, User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ArticleDetail() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);
  
  const { data: article, isLoading } = useQuery({
    queryKey: ["article", articleId],
    queryFn: () => base44.entities.KnowledgeBaseArticle.filter({ id: articleId }).then(r => r[0]),
    enabled: !!articleId
  });
  
  useEffect(() => {
    if (article) {
      setEditData({
        title: article.title,
        summary: article.summary || "",
        content: article.content,
        category: article.category,
        tags: article.tags?.join(', ') || "",
        related_systems: article.related_systems?.join(', ') || "",
        status: article.status
      });
    }
  }, [article]);
  
  const updateArticle = useMutation({
    mutationFn: (data) => base44.entities.KnowledgeBaseArticle.update(articleId, {
      ...data,
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      related_systems: data.related_systems ? data.related_systems.split(',').map(s => s.trim()).filter(Boolean) : []
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article", articleId] });
      setIsEditing(false);
    }
  });
  
  const markHelpful = useMutation({
    mutationFn: () => base44.entities.KnowledgeBaseArticle.update(articleId, {
      helpful_count: (article?.helpful_count || 0) + 1
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["article", articleId] })
  });
  
  const deleteArticle = useMutation({
    mutationFn: () => base44.entities.KnowledgeBaseArticle.delete(articleId),
    onSuccess: () => {
      window.location.href = createPageUrl("KnowledgeBase");
    }
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading article...</div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Article not found</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={createPageUrl("KnowledgeBase")}>
          <Button variant="ghost" className="mb-6 -ml-2 text-slate-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </Link>
        
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
          {!isEditing ? (
            <>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant={article.status === "published" ? "default" : "secondary"}>
                      {article.status}
                    </Badge>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                  <h1 className="text-3xl font-semibold text-white mb-4">{article.title}</h1>
                  {article.summary && (
                    <p className="text-slate-400 text-lg">{article.summary}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-rose-400 hover:text-rose-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Article?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the article.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteArticle.mutate()}
                          className="bg-rose-600 hover:bg-rose-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6 pb-6 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <UserIcon className="h-4 w-4" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.created_date), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" />
                  {article.views || 0} views
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markHelpful.mutate()}
                  disabled={markHelpful.isPending}
                  className="text-slate-400 hover:text-blue-400"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {article.helpful_count || 0} helpful
                </Button>
              </div>
              
              {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {article.related_systems?.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Related Systems</p>
                  <div className="flex flex-wrap gap-2">
                    {article.related_systems.map((sys, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-sm rounded border border-blue-700/50">
                        {sys}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); updateArticle.mutate(editData); }} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-slate-200">Title</Label>
                <Input
                  id="title"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="summary" className="text-slate-200">Summary</Label>
                <Textarea
                  id="summary"
                  value={editData.summary}
                  onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                  className="mt-1.5 min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="content" className="text-slate-200">Content</Label>
                <Textarea
                  id="content"
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  className="mt-1.5 min-h-[300px] font-mono text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-slate-200">Category</Label>
                  <Select value={editData.category} onValueChange={(val) => setEditData({ ...editData, category: val })}>
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
                  <Select value={editData.status} onValueChange={(val) => setEditData({ ...editData, status: val })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tags" className="text-slate-200">Tags</Label>
                <Input
                  id="tags"
                  value={editData.tags}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="systems" className="text-slate-200">Related Systems</Label>
                <Input
                  id="systems"
                  value={editData.related_systems}
                  onChange={(e) => setEditData({ ...editData, related_systems: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" disabled={updateArticle.isPending} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  {updateArticle.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}