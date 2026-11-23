import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { isAdminConfigured, isAuthenticated, writesEnabled } from "@/lib/auth";
import { getDailyStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const authenticated = await isAuthenticated();
  return (
    <AdminDashboard
      key={authenticated ? "authenticated" : "signed-out"}
      configured={isAdminConfigured()}
      authenticated={authenticated}
      writable={writesEnabled()}
      initialStats={authenticated ? await getDailyStats() : []}
    />
  );
}
