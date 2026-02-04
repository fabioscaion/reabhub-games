import Link from "next/link";
import Image from "next/image";
import { GameConfig } from "@/types/game";
import { Play, Edit } from "lucide-react";

interface GameCardProps {
  game: GameConfig;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="group relative w-full aspect-[16/10] rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all hover:scale-105 hover:shadow-xl hover:z-10">
      <Link
        href={`/games/${game.type}/${game.id}`}
        className="block w-full h-full rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {game.coverImage ? (
            <Image
              src={game.coverImage}
              alt={game.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              <span className="text-4xl">🎮</span>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-sm leading-tight drop-shadow-md line-clamp-2 mb-1">
            {game.name}
          </h3>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white">
              <Play size={10} fill="currentColor" />
            </div>
            <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">
              Jogar
            </span>
          </div>
        </div>
      </Link>
      
      {/* Edit Button */}
      <Link
        href={`/admin/edit/${game.id}`}
        className="absolute top-2 right-2 z-20 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
        title="Editar Jogo"
      >
        <Edit size={14} />
      </Link>
    </div>
  );
}
