import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { UserRole } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const role = (session.user as Record<string, unknown>).role as UserRole;
  const userName = session.user.name || "User";

  return <AppShell role={role} userName={userName}>{children}</AppShell>;
}
