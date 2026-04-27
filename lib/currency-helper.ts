function formatCurrencyEUR(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(n ?? 0);
}

export default formatCurrencyEUR;
