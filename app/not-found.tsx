"use client";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-muted grid place-items-center">
          <span className="text-2xl">🧭</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn’t find what you were looking for. It might have been moved
          or deleted.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href="#" onClick={() => history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Link>
          </Button>

          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
