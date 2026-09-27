import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { PortalTypeSetter } from "@/components/layout/portal-type-setter";
import { Toaster } from "@/components/ui/sonner";
import { tenantSlugFromHost } from "@/lib/tenant-host";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Retreat Nest — Discover Your Perfect Retreat",
  description:
    "Browse and discover retreats, hotels, and resorts for your next getaway.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Tenant subdomains render their own branded chrome (see sites layout).
  // usePathname() returns the *visible* path, so rewritten tenant routes
  // can't be detected that way — host detection is authoritative here.
  // NOTE: reading headers() opts the root layout into dynamic rendering.
  const h = await headers();
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ?? h.get("host");
  const isTenant = tenantSlugFromHost(host) != null;
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {!isTenant && <Header />}
          <PortalTypeSetter />
          <main className="flex-1">{children}</main>
          {!isTenant && <Footer />}
          <ScrollToTop />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
