import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  redirect(role === "manager" ? "/manager" : "/rep");
}
