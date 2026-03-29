import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        userName={profile?.full_name || user.email || ""}
        cabinetName={profile?.cabinet_name || ""}
      />
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
