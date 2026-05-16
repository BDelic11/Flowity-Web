import { useMutation } from "@tanstack/react-query";
import { api } from "@/utils/api";
import type { SubscriptionPlan } from "./useGetSubscription";

/** POST /api/stripe/checkout — returns the hosted Checkout URL to redirect to. */
export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const res = await api.post<{ url: string }>("/stripe/checkout", { plan });
      return res.data.url;
    },
  });
};

/**
 * POST /api/stripe/checkout/confirm — synchronously activates the local subscription
 * by retrieving the Checkout Session from Stripe. Avoids relying on the webhook for
 * the immediate post-redirect UX.
 */
export const useConfirmCheckoutSession = () => {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.post("/stripe/checkout/confirm", { sessionId });
    },
  });
};

/** POST /api/stripe/portal — returns the Customer Portal URL to redirect to. */
export const useCreatePortalSession = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ url: string }>("/stripe/portal");
      return res.data.url;
    },
  });
};
