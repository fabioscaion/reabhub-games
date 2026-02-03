import { GameConfig } from "@/types/game";
import GameCard from "./GameCard";
import { ChevronRight } from "lucide-react";

interface CategoryRowProps {
  title: string;
  games: GameConfig[];
}

export default function CategoryRow({ title, games }: CategoryRowProps) {
  if (games.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 group cursor-pointer">
        <h2 className="text-lg md:text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">
          {title}
        </h2>
        <div className="text-xs font-semibold text-cyan-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex items-center">
          Ver tudo <ChevronRight size={14} />
        </div>
      </div>
      
      <div className="relative group/slider">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 mask-gradient-right">
          {games.map((game) => (
            <div key={game.id} className="snap-start">
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
