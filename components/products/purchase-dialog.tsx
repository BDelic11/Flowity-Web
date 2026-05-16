"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRecordPurchase } from "@/app/api/hooks/products/useProducts";
import type { Product } from "@/types/product";
import { recordPurchaseSchema } from "@/schemas/products";
import { parseApiError } from "@/lib/api-errors";
import { useLocale } from "@/contexts/locale-context";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

export function PurchaseDialog({ open, onOpenChange, product }: Props) {
  const { t } = useLocale();
  const { mutateAsync, isPending } = useRecordPurchase();
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setQuantity("");
      setUnitCost("");
      setNote("");
      setErrors({});
    }
  }, [open]);

  if (!product) return null;

  async function handleSubmit() {
    const candidate = {
      quantity: quantity === "" ? NaN : Number(quantity),
      unitCost: unitCost === "" ? undefined : Number(unitCost),
      note: note || undefined,
    };
    const parsed = recordPurchaseSchema.safeParse(candidate);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as string | undefined;
        if (k && !errs[k]) errs[k] = i.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      await mutateAsync({
        productId: product!.id,
        quantity: parsed.data.quantity,
        unitCost: parsed.data.unitCost ?? null,
        note: parsed.data.note ?? null,
      });
      toast.success(`+${parsed.data.quantity} ${product!.unit} dodano u zalihu`);
      onOpenChange(false);
    } catch (err) {
      const e = parseApiError(err, "Greška pri zapisivanju nabave.");
      setErrors((s) => ({ ...s, ...e.fieldErrors }));
      toast.error(e.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nabava — {product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trenutno stanje</span>
            <span className="font-medium">{product.stockQty} {product.unit}</span>
          </div>
        </div>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="qty">Dodano u zalihu * ({product.unit})</Label>
            <Input id="qty" type="number" min={0.001} step="0.001" value={quantity}
                   onChange={(e) => setQuantity(e.target.value)} autoFocus
                   aria-invalid={!!errors.quantity} />
            {errors.quantity && <p className="text-xs text-destructive">{t(errors.quantity!)}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cost">Cijena / jed. (€) — opcionalno</Label>
            <Input id="cost" type="number" min={0} step="0.01" value={unitCost}
                   onChange={(e) => setUnitCost(e.target.value)}
                   placeholder={`npr. ${product.pricePerUnit.toFixed(2)}`}
                   aria-invalid={!!errors.unitCost} />
            {errors.unitCost && <p className="text-xs text-destructive">{t(errors.unitCost!)}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Napomena (opcionalno)</Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                      placeholder="npr. Faktura br. 123 — dobavljač X"
                      aria-invalid={!!errors.note} />
            {errors.note && <p className="text-xs text-destructive">{t(errors.note!)}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Odustani</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Sprema se..." : "Zabilježi nabavu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
