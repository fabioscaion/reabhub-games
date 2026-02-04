"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { GameConfig, Option, Asset } from "@/types/game";
import { RotateCcw, Home, ArrowRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { triggerConfetti, triggerSuccessConfetti } from "@/lib/confetti";
import { useGameLogic } from "@/hooks/useGameLogic";
import StaticElement from "./StaticElement";
import { motion, AnimatePresence } from "framer-motion";
import { transitionVariants } from "@/lib/transitions";

interface MemoryCard extends Option {
  uniqueId: string; // To distinguish duplicate cards
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameRunnerProps {
  config: GameConfig;
}

export default function MemoryGameRunner({ config }: MemoryGameRunnerProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]); // uniqueIds
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [activeTransition, setActiveTransition] = useState<string>('fade');
  const [score, setScore] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const {
    activeAnimations,
    propertyOverrides,
    executeLogic,
    handleNextLevel: nextLevelLogic,
    resetLevelState: resetLogicState,
    getMergedElement
  } = useGameLogic({
    config,
    currentLevelIndex,
    setCurrentLevelIndex,
    onLevelComplete: () => {
      // Memory game specific cleanup is handled in initializeLevel
    },
    onGameFinished: () => {
      setIsFinished(true);
      triggerConfetti();
    },
    onShowSuccess: () => {
      setScore((prev) => prev + 1);
      triggerSuccessConfetti();
      // For memory game, we might not want to show a separate screen mid-level
      // but we should at least provide some feedback if requested by logic
    },
    onShowError: () => {
      // Feedback for error
    },
    onLevelChange: (levelId, transition) => {
      const levelIndex = config.levels.findIndex(l => l.id === levelId);
      if (levelIndex !== -1) {
        if (transition) setActiveTransition(transition);
        setCurrentLevelIndex(levelIndex);
        setCards([]);
        setFlippedCards([]);
        setIsProcessing(false);
        resetLogicState();
      }
    }
  });

  const currentLevel = config.levels[currentLevelIndex];

  // Initialize level
  useEffect(() => {
    initializeLevel();
  }, [currentLevelIndex]);

  const initializeLevel = () => {
    const levelOptions = config.levels[currentLevelIndex].options;
    let gameCards: MemoryCard[] = [];
    
    // Check if we have explicit pairs via matchId
    const hasExplicitPairs = levelOptions.some(o => !!o.matchId);

    if (hasExplicitPairs) {
        // Use options as-is, just mapping to MemoryCard
        // We assume the user created valid pairs with matching matchIds
        gameCards = levelOptions.map(opt => ({
            ...opt,
            uniqueId: opt.id, // Use actual ID since they are distinct options
            isFlipped: false,
            isMatched: false
        }));
    } else {
        // Classic mode: duplicate each option to create a pair
        levelOptions.forEach(opt => {
            // Card 1
            gameCards.push({ ...opt, uniqueId: `${opt.id}-1`, isFlipped: false, isMatched: false });
            // Card 2 (Pair)
            gameCards.push({ ...opt, uniqueId: `${opt.id}-2`, isFlipped: false, isMatched: false });
        });
    }

    // Shuffle
    gameCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(gameCards);
    setFlippedCards([]);
    setIsProcessing(false);
  };

  // Play scene audio elements and background audio
  useEffect(() => {
    if (isFinished) return;

    const audioElements = currentLevel.staticElements?.filter(el => el.type === 'audio' && el.value) || [];
    
    audioElements.forEach(el => {
        const audio = new Audio(el.value);
        audio.play().catch(err => console.error("Error playing scene audio:", err));
    });

    if (currentLevel.backgroundAudio) {
        const bgAudio = new Audio(currentLevel.backgroundAudio);
        bgAudio.loop = true;
        bgAudio.play().catch(err => console.error("Error playing background audio:", err));
        return () => {
            bgAudio.pause();
            bgAudio.src = "";
        };
    }
  }, [currentLevelIndex, isFinished]);

  const handleEvent = (event: any) => {
    if (event.action === 'playSound' && event.value) {
      const audio = new Audio(event.value);
      audio.play().catch(err => console.error("Error playing event audio:", err));
    } else if (event.action === 'goToLevel' && event.value) {
      const targetIndex = config.levels.findIndex(l => l.id === event.value);
      if (targetIndex !== -1) {
        setCurrentLevelIndex(targetIndex);
        resetLevelState();
      }
    }
  };

  // Trigger onStart logic
  useEffect(() => {
    executeLogic('onStart');
  }, [currentLevelIndex, executeLogic]);

  const resetLevelState = () => {
    setFlippedCards([]);
    setIsProcessing(false);
    resetLogicState();
    initializeLevel();
  };

  const getAnimationClass = (anim?: string) => {
    switch (anim) {
      case 'float': return 'animate-float';
      case 'pulse': return 'animate-pulse';
      case 'shake': return 'animate-shake-element';
      case 'spin': return 'animate-spin';
      case 'bounce': return 'animate-bounce';
      default: return '';
    }
  };

  const handleCardClick = (uniqueId: string) => {
    if (isProcessing) return;
    const card = cards.find(c => c.uniqueId === uniqueId);
    if (!card) return;

    // Execute custom events if they exist
    if (card.content.events?.length) {
      card.content.events.forEach(event => {
        if (event.trigger === 'click') {
          handleEvent(event);
        }
      });
    }

    // Execute flow logic
    executeLogic('onClick', { id: card.id });

    // Play interaction audio if present
    if (card.content.interactionAudio) {
        const audio = new Audio(card.content.interactionAudio);
        audio.play().catch(err => console.error("Error playing interaction audio:", err));
    }

    if (flippedCards.includes(uniqueId)) return;
    if (card.isMatched) return;

    const newFlipped = [...flippedCards, uniqueId];
    setFlippedCards(newFlipped);
    
    // Update card state to show it
    setCards(prev => prev.map(c => c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      checkForMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkForMatch = (id1: string, id2: string) => {
    const card1 = cards.find(c => c.uniqueId === id1);
    const card2 = cards.find(c => c.uniqueId === id2);

    if (card1 && card2) {
        // Match logic:
        // 1. Explicit pairs: matchId must be equal and truthy
        // 2. Classic duplication: id (source option id) must be equal
        const isMatch = (card1.matchId && card2.matchId && card1.matchId === card2.matchId) || 
                        (!card1.matchId && !card2.matchId && card1.id === card2.id);

        if (isMatch) {
            // Match!
            setTimeout(() => {
                setCards(prev => prev.map(c => 
                (c.uniqueId === id1 || c.uniqueId === id2) 
                    ? { ...c, isMatched: true, isFlipped: true } 
                    : c
                ));
                setFlippedCards([]);
                setIsProcessing(false);
                setScore(prev => prev + 1);
                triggerSuccessConfetti();
                
                // Check if level complete
                // ...
            }, 500);
        } else {
            // No Match
            setTimeout(() => {
                setCards(prev => prev.map(c => 
                (c.uniqueId === id1 || c.uniqueId === id2) 
                    ? { ...c, isFlipped: false } 
                    : c
                ));
                setFlippedCards([]);
                setIsProcessing(false);
            }, 1000);
        }
    }
  };

  const isLevelComplete = cards.length > 0 && cards.every(c => c.isMatched);

  const handleNextLevel = () => {
    if (currentLevelIndex < config.levels.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      triggerConfetti();
    }
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setScore(0);
    setIsFinished(false);
    initializeLevel();
  };

  if (isFinished) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-green-600">Parabéns!</h2>
        <p className="text-xl">Você completou o jogo de memória!</p>
        <div className="flex gap-4">
          <button
            onClick={restartGame}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <RotateCcw size={20} />
            Jogar Novamente
          </button>
          <Link
            href="/games"
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Home size={20} />
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLevelIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={(transitionVariants as any)[activeTransition] || transitionVariants.fade}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{config.name}</h2>
              <p className="text-gray-500">Nível {currentLevelIndex + 1} de {config.levels.length}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 uppercase font-bold mb-1">Pares Encontrados</div>
              <div className="text-3xl font-bold text-blue-600">
                {cards.filter(c => c.isMatched).length / 2} / {cards.length / 2}
              </div>
            </div>
          </div>

          <div 
            className="relative bg-gray-50 dark:bg-zinc-950 rounded-2xl p-6 shadow-inner border border-gray-200 dark:border-zinc-800 min-h-[500px]"
            style={{ backgroundColor: currentLevel.style?.backgroundColor }}
            ref={gameContainerRef}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {cards.map((card) => (
                <button
                  key={card.uniqueId}
                  disabled={card.isMatched || isProcessing || card.isFlipped}
                  onClick={() => handleCardClick(card.uniqueId)}
                  className={cn(
                    "aspect-square relative transition-all duration-500 preserve-3d cursor-pointer hover:scale-105",
                    card.isFlipped || card.isMatched ? "rotate-y-180" : ""
                  )}
                >
                  {/* Front (Back of card) */}
                  <div className={cn(
                    "absolute inset-0 bg-blue-600 rounded-xl flex items-center justify-center backface-hidden shadow-md",
                    "border-4 border-white dark:border-zinc-800"
                  )}>
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                  </div>

                  {/* Back (Front of card - the content) */}
                  <div className={cn(
                    "absolute inset-0 bg-white dark:bg-zinc-900 rounded-xl flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-md p-2 overflow-hidden",
                    card.isMatched ? "ring-4 ring-green-500" : "border-2 border-gray-100 dark:border-zinc-800"
                  )}>
                    {card.content.type === 'image' ? (
                      <div className="relative w-full h-full">
                        {card.content.value ? (
                          <Image src={card.content.value} alt={card.content.name || "Card"} fill className="object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-center font-bold text-lg text-gray-800 dark:text-gray-100">
                        {card.content.value}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Static Elements Support */}
            {currentLevel.staticElements?.map(element => (
              <StaticElement 
                key={element.id} 
                element={getMergedElement(element)} 
                handleEvent={() => {}} // Memory game handles its own events mostly
                executeLogic={executeLogic}
                activeAnimation={activeAnimations[element.id]}
                containerRef={gameContainerRef}
              />
            ))}
          </div>

          {isLevelComplete && (
            <div className="mt-8 flex justify-center animate-in fade-in zoom-in duration-300">
              <button
                onClick={handleNextLevel}
                className="group flex items-center gap-3 px-10 py-4 bg-green-500 hover:bg-green-600 text-white text-xl font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                {currentLevelIndex === config.levels.length - 1 ? "Finalizar Jogo" : "Próximo Nível"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
