"use client";

import { useMemo, useState } from "react";
import { Search, Ticket as TicketIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useGetFeedbackReports } from "@/app/api/hooks/feedback/useGetFeedbackReports";
import {
  PriorityDot,
  StatusBadge,
  TypeBadge,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/components/feedback/ticket-badges";
import { TicketDetailsDialog } from "@/components/feedback/ticket-details-dialog";
import {
  FEEDBACK_STATUSES,
  FEEDBACK_PRIORITIES,
  type FeedbackStatus,
  type FeedbackPriority,
  type FeedbackType,
} from "@/types/feedback";

const ALL = "all" as const;

export default function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | typeof ALL>(ALL);
  const [priorityFilter, setPriorityFilter] = useState<FeedbackPriority | typeof ALL>(ALL);
  const [typeFilter, setTypeFilter] = useState<FeedbackType | typeof ALL>(ALL);
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const { data, isLoading } = useGetFeedbackReports({
    status: statusFilter === ALL ? undefined : statusFilter,
    priority: priorityFilter === ALL ? undefined : priorityFilter,
    type: typeFilter === ALL ? undefined : typeFilter,
  });

  const items = useMemo(() => {
    const all = data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.userEmail?.toLowerCase().includes(q) ?? false) ||
        (t.userName?.toLowerCase().includes(q) ?? false)
    );
  }, [data, search]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Prijave (Tickets)</h1>
        <p className="text-muted-foreground">
          Bug prijave i prijedlozi koje testeri šalju kroz aplikaciju.
        </p>
      </div>

      {/* Filters + search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži po naslovu, imenu, e-pošti..."
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FeedbackStatus | typeof ALL)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Svi statusi</SelectItem>
            {FEEDBACK_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as FeedbackPriority | typeof ALL)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Prioritet" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Svi prioriteti</SelectItem>
            {FEEDBACK_PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                <PriorityDot priority={p} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FeedbackType | typeof ALL)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Vrsta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Sve vrste</SelectItem>
            {(Object.keys(TYPE_LABELS) as FeedbackType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Učitavanje...
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          illustration={<TicketIcon className="h-16 w-16" />}
          title="Nema prijava"
          description={
            search || statusFilter !== ALL || priorityFilter !== ALL || typeFilter !== ALL
              ? "Nema rezultata za odabrane filtere."
              : "Nema poslanih bug prijava ili prijedloga."
          }
        />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Prioritet</TableHead>
                <TableHead>Naslov</TableHead>
                <TableHead>Vrsta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prijavio</TableHead>
                <TableHead>Poslano</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <TableCell>
                    <PriorityDot priority={ticket.priority} showLabel={false} />
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate font-medium">
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={ticket.type} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {ticket.userName || ticket.userEmail || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TicketDetailsDialog
        ticketId={selectedTicketId}
        onOpenChange={(open) => !open && setSelectedTicketId(null)}
      />
    </div>
  );
}
