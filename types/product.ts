export type Product = {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  unit: string;
  pricePerUnit: number;
  stockQty: number;
  lowStockThreshold: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
};

export type StockLevel = "green" | "yellow" | "red";

export function getStockLevel(p: Pick<Product, "stockQty" | "lowStockThreshold">): StockLevel {
  if (p.stockQty <= p.lowStockThreshold) return "red";
  if (p.stockQty <= p.lowStockThreshold * 2) return "yellow";
  return "green";
}

export const UNIT_OPTIONS = ["kom", "ml", "l", "g", "kg"] as const;
export type Unit = (typeof UNIT_OPTIONS)[number];
