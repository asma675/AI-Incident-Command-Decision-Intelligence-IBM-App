import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, Plus, Search, Filter, Eye, ThumbsUp, 
  FileText, BookMarked, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("published");
  const queryClient = useQueryClient();
  
  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["knowledgeArticles"],
    queryFn: () => base44.entities.KnowledgeBaseArticle.list("-created_date", 100)
  });
  
  const incrementViews = useMutation({
    mutationFn: (articleId) => {
      const article = articles.find(a => a.id === articleId);
      return base44.entities.KnowledgeBaseArticle.update(articleId, {
        views: (article?.views || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["knowledgeArticles"] })
  });
  
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const categoryIcons = {
    troubleshooting: AlertCircle,
    runbook: BookMarked,
    postmortem: FileText,
    best_practices: ThumbsUp,
    architecture: BookOpen,
    general: FileText
  };
  
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-3">
              <BookOpen className="h-7 w-7 text-blue-500" />
              Knowledge Base
            </h1>
            <p className="text-slate-400 mt-1">
              Searchable incident documentation and troubleshooting guides
            </p>
          </div>
          <Link to={createPageUrl("CreateArticle")}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-slate-400">Total Articles</span>
            </div>
            <p className="text-2xl font-semibold text-white">{articles.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-400">Published</span>
            </div>
            <p className="text-2xl font-semibold text-white">
              {articles.filter(a => a.status === "published").length}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-slate-400">Total Views</span>
            </div>
            <p className="text-2xl font-semibold text-white">
              {articles.reduce((sum, a) => sum + (a.views || 0), 0)}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="h-4 w-4 text-rose-400" />
              <span className="text-xs text-slate-400">Helpful Votes</span>
            </div>
            <p className="text-2xl font-semibold text-white">
              {articles.reduce((sum, a) => sum + (a.helpful_count || 0), 0)}
            </p>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search articles, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                  <SelectItem value="runbook">Runbook</SelectItem>
                  <SelectItem value="postmortem">Postmortem</SelectItem>
                  <SelectItem value="best_practices">Best Practices</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Articles Grid */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-slate-900 border border-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No articles found</h3>
            <p className="text-slate-500">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first knowledge base article"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredArticles.map(article => {
              const CategoryIcon = categoryIcons[article.category] || FileText;
              
              return (
                <Link
                  key={article.id}
                  to={createPageUrl(`ArticleDetail?id=${article.id}`)}
                  onClick={() => incrementViews.mutate(article.id)}
                  className="block"
                >
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:shadow-xl hover:shadow-blue-600/10 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <CategoryIcon className="h-6 w-6 text-blue-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-white line-clamp-1">
                            {article.title}
                          </h3>
                          <Badge variant={article.status === "published" ? "default" : "secondary"}>
                            {article.status}
                          </Badge>
                        </div>
                        
                        {article.summary && (
                          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                            {article.summary}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {article.helpful_count || 0} helpful
                          </span>
                          <span>{format(new Date(article.created_date), "MMM d, yyyy")}</span>
                          {article.author && <span>by {article.author}</span>}
                        </div>
                        
                        {article.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {article.tags.slice(0, 5).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {article.tags.length > 5 && (
                              <span className="px-2 py-0.5 text-slate-500 text-xs">
                                +{article.tags.length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}