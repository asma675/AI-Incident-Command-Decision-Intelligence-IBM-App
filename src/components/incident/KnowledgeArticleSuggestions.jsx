import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BookOpen, Sparkles, Loader2, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { cn } from "@/lib/utils";

export default function KnowledgeArticleSuggestions({ incidentId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data } = await base44.functions.invoke('suggestKnowledgeArticles', { incident_id: incidentId });
      setSuggestions(data.suggestions || []);
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadSuggestions();
  }, [incidentId]);
  
  if (isLoading && !hasLoaded) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (suggestions.length === 0 && hasLoaded) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            Related Knowledge Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BookOpen className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No related articles found</p>
            <p className="text-xs text-slate-500 mt-1">Consider creating one from this incident</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          AI-Suggested Knowledge Articles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => {
            const article = suggestion.article;
            const score = Math.round(suggestion.relevance_score * 100);
            
            return (
              <Link
                key={article.id}
                to={createPageUrl(`ArticleDetail?id=${article.id}`)}
                className="block"
              >
                <div className="border border-slate-700 rounded-lg p-4 hover:border-blue-600/50 hover:bg-slate-800/50 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-medium text-white text-sm line-clamp-1 flex-1">
                      {article.title}
                    </h4>
                    <div className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0",
                      score >= 80 ? "bg-emerald-900/30 text-emerald-400" :
                      score >= 60 ? "bg-blue-900/30 text-blue-400" :
                      "bg-slate-700 text-slate-300"
                    )}>
                      {score}% match
                    </div>
                  </div>
                  
                  {article.summary && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                      {article.summary}
                    </p>
                  )}
                  
                  <p className="text-xs text-slate-500 italic mb-2">
                    {suggestion.reason}
                  </p>
                  
                  {article.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSuggestions}
          disabled={isLoading}
          className="w-full mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3 mr-2" />
              Refresh Suggestions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}