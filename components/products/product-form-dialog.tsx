"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateProduct, useUpdateProduct } from "@/app/api/hooks/products/useProducts";
import { UNIT_OPTIONS, type Product } from "@/types/product";
import {
  createProductSchema,
  updateProductSchema,
} from "@/schemas/products";
import { parseApiError } from "@/lib/api-errors";
import { useLocale } from "@/contexts/locale-context";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  product?: Product | null;
};

type FieldErrors = Record<string, string>;

export function ProductFormDialog({ open, onOpenChange, organizationId, product }: Props) {
  const { t } = useLocale();
  const isEdit = !!product;
  const { mutateAsync: create, isPending: isCreating } = useCreateProduct();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateProduct();
  const isPending = isCreating || isUpdating;

  const [name, setName] = useState("");
  const [unit, setUnit] = useState<string>("kom");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setName(product?.name ?? "");
      setUnit(product?.unit ?? "kom");
      setPricePerUnit(product?.pricePerUnit?.toString() ?? "");
      setStockQty(product?.stockQty?.toString() ?? "0");
      setLowStockThreshold(product?.lowStockThreshold?.toString() ?? "5");
      setCategory(product?.category ?? "");
      setDescription(product?.description ?? "");
      setImageUrl(product?.imageUrl ?? "");
      setIsActive(product?.isActive ?? true);
      setErrors({});
    }
  }, [open, product]);

  const clearErr = (key: string) => setErrors((s) => ({ ...s, [key]: "" }));

  async function handleSubmit() {
    const candidate = {
      name,
      unit,
      pricePerUnit: pricePerUnit === "" ? NaN : Number(pricePerUnit),
      lowStockThreshold: lowStockThreshold === "" ? NaN : Number(lowStockThreshold),
      description: description || undefined,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      ...(isEdit
        ? { isActive }
        : { stockQty: stockQty === "" ? NaN : Number(stockQty) }),
    };
    const parsed = isEdit
      ? updateProductSchema.safeParse(candidate)
      : createProductSchema.safeParse(candidate);

    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as string | undefined;
        if (k && !errs[k]) errs[k] = i.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      if (isEdit && product) {
        const data = parsed.data as { name: string; unit: string; pricePerUnit: number; lowStockThreshold: number; description?: string; category?: string; imageUrl?: string; isActive: boolean };
        await update({
          id: product.id,
          name: data.name,
          unit: data.unit,
          pricePerUnit: data.pricePerUnit,
          lowStockThreshold: data.lowStockThreshold,
          description: data.description ?? null,
          category: data.category ?? null,
          imageUrl: data.imageUrl ?? null,
          isActive: data.isActive,
        });
        toast.success("Proizvod ažuriran");
      } else {
        const data = parsed.data as { name: string; unit: string; pricePerUnit: number; stockQty: number; lowStockThreshold: number; description?: string; category?: string; imageUrl?: string };
        await create({
          organizationId,
          name: data.name,
          unit: data.unit,
          pricePerUnit: data.pricePerUnit,
          stockQty: data.stockQty,
          lowStockThreshold: data.lowStockThreshold,
          description: data.description ?? null,
          category: data.category ?? null,
          imageUrl: data.imageUrl ?? null,
        });
        toast.success("Proizvod dodan");
      }
      onOpenChange(false);
    } catch (err) {
      const e = parseApiError(err, "Greška. Pokušajte ponovo.");
      setErrors((s) => ({ ...s, ...e.fieldErrors }));
      toast.error(e.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Uredi proizvod" : "Novi proizvod"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Naziv *</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => { setName(e.target.value); clearErr("name"); }}
              placeholder="npr. Boja za kosu — kestenjasta"
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{t(errors.name!)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="p-unit">Mjerna jedinica</Label>
              <Select value={unit} onValueChange={(v) => { setUnit(v); clearErr("unit"); }}>
                <SelectTrigger id="p-unit"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && <p className="text-xs text-destructive">{t(errors.unit!)}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-cat">Kategorija</Label>
              <Input
                id="p-cat"
                value={category}
                onChange={(e) => { setCategory(e.target.value); clearErr("category"); }}
                placeholder="Boje, šamponi..."
                aria-invalid={!!errors.category}
              />
              {errors.category && <p className="text-xs text-destructive">{t(errors.category!)}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="p-price">Cijena / jed. (€)</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                step="0.01"
                value={pricePerUnit}
                onChange={(e) => { setPricePerUnit(e.target.value); clearErr("pricePerUnit"); }}
                aria-invalid={!!errors.pricePerUnit}
              />
              {errors.pricePerUnit && <p className="text-xs text-destructive">{t(errors.pricePerUnit!)}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-stock">{isEdit ? "Stanje" : "Početno stanje"}</Label>
              <Input
                id="p-stock"
                type="number"
                min={0}
                step="0.001"
                value={stockQty}
                onChange={(e) => { setStockQty(e.target.value); clearErr("stockQty"); }}
                disabled={isEdit}
                aria-invalid={!!errors.stockQty}
              />
              {errors.stockQty && <p className="text-xs text-destructive">{t(errors.stockQty!)}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-thresh">Prag</Label>
              <Input
                id="p-thresh"
                type="number"
                min={0}
                step="0.001"
                value={lowStockThreshold}
                onChange={(e) => { setLowStockThreshold(e.target.value); clearErr("lowStockThreshold"); }}
                aria-invalid={!!errors.lowStockThreshold}
              />
              {errors.lowStockThreshold && <p className="text-xs text-destructive">{t(errors.lowStockThreshold!)}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-img">URL slike (opcionalno)</Label>
            <Input
              id="p-img"
              type="url"
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); clearErr("imageUrl"); }}
              placeholder="https://..."
              aria-invalid={!!errors.imageUrl}
            />
            {errors.imageUrl && <p className="text-xs text-destructive">{t(errors.imageUrl!)}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="p-desc">Opis (opcionalno)</Label>
            <Textarea
              id="p-desc"
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearErr("description"); }}
              rows={2}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-xs text-destructive">{t(errors.description!)}</p>}
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <input id="p-active" type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <Label htmlFor="p-active" className="cursor-pointer">Aktivan</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Odustani</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Sprema se..." : isEdit ? "Spremi" : "Dodaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
