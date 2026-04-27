import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { BackButton } from "./back-button";

export const metadata: Metadata = {
  title: "Forbidden",
};

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-muted">
          <Lock className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don’t have permission to view this page. If you believe this is a
          mistake, contact your administrator.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/* Back uses a client component to avoid onClick in server file */}
          <BackButton />

          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
