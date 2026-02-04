import { getAllGames } from "@/lib/game-service";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminGamesClient from "./AdminGamesClient";

export default async function AdminGamesPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/unauthorized");
  }

  const organizationId = session.user.organizationId;
  
  // Buscar todos os jogos da organização, incluindo rascunhos
  const games = await getAllGames(organizationId, true);

  return <AdminGamesClient initialGames={games} />;
}
