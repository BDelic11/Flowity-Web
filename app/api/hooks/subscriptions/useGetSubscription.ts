import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

export type SubscriptionPlan = "Basic" | "Pro" | "Business";

export type Subscription = {
  id: string;
  plan: SubscriptionPlan | null;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  trialEndsAt: string | null;
  // limits
  maxOrganizations: number;
  maxStaff: number;
  maxBookingsPerMonth: number;
  maxClients: number;
  // current usage
  usedOrganizations: number;
  usedStaff: number;
  usedBookingsThisMonth: number;
  usedClients: number;
  // stripe
  hasStripeCustomer: boolean;
  hasStripeSubscription: boolean;
  stripeStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

export const PLAN_META: Record<SubscriptionPlan, { label: string; price: number; color: string }> = {
  Basic:    { label: "Basic",    price: 15, color: "blue" },
  Pro:      { label: "Pro",      price: 35, color: "violet" },
  Business: { label: "Business", price: 69, color: "amber" },
};

export const useGetSubscription = () => {
  return useQuery<Subscription>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await api.get("/subscriptions/me");
      return res.data;
    },
    staleTime: 60_000,
  });
};

export const useChoosePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      await api.post("/subscriptions/me/plan", { plan });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};
