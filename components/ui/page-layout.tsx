import React from "react";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = ({ children, className }: PageLayoutProps) => {
  return (
    <section className={`${className} px-4 sm:px-6 md:px-12 py-12`}>
      {children}
    </section>
  );
};

export default PageLayout;
