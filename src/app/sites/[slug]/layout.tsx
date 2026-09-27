import { Fraunces, Inter } from "next/font/google";
import "@/components/tenant-site/tenant-site.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ts-display-font",
});

const bodyFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ts-body-font",
});

/**
 * Tenant shell: fonts + scoped design tokens only. The public chrome
 * (header/footer) lives in the public homepage, NOT here — admin routes
 * under this layout must render sidebar-only.
 */
export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`tenant-site ${displayFont.variable} ${bodyFont.variable} flex min-h-screen flex-col`}>
      <div className="flex-1">{children}</div>
    </div>
  );
}
