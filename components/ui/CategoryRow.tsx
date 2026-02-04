"use client";

import { GameConfig } from "@/types/game";
import GameCard from "./GameCard";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface CategoryRowProps {
  title: string;
  games: GameConfig[];
}

export default function CategoryRow({ title, games }: CategoryRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [games]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
        {/* Left Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full border border-zinc-700 shadow-xl transition-all hover:scale-110 active:scale-95 -ml-4 hidden md:flex items-center justify-center"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-zinc-900/80 hover:bg-zinc-800 text-white rounded-full border border-zinc-700 shadow-xl transition-all hover:scale-110 active:scale-95 -mr-4 hidden md:flex items-center justify-center"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto py-4 scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 -my-4"
        >
          {games.map((game) => (
            <div key={game.id} className="snap-start shrink-0 w-64 md:w-72">
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
