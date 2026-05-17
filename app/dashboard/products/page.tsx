"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  PackagePlus,
  Search,
  Package,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/ui/page-layout";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, ProductsIllustration } from "@/components/ui/empty-state";
import { useDeleteConfirm } from "@/hooks/useDeleteConfirm";
import { useAuth } from "@/contexts/auth-context";
import {
  useGetProducts,
  useDeleteProduct,
} from "@/app/api/hooks/products/useProducts";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { PurchaseDialog } from "@/components/products/purchase-dialog";
import { StockBadge } from "@/components/products/stock-badge";
import { getStockLevel, type Product } from "@/types/product";
import { Roles } from "@/constants/roles";

export default function ProductsPage() {
  const { user, organizationId } = useAuth();
  const isAdmin =
    user?.role === Roles.ADMIN || user?.role === Roles.SUPER_ADMIN;

  const { data: products, isLoading } = useGetProducts(organizationId);
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [purchasing, setPurchasing] = useState<Product | null>(null);
  const { askDelete, ConfirmPortal } = useDeleteConfirm();

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const lowStockCount = useMemo(
    () => (products ?? []).filter((p) => getStockLevel(p) === "red").length,
    [products]
  );

  if (isLoading) return <Loading />;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }
  function openPurchase(p: Product) {
    setPurchasing(p);
    setPurchaseOpen(true);
  }
  async function handleDelete(p: Product) {
    if (!(await askDelete({ name: p.name }))) return;
    try {
      await deleteProduct(p.id);
      toast.success("Proizvod obrisan");
    } catch {
      toast.error("Brisanje nije uspjelo.");
    }
  }

  return (
    <PageLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Materijali</h2>
          <p className="text-muted-foreground">
            Potrošni materijali — boje, šamponi, sredstva. Pratite stanje i
            nabavu.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Novi proizvod
          </Button>
        )}
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          <span className="text-red-800">
            <strong>{lowStockCount}</strong>{" "}
            {lowStockCount === 1 ? "proizvod ima" : "proizvoda imaju"} nisku
            zalihu — vrijeme za nabavu.
          </span>
        </div>
      )}

      {/* Search */}
      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži po nazivu ili kategoriji..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration={<ProductsIllustration />}
          title={products?.length === 0 ? "Nema proizvoda" : "Nema rezultata"}
          description={
            products?.length === 0
              ? "Dodajte prvi materijal da krenete pratiti zalihu."
              : "Pokušajte drugi pojam pretrage."
          }
          action={
            isAdmin && products?.length === 0 ? (
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> Dodaj proizvod
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Proizvod</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Kategorija
                </th>
                <th className="px-4 py-3 font-medium">Stanje</th>
                {isAdmin && (
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">
                    Cijena / jed.
                  </th>
                )}
                <th className="px-4 py-3 text-right font-medium">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id} className={!p.isActive ? "opacity-60" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        // <Image src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md object-cover" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.name}</p>
                        {p.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {p.category ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge
                      stockQty={p.stockQty}
                      lowStockThreshold={p.lowStockThreshold}
                      unit={p.unit}
                    />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 hidden lg:table-cell font-mono">
                      {p.pricePerUnit.toFixed(2)} €
                    </td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      {isAdmin && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openPurchase(p)}
                            title="Nabava"
                          >
                            <PackagePlus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(p)}
                            title="Uredi"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(p)}
                            title="Obriši"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {organizationId && (
        <>
          <ProductFormDialog
            open={formOpen}
            onOpenChange={setFormOpen}
            organizationId={organizationId}
            product={editing}
          />
          <PurchaseDialog
            open={purchaseOpen}
            onOpenChange={setPurchaseOpen}
            product={purchasing}
          />
        </>
      )}
      {ConfirmPortal}
    </PageLayout>
  );
}
