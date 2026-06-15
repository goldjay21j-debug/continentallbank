import { redirect } from "next/navigation";

export const metadata = { title: "Admin Operations" };

export default function AdminRecoveryRedirectPage() {
  redirect("/admin#recovery-command");
}
