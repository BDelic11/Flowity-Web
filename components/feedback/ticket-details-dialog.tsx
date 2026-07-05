"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetFeedbackReportById } from "@/app/api/hooks/feedback/useGetFeedbackReportById";
import { useUpdateFeedbackReportTriage } from "@/app/api/hooks/feedback/useUpdateFeedbackReportTriage";
import { FEEDBACK_STATUSES, FEEDBACK_PRIORITIES, type FeedbackStatus, type FeedbackPriority } from "@/types/feedback";
import { PriorityDot, STATUS_LABELS, TypeBadge } from "@/components/feedback/ticket-badges";
import { parseApiError } from "@/lib/api-errors";
import { Loader2 } from "lucide-react";

export function TicketDetailsDialog({
  ticketId,
  onOpenChange,
}: {
  ticketId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!ticketId;
  const { data: ticket, isLoading } = useGetFeedbackReportById(ticketId);
  const { mutateAsync, isPending } = useUpdateFeedbackReportTriage();

  const [status, setStatus] = useState<FeedbackStatus>("Active");
  const [priority, setPriority] = useState<FeedbackPriority>("Medium");

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
    }
  }, [ticket?.id]);

  async function handleSave() {
    if (!ticketId) return;
    try {
      await mutateAsync({ id: ticketId, status, priority });
      toast.success("Tiket ažuriran.");
    } catch (error) {
      toast.error(parseApiError(error, "Ažuriranje nije uspjelo.").message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        {/* DialogTitle must always be present (even while loading) — Radix requires it
            on every DialogContent for screen readers, regardless of loading state. */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            {ticket ? (
              <>
                <span className="min-w-0 truncate">{ticket.title}</span>
                <TypeBadge type={ticket.type} />
              </>
            ) : (
              "Učitavanje prijave..."
            )}
          </DialogTitle>
          {ticket && (
            <DialogDescription>
              {ticket.userName || ticket.userEmail || "Nepoznat korisnik"}
              {ticket.userEmail && ticket.userName ? ` · ${ticket.userEmail}` : ""}
              {" · "}
              {new Date(ticket.createdAt).toLocaleString()}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading || !ticket ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* min-w-0 is required here: DialogContent is a CSS grid container, and grid/flex
                items default to min-width:auto, so without this a long unbroken URL/UA string
                below forces this whole column to grow instead of letting `truncate` clip it. */}
            <div className="min-w-0 space-y-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="whitespace-pre-wrap text-sm break-words">{ticket.message}</p>
              </div>

              {ticket.pageUrl && (
                <p className="min-w-0 truncate text-xs text-muted-foreground">
                  Stranica:{" "}
                  <a
                    href={ticket.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {ticket.pageUrl}
                  </a>
                </p>
              )}
              {ticket.userAgent && (
                <p className="min-w-0 truncate text-xs text-muted-foreground">
                  Preglednik: {ticket.userAgent}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as FeedbackStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Prioritet</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as FeedbackPriority)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEEDBACK_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          <PriorityDot priority={p} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Zatvori
              </Button>
              <Button type="button" onClick={handleSave} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Spremi
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
