import { notFound } from "next/navigation";
import { Suspense } from "react";
import InviteAcceptClient from "./accept-client";

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) return notFound();

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <InviteAcceptClient token={token} />
    </Suspense>
  );
}
