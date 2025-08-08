import { getSession } from "@/app/actions/auth";
import { AppSidebar } from "@/components/app-sidebar";
import CandidatosClient from "./CandidatosClient";

export default async function CandidatosPage() {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
    return null;
  }
  const user = {
    name: typeof session.username === "string" ? session.username : "Usuario",
    email: typeof session.email === "string" ? session.email : "",
    avatar: "/avatars/default.jpg",
  };
  return (
    <>
      <AppSidebar user={user} />
      <CandidatosClient />
    </>
  );
}
