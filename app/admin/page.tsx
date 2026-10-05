import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { adminAuthConfigured } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Administration — Feno",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminDashboard configured={adminAuthConfigured()} />;
}
