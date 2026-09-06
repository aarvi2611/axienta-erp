import React from "react";
import ClientPortalLayout from "@/components/portal/ClientPortalLayout";

export const metadata = {
  title: "Client Portal | Axenta Business Consulting",
  description: "Secure dedicated client portal for invoices, dues, work progress, daily SEO tracking, and support tickets.",
};

export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}

