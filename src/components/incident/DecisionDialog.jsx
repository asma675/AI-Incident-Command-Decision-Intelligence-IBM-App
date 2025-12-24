import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, CheckCircle2, XCircle, Edit3 } from "lucide-react";

export default function DecisionDialog({ 
  open, 
  onOpenChange, 
  recommendation, 
  recommendationIndex,
  onSubmit,
  isSubmitting 
}) {
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [modifiedAction, setModifiedAction] = useState("");
  
  const handleSubmit = () => {
    onSubmit({
      recommendation_index: recommendationIndex,
      recommendation_action: recommendation?.action,
      decision,
      decision_reason: reason,
      modified_action: decision === "modified" ? modifiedAction : undefined
    });
  };
  
  const isValid = decision && reason.trim().length > 0 && 
    (decision !== "modified" || modifiedAction.trim().length > 0);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Human Decision Required
          </DialogTitle>
          <DialogDescription>
            Review the AI recommendation and provide your decision with justification.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">AI Recommendation</p>
            <p className="text-sm font-medium text-slate-800">{recommendation?.action}</p>
          </div>
          
          <div className="space-y-3">
            <Label>Your Decision</Label>
            <RadioGroup value={decision} onValueChange={setDecision} className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                <RadioGroupItem value="approved" />
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-medium text-slate-800">Approve</p>
                  <p className="text-xs text-slate-500">Proceed with this action as recommended</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-amber-300 hover:bg-amber-50/50 transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                <RadioGroupItem value="modified" />
                <Edit3 className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-800">Modify</p>
                  <p className="text-xs text-slate-500">Take a different action instead</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-rose-300 hover:bg-rose-50/50 transition-colors has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50">
                <RadioGroupItem value="rejected" />
                <XCircle className="h-5 w-5 text-rose-600" />
                <div>
                  <p className="font-medium text-slate-800">Reject</p>
                  <p className="text-xs text-slate-500">Do not take this action</p>
                </div>
              </label>
            </RadioGroup>
          </div>
          
          {decision === "modified" && (
            <div className="space-y-2">
              <Label htmlFor="modified-action">Modified Action</Label>
              <Textarea
                id="modified-action"
                placeholder="Describe the action you will take instead..."
                value={modifiedAction}
                onChange={(e) => setModifiedAction(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason">Justification *</Label>
            <Textarea
              id="reason"
              placeholder="Explain your reasoning for this decision..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-slate-400">
              This will be logged for audit and governance purposes.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Decision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}