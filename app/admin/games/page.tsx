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
  const userId = session.user.id;
  
  // Buscar apenas os jogos criados pelo usuário logado
  const games = await getAllGames(organizationId, true, userId);

  return <AdminGamesClient initialGames={games} />;
}
