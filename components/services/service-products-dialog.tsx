"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetServiceProducts, useSetServiceProducts } from "@/app/api/hooks/services/useServiceProducts";
import { useGetProducts } from "@/app/api/hooks/products/useProducts";
import type { ServiceProductResponse } from "@/app/api/hooks/services/useServiceProducts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  serviceName: string;
  organizationId: string;
};

type Row = { productId: string; quantity: string };

export function ServiceProductsDialog({ open, onOpenChange, serviceId, serviceName, organizationId }: Props) {
  const { data: existing, isLoading } = useGetServiceProducts(open ? serviceId : null);
  const { data: allProducts } = useGetProducts(organizationId);
  const { mutateAsync: setProducts, isPending } = useSetServiceProducts();

  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (open && existing) {
      setRows(existing.map((p: ServiceProductResponse) => ({
        productId: p.productId,
        quantity: p.quantity.toString(),
      })));
    }
  }, [open, existing]);

  function addRow() {
    setRows(prev => [...prev, { productId: "", quantity: "1" }]);
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: "productId" | "quantity", value: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  async function handleSave() {
    const valid = rows.filter(r => r.productId && parseFloat(r.quantity) > 0);
    try {
      await setProducts({
        serviceId,
        products: valid.map(r => ({ productId: r.productId, quantity: parseFloat(r.quantity) })),
      });
      toast.success("Materijali spremljeni");
      onOpenChange(false);
    } catch {
      toast.error("Greška pri spremanju materijala");
    }
  }

  const usedIds = new Set(rows.map(r => r.productId).filter(Boolean));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Materijali — {serviceName}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-2">
          Odaberite potrošne materijale koji se koriste za ovu uslugu. Zaliha se automatski oduzima pri završetku termina.
        </p>

        {isLoading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Učitavanje...</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row, i) => {
              const availableProducts = (allProducts ?? []).filter(
                p => p.isActive && (!usedIds.has(p.id) || p.id === row.productId)
              );
              return (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1 grid gap-1">
                    {i === 0 && <Label className="text-xs">Proizvod</Label>}
                    <Select value={row.productId} onValueChange={v => updateRow(i, "productId", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Odaberi proizvod..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28 grid gap-1">
                    {i === 0 && <Label className="text-xs">Količina</Label>}
                    <Input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={row.quantity}
                      onChange={e => updateRow(i, "quantity", e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={i === 0 ? "mt-5" : ""}
                    onClick={() => removeRow(i)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              onClick={addRow}
              disabled={!allProducts || allProducts.filter(p => p.isActive).length === 0}
            >
              <Plus className="h-4 w-4" />
              Dodaj materijal
            </Button>

            {(!allProducts || allProducts.filter(p => p.isActive).length === 0) && (
              <p className="text-xs text-muted-foreground text-center">
                Nema aktivnih proizvoda. Dodajte ih u Materijali sekciju.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Odustani
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Sprema..." : "Spremi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
