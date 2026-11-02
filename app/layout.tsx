import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { containerStyles } from "@/components/ui/styles";
import { TRPCReactProvider } from "@/lib/providers/TRPCReactProvider";
import { cx } from "@/utils/cx";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "A small task manager built with Next.js 16 and tRPC",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <Header />
          <main className={cx(containerStyles, "py-8")}>{children}</main>
          <Toaster richColors closeButton theme="system" position="top-right" />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
