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
            href="/"
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
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200">{config.name}</h1>
        </div>
        <span className="text-sm font-mono text-gray-500">
            Nível {currentLevelIndex + 1}/{config.levels.length}
        </span>
      </div>

      <div 
        className="relative w-full aspect-video p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white"
        style={{ backgroundColor: currentLevel.style?.backgroundColor || '#ffffff' }}
        ref={gameContainerRef}
      >
        {currentLevel.staticElements?.map(element => (
           <StaticElement 
             key={element.id} 
             element={getMergedElement(element)} 
             handleEvent={handleEvent}
             executeLogic={executeLogic}
             activeAnimation={activeAnimations[element.id]}
             containerRef={gameContainerRef}
           />
        ))}
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full relative z-0">
          {cards.map(card => {
            // Merge original style with overrides
            const mergedCard = {
              ...card,
              content: {
                ...card.content,
                style: {
                  ...card.content.style,
                  ...propertyOverrides[card.id]
                }
              }
            };

            return (
              <button
                key={card.uniqueId}
                onClick={() => handleCardClick(card.uniqueId)}
                onMouseEnter={() => {
                  // Legacy events
                  if (card.content.events?.length) {
                    card.content.events.filter(e => e.trigger === 'hover').forEach(handleEvent);
                  }
                  // Flow logic
                  executeLogic('onHover', { id: card.id });
                }}
                className={cn(
                  "aspect-square relative rounded-xl transition-all duration-300 transform perspective-1000",
                  card.isFlipped || card.isMatched ? "rotate-y-180" : "bg-blue-600 hover:bg-blue-700",
                  getAnimationClass(activeAnimations[card.id] || card.content.animation)
                )}
                disabled={card.isMatched}
                 style={{
                   cursor: (card.content.events?.length || !card.isMatched) ? 'pointer' : 'default',
                   transform: `translate(${mergedCard.content.style?.translateX || 0}px, ${mergedCard.content.style?.translateY || 0}px)`,
                   transition: 'transform 0.3s ease-out'
                 }}
               >
              <div className={cn(
                "absolute inset-0 flex items-center justify-center backface-hidden rounded-xl bg-white dark:bg-zinc-800 border-2",
                card.isMatched ? "border-green-500" : "border-gray-200 dark:border-zinc-700",
                !card.isFlipped && !card.isMatched && "hidden" // Optimization
              )}>
                {card.content.type === 'image' ? (
                   <div className="relative w-full h-full p-2">
                      {card.content.value ? (
                        <Image src={card.content.value} alt="Card" fill className="object-contain" />
                      ) : null}
                   </div>
                ) : card.content.type === 'shape' ? (
                   <div 
                     style={{ 
                       width: '100%', 
                       height: '100%', 
                       backgroundColor: card.content.style?.backgroundColor || '#3b82f6',
                       borderWidth: `${card.content.style?.borderWidth || 0}px`,
                       borderColor: card.content.style?.borderColor || '#000000',
                       borderStyle: card.content.style?.borderWidth ? 'solid' : undefined,
                       borderRadius: card.content.value === 'circle' ? '50%' : card.content.value === 'rounded' ? '1rem' : '0',
                       clipPath: card.content.value === 'triangle' 
                         ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
                         : card.content.value === 'star' 
                         ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                         : undefined,
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       overflow: 'hidden'
                     }}
                     className="shadow-sm"
                   >
                     {card.content.text && (
                       <span 
                         style={{
                           color: card.content.style?.color || '#ffffff',
                           fontSize: card.content.style?.fontSize ? `${card.content.style.fontSize}px` : '1rem',
                           fontFamily: card.content.style?.fontFamily,
                           fontWeight: card.content.style?.fontWeight || 'bold',
                           textAlign: 'center',
                           pointerEvents: 'none',
                           padding: '8px',
                           width: '100%',
                           height: '100%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           wordBreak: 'break-word',
                           whiteSpace: 'pre-wrap',
                           overflow: 'hidden'
                         }}
                       >
                         {card.content.text}
                       </span>
                     )}
                   </div>
                ) : (
                   <span 
                     className="text-xl font-bold"
                     style={{ color: card.content.style?.color || '#000000' }}
                   >
                     {card.content.value}
                   </span>
                )}
              </div>
              {/* Back of card */}
              <div className={cn(
                "absolute inset-0 flex items-center justify-center backface-hidden rounded-xl bg-blue-600",
                (card.isFlipped || card.isMatched) && "hidden"
              )}>
                 <span className="text-white text-2xl font-bold">?</span>
              </div>
            </button>
            );
          })}
        </div>
      </div>

      {isLevelComplete && (
         <div className="mt-8 flex justify-end animate-in fade-in slide-in-from-bottom-4">
            <button
              onClick={handleNextLevel}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-lg font-semibold"
            >
              {currentLevelIndex === config.levels.length - 1 ? "Finalizar" : "Próximo Nível"}
              <ArrowRight size={20} />
            </button>
         </div>
      )}
    </div>
  );
}
