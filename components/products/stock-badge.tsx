import { cn } from "@/lib/utils";
import { getStockLevel, type Product } from "@/types/product";

type Props = Pick<Product, "stockQty" | "lowStockThreshold" | "unit">;

export function StockBadge({ stockQty, lowStockThreshold, unit }: Props) {
  const level = getStockLevel({ stockQty, lowStockThreshold });

  const classes = {
    green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    yellow: "bg-amber-100 text-amber-800 ring-amber-200",
    red: "bg-red-100 text-red-800 ring-red-200",
  }[level];

  const label = {
    green: "OK",
    yellow: "Niska",
    red: "Hitno",
  }[level];

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
          classes,
        )}
      >
        {label}
      </span>
      <span className="text-sm font-medium">
        {stockQty} {unit}
      </span>
    </div>
  );
}
