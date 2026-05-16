import React from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = ({ children, className }: PageLayoutProps) => {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10",
        className,
      )}
    >
      {children}
    </section>
  );
};

export default PageLayout;
