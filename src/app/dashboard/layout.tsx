import DashboardNav from "@/components/layout/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy text-warm-white">
      <DashboardNav />
      <main className="ml-60 min-h-screen p-8">{children}</main>
    </div>
  );
}
