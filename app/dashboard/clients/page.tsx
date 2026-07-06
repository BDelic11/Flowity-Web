"use client";

import { useGetCustomers, Customer } from "@/app/api/hooks/customers/useGetCustomers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomerNotesModal } from "@/components/customers/CustomerNotesModal";
import { AddCustomerModal } from "@/components/customers/AddCustomerModal";
import { format } from "date-fns";
import { CheckCircle, XCircle, Search, Users, StickyNote, UserPlus } from "lucide-react";
import { useState, useMemo } from "react";

function GdprBadge({ consentAt }: { consentAt: string | null }) {
  if (consentAt) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <CheckCircle className="h-3.5 w-3.5" />
        {format(new Date(consentAt), "dd.MM.yyyy")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <XCircle className="h-3.5 w-3.5" />
      Nije dao pristanak
    </span>
  );
}

export default function ClientsPage() {
  const { data, isLoading } = useGetCustomers(1, 200);
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [notesModal, setNotesModal] = useState<{
    open: boolean;
    customerId: string;
    customerName: string;
  }>({ open: false, customerId: "", customerName: "" });

  const customers = useMemo<Customer[]>(() => {
    if (!data?.items) return [];
    const q = search.toLowerCase();
    if (!q) return data.items;
    return data.items.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.phoneE164.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [data, search]);

  const consentedCount = data?.items.filter((c) => c.gdprConsentAt).length ?? 0;

  function openNotes(c: Customer) {
    setNotesModal({ open: true, customerId: c.id, customerName: c.displayName });
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Klijenti</h1>
          <p className="text-sm text-muted-foreground">
            Klijenti iz WhatsApp kanala i ručno dodani. Prikazuje GDPR status i povijest rezervacija.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="shrink-0">
          <UserPlus className="h-4 w-4 mr-2" />
          Dodaj klijenta
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Ukupno klijenata</p>
          <p className="text-2xl font-bold">{data?.total ?? "—"}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">GDPR pristanak</p>
          <p className="text-2xl font-bold text-green-600">{consentedCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Bez pristanka</p>
          <p className="text-2xl font-bold text-amber-500">
            {(data?.total ?? 0) - consentedCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pretraži ime, telefon, e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Učitavanje...
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
          <Users className="h-8 w-8" />
          <p className="text-sm">
            {search ? "Nema rezultata za traženi pojam." : "Nema klijenata za prikaz."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Ime</th>
                <th className="text-left px-4 py-3 font-medium">Telefon</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 font-medium">GDPR</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Rezervacije</th>
                <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Registriran</th>
                <th className="text-right px-4 py-3 font-medium">Bilješke</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={c.displayName === "Nepoznat" ? "text-muted-foreground italic" : ""}>
                        {c.displayName}
                      </span>
                      {c.isBlocked && (
                        <Badge variant="destructive" className="text-[10px] py-0">
                          Blokiran
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.phoneE164}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {c.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <GdprBadge consentAt={c.gdprConsentAt} />
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="font-medium">{c.bookingCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">
                    {format(new Date(c.createdAt), "dd.MM.yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      title="Bilješke"
                      onClick={() => openNotes(c)}
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Sukladno GDPR-u (Uredba EU 2016/679), osobni podaci klijenata obrađuju se isključivo za upravljanje
        rezervacijama. Klijenti mogu zatražiti uvid, ispravak ili brisanje svojih podataka u svakom trenutku.
      </p>

      {/* Add customer modal */}
      <AddCustomerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      {/* Notes modal */}
      <CustomerNotesModal
        open={notesModal.open}
        onClose={() => setNotesModal((s) => ({ ...s, open: false }))}
        customerId={notesModal.customerId}
        customerName={notesModal.customerName}
      />
    </div>
  );
}
