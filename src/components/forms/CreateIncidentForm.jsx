import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Server, AlertCircle } from "lucide-react";

export default function CreateIncidentForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "",
    source: "",
    affected_systems: [],
    logs: "",
    tags: []
  });
  const [systemInput, setSystemInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  
  const handleAddSystem = () => {
    if (systemInput.trim() && !formData.affected_systems.includes(systemInput.trim())) {
      setFormData(prev => ({
        ...prev,
        affected_systems: [...prev.affected_systems, systemInput.trim()]
      }));
      setSystemInput("");
    }
  };
  
  const handleRemoveSystem = (system) => {
    setFormData(prev => ({
      ...prev,
      affected_systems: prev.affected_systems.filter(s => s !== system)
    }));
  };
  
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const isValid = formData.title.trim() && formData.severity;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Incident Title *</Label>
        <Input
          id="title"
          placeholder="Brief description of the incident"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of what happened..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Severity *</Label>
          <Select 
            value={formData.severity} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Critical
                </span>
              </SelectItem>
              <SelectItem value="high">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  High
                </span>
              </SelectItem>
              <SelectItem value="medium">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Medium
                </span>
              </SelectItem>
              <SelectItem value="low">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Low
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="source">Alert Source</Label>
          <Input
            id="source"
            placeholder="e.g., PagerDuty, Datadog"
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Affected Systems</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add system/service name"
            value={systemInput}
            onChange={(e) => setSystemInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSystem())}
          />
          <Button type="button" variant="outline" size="icon" onClick={handleAddSystem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.affected_systems.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.affected_systems.map((system) => (
              <Badge key={system} variant="secondary" className="flex items-center gap-1 pl-2">
                <Server className="h-3 w-3" />
                {system}
                <button
                  type="button"
                  onClick={() => handleRemoveSystem(system)}
                  className="ml-1 hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="logs">Log Data / Error Messages</Label>
        <Textarea
          id="logs"
          placeholder="Paste relevant logs, error messages, or alert details..."
          value={formData.logs}
          onChange={(e) => setFormData(prev => ({ ...prev, logs: e.target.value }))}
          className="min-h-[120px] font-mono text-sm"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" variant="outline" size="icon" onClick={handleAddTag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          AI analysis will be generated automatically after submission.
        </p>
      </div>
      
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Incident"}
        </Button>
      </div>
    </form>
  );
}