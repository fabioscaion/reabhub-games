"use client";

import { useState, useMemo, useEffect } from "react";
import { GameConfig } from "@/types/game";
import CategoryRow from "./CategoryRow";
import GameCard from "./GameCard";
import { Search, X, LayoutGrid, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HomeClientProps {
  initialGames: GameConfig[];
}

export default function HomeClient({ initialGames }: HomeClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get unique categories from all games
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    initialGames.forEach(game => {
      if (game.category) cats.add(game.category);
    });
    return Array.from(cats).sort();
  }, [initialGames]);

  const filteredGames = useMemo(() => {
    let games = initialGames;

    // Filter by category first if one is selected
    if (selectedCategory) {
      games = games.filter(game => game.category === selectedCategory);
    }

    // Then filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      games = games.filter(game => 
        game.name.toLowerCase().includes(term) ||
        game.description?.toLowerCase().includes(term) ||
        game.category?.toLowerCase().includes(term) ||
        game.type?.toLowerCase().includes(term)
      );
    }

    return games;
  }, [searchTerm, selectedCategory, initialGames]);

  // Group games by category for the categorized view
  const categorizedGames = useMemo(() => {
    const cats: Record<string, GameConfig[]> = {};
    filteredGames.forEach((game) => {
      const category = game.category || "Outros";
      if (!cats[category]) {
        cats[category] = [];
      }
      cats[category].push(game);
    });
    return cats;
  }, [filteredGames]);

  // Close sidebar on mobile when a category is selected
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Mobile Category Toggle */}
      <div className="md:hidden flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 text-zinc-300 font-medium"
        >
          <Menu size={20} />
          <span>Categorias</span>
        </button>
        {selectedCategory && (
          <span className="text-sm bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20">
            {selectedCategory}
          </span>
        )}
      </div>

      {/* Sidebar - Desktop & Mobile Overlay */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-[100] w-72 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-0 md:bg-transparent md:border-none md:w-64",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6 md:p-0 space-y-8">
          <div className="flex items-center justify-between md:hidden">
            <span className="font-bold text-xl">Categorias</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-500">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="hidden md:block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
              Filtrar por Categoria
            </h3>
            
            <button
              onClick={() => handleCategorySelect(null)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                selectedCategory === null 
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid size={18} />
                <span className="font-medium">Todas as Categorias</span>
              </div>
              <ChevronRight size={16} className={cn(
                "transition-transform",
                selectedCategory === null ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
              )} />
            </button>

            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                  selectedCategory === category 
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                <span className="font-medium truncate pr-2">{category}</span>
                <ChevronRight size={16} className={cn(
                  "transition-transform",
                  selectedCategory === category ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                )} />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar jogos por nome, categoria ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-12 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all backdrop-blur-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="space-y-12 pb-20">
          {(searchTerm.trim() || selectedCategory) ? (
            // Search or Filter results view
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-zinc-100 flex items-center flex-wrap gap-2">
                  {searchTerm.trim() ? (
                    <>Resultados para "{searchTerm}"</>
                  ) : (
                    <>Jogos em {selectedCategory}</>
                  )}
                  <span className="text-sm font-normal text-zinc-500">
                    ({filteredGames.length} {filteredGames.length === 1 ? 'jogo encontrado' : 'jogos encontrados'})
                  </span>
                </h2>
                {selectedCategory && searchTerm.trim() && (
                  <p className="text-sm text-zinc-500">
                    Filtrado por categoria: <span className="text-zinc-300 font-medium">{selectedCategory}</span>
                  </p>
                )}
              </div>
              
              {filteredGames.length > 0 ? (
                <div className="flex flex-wrap gap-8 justify-center sm:justify-start py-4 -my-4">
                  {filteredGames.map((game) => (
                    <div key={game.id} className="w-64 md:w-72 shrink-0">
                      <GameCard game={game} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-500 bg-zinc-900/20 rounded-3xl border border-zinc-800/50">
                  <p className="text-lg">Nenhum jogo encontrado para sua busca ou filtro.</p>
                  <p className="text-sm mt-1">Tente trocar a categoria ou buscar termos diferentes.</p>
                </div>
              )}
            </div>
          ) : (
            // Default categorized view (only when no search AND no category filter)
            <>
              {Object.keys(categorizedGames).length > 0 ? (
                Object.entries(categorizedGames).map(([category, categoryGames]) => (
                  <CategoryRow key={category} title={category} games={categoryGames} />
                ))
              ) : (
                <div className="py-20 text-center text-zinc-500">
                  <p>Nenhum jogo disponível no momento.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
