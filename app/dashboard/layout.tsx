"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";
import { useAuth } from "@/contexts/auth-context";
import { useGetSubscription } from "@/app/api/hooks/subscriptions/useGetSubscription";
import Loading from "@/components/ui/loading";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { NotificationProvider } from "@/contexts/notification-context";
import {
  OnboardingDialog,
  shouldShowOnboarding,
  markOnboardingCompleted,
} from "@/components/onboarding/onboarding-dialog";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { FeedbackWidget } from "@/components/feedback/feedback-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Fetch subscription only once auth is confirmed (skip for non-admin roles)
  const isAdmin = user?.role === "Admin" || user?.role === "SuperAdmin";
  const { data: subscription, isLoading: subLoading } = useGetSubscription();

  useEffect(() => {
    if (isLoading || (isAdmin && subLoading)) return;
    if (!user) {
      router.replace(routes.login);
      return;
    }
    // Admin users must have an active subscription before they can use the dashboard
    if (isAdmin && (!subscription || !subscription.isActive)) {
      router.replace(routes.plans);
      return;
    }
    // Once subscribed, they must have an organization
    if (!user.organizationId) {
      router.replace(routes.selectOrganization);
    }
  }, [user, isLoading, subscription, subLoading, isAdmin, router]);

  if (isLoading || (isAdmin && subLoading)) return <Loading />;
  if (!user) return null;
  if (isAdmin && (!subscription || !subscription.isActive)) return null;
  if (!user.organizationId) return null;

  return (
    <NotificationProvider>
      <div className="flex h-dvh overflow-hidden">
        <DashboardSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-14 md:pt-0 md:pl-16">
          {!user.isEmailVerified && <EmailVerificationBanner email={user.email} />}
          <div className="hidden md:block">
            <DashboardHeader
              userName={user.name || "User"}
              tenantName={user.tenantName || "Salon"}
            />
          </div>
          <main className="flex-1 min-h-0 overflow-y-auto bg-muted/40">{children}</main>
        </div>
      </div>
      <OnboardingGate userId={user.id} />
      <FeedbackWidget />
    </NotificationProvider>
  );
}

function OnboardingGate({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shouldShowOnboarding(userId)) setOpen(true);
  }, [userId]);

  function handleClose() {
    markOnboardingCompleted(userId);
    setOpen(false);
  }

  return <OnboardingDialog open={open} onClose={handleClose} />;
}
