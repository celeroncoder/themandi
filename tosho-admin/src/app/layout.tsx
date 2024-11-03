import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Tosho Admin",
  description: "Admin | Tosho: the bookstore",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className="overflow-auto scroll-smooth">
          <TRPCReactProvider>
            <SidebarProvider>
              <AppSidebar />
              <main>
                <SidebarTrigger />
                {children}
              </main>
              <Toaster />
            </SidebarProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
