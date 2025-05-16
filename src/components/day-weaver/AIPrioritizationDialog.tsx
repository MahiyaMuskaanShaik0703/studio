"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";

interface AIPrioritizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrioritize: (userProfile: string) => Promise<void>; // Make it async
  isPrioritizing: boolean;
}

export function AIPrioritizationDialog({ isOpen, onClose, onPrioritize, isPrioritizing }: AIPrioritizationDialogProps) {
  const [userProfile, setUserProfile] = useState("");

  const handleSubmit = async () => {
    await onPrioritize(userProfile);
    // Do not close dialog here, parent will handle it or it stays open to show result / allow re-prioritize
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card bg-opacity-70 dark:bg-opacity-50 backdrop-blur-xl shadow-2xl border border-white/10 dark:border-white/5">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Wand2 className="mr-2 h-5 w-5 text-primary" />
            Intelligent Task Prioritization
          </DialogTitle>
          <DialogDescription>
            Let Day Weaver AI help you optimize your task list. Provide some details about your current context, work style, or any constraints.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user-profile">Your Profile / Context</Label>
            <Textarea
              id="user-profile"
              placeholder="E.g., I work best in the mornings. I have a critical meeting at 2 PM. Today I need to focus on deep work tasks..."
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
              rows={5}
              className="bg-background/50 dark:bg-background/30 border-white/20 dark:border-neutral-700/40 focus:border-primary/50"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPrioritizing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isPrioritizing || !userProfile.trim()}>
            {isPrioritizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Prioritizing...
              </>
            ) : (
              "Prioritize Tasks"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
