"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { GameConfig, Option } from "@/types/game";
import { ArrowRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import MemoryGameRunner from "./MemoryGameRunner";
import SequencingGameRunner from "./SequencingGameRunner";
import StaticElement from "./StaticElement";
import GameHeader from "./GameHeader";
import { GameFinishedScreen } from "./GameFeedback";
import OptionButton from "./OptionButton";
import { triggerSuccessConfetti, triggerConfetti } from "@/lib/confetti";
import { useGameLogic } from "@/hooks/useGameLogic";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { transitionVariants } from "@/lib/transitions";

interface GameRunnerProps {
  config: GameConfig;
}

export default function GameRunner({ config }: GameRunnerProps) {
  // Auto-detect game type from first level if generic or if it seems to match a specific pattern
  const effectiveType = useMemo(() => {
    const firstLevel = config.levels[0];
    if (!firstLevel) return config.type;

    const hasOrder = firstLevel.options.some(o => typeof o.order === 'number');
    if (hasOrder) return 'sequencing';

    const hasMatchId = firstLevel.options.some(o => !!o.matchId);
    if (hasMatchId) return 'memory';

    return config.type;
  }, [config.levels, config.type]);

  const memoizedConfig = useMemo(() => config, [config]);

  // Dispatch to specialized runners
  if (effectiveType === 'memory') {
    return <MemoryGameRunner config={memoizedConfig} />;
  }
  if (effectiveType === 'sequencing') {
    return <SequencingGameRunner config={memoizedConfig} />;
  }

  // Standard runner for naming, comprehension, association
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [forcedFeedback, setForcedFeedback] = useState<'success' | 'error' | null>(null);
  const [activeTransition, setActiveTransition] = useState<string>('fade');
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const {
    activeAnimations,
    executeLogic,
    getMergedElement,
    handleInputChange,
    inputValues,
    resetLevelState: resetLogicState,
    handleNextLevel: nextLevelLogic
  } = useGameLogic({
    config: memoizedConfig,
    currentLevelIndex,
    setCurrentLevelIndex,
    onLevelComplete: () => {
      setSelectedOption(null);
      setSelectedOptions([]);
      setIsAnswered(false);
      setShowFeedback(false);
      setForcedFeedback(null);
    },
    onGameFinished: () => {
      setIsFinished(true);
      triggerConfetti();
    },
    onShowSuccess: () => {
      setIsAnswered(true);
      setShowFeedback(true);
      setForcedFeedback('success');
      setScore((prev) => prev + 1);
      triggerSuccessConfetti();
    },
    onShowError: () => {
      setIsAnswered(true);
      setShowFeedback(true);
      setForcedFeedback('error');
    },
    onLevelChange: (levelId, transition) => {
      const levelIndex = config.levels.findIndex(l => l.id === levelId);
      if (levelIndex !== -1) {
        if (transition) setActiveTransition(transition);
        setCurrentLevelIndex(levelIndex);
        setSelectedOption(null);
        setSelectedOptions([]);
        setIsAnswered(false);
        setShowFeedback(false);
        setForcedFeedback(null);
        resetLogicState();
      }
    }
  });

  const currentLevel = config.levels[currentLevelIndex];
  const progress = ((currentLevelIndex) / config.levels.length) * 100;
  const showChecklist = currentLevel.showChecklist;
  const correctOptions = currentLevel.options
    .filter(o => o.isCorrect)
    .sort((a, b) => (a.content.value || "").localeCompare(b.content.value || ""));

  useEffect(() => {
    const shouldRunTimer = !isFinished && !(config.levels.length === 1 && isAnswered);

    if (shouldRunTimer) {
        timerRef.current = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isFinished, isAnswered, config.levels.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play scene audio elements
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

  // Trigger onStart logic
  useEffect(() => {
    executeLogic('onStart');
  }, [currentLevelIndex, executeLogic]);

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

  const getAnimationClass = (anim?: string) => {
    switch (anim) {
      case 'float': return 'animate-float';
      case 'pulse': return 'animate-pulse';
      case 'shake': return 'animate-shake-element';
      case 'spin': return 'animate-spin-element';
      case 'bounce': return 'animate-bounce-element';
      default: return '';
    }
  };

  const handleOptionClick = (option: Option) => {
    if (option.content.events?.length) {
      option.content.events.forEach(event => {
        if (event.trigger === 'click') handleEvent(event);
      });
    }

    executeLogic('onClick', { id: option.id });

    if (option.content.interactionAudio) {
        const audio = new Audio(option.content.interactionAudio);
        audio.play().catch(err => console.error("Error playing interaction audio:", err));
    }

    if (currentLevel.type === 'menu' && option.targetLevelId) {
      const targetIndex = config.levels.findIndex(l => l.id === option.targetLevelId);
      if (targetIndex !== -1) {
        setCurrentLevelIndex(targetIndex);
        resetLevelState();
      }
      return;
    }

    if (isAnswered) return;

    if (showChecklist) {
       let newSelected: string[];
       if (selectedOptions.includes(option.id)) {
          newSelected = selectedOptions.filter(id => id !== option.id);
       } else {
          newSelected = [...selectedOptions, option.id];
       }
       setSelectedOptions(newSelected);
       
       const allCorrectFound = correctOptions.every(o => newSelected.includes(o.id));
       if (allCorrectFound) {
             setIsAnswered(true);
             setShowFeedback(true);
             setScore((prev) => prev + 1);
             triggerSuccessConfetti();
       }
       return;
    }

    setSelectedOption(option.id);
    setIsAnswered(true);
    setShowFeedback(true);

    if (option.isCorrect) {
      setScore((prev) => prev + 1);
      triggerSuccessConfetti();
    }
  };

  const handleNextLevel = () => {
    nextLevelLogic();
  };

  const resetLevelState = () => {
    setSelectedOption(null);
    setSelectedOptions([]);
    setIsAnswered(false);
    setShowFeedback(false);
    setForcedFeedback(null);
    resetLogicState();
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setScore(0);
    setIsFinished(false);
    setElapsedTime(0);
    resetLevelState();
  };

  if (isFinished) {
    return <GameFinishedScreen name={config.name} score={score} totalLevels={config.levels.length} onRestart={restartGame} />;
  }

  const isStimulusImage = currentLevel.stimulus?.type === "image";
  const hasPositioning = currentLevel.options.some(opt => opt.position) || !!currentLevel.stimulus?.position || (currentLevel.staticElements && currentLevel.staticElements.length > 0);

  const isCorrect = forcedFeedback 
    ? forcedFeedback === 'success'
    : (showChecklist
        ? (correctOptions.length > 0 && correctOptions.every(o => selectedOptions.includes(o.id)))
        : (selectedOption ? currentLevel.options.find(o => o.id === selectedOption)?.isCorrect : false));
  const customScreen = showFeedback ? (isCorrect ? currentLevel.successScreen : currentLevel.errorScreen) : null;
  const hasCustomScreen = customScreen && ((customScreen.staticElements?.length || 0) > 0 || !!customScreen.style?.backgroundColor);

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col min-h-screen">
      <GameHeader 
        name={config.name}
        elapsedTime={elapsedTime}
        currentLevelIndex={currentLevelIndex}
        totalLevels={config.levels.length}
        progress={progress}
        formatTime={formatTime}
      />

      <div className="flex-1 flex flex-col justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLevelIndex}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={(transitionVariants as any)[activeTransition] || transitionVariants.fade}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex-1 flex flex-col justify-center"
          >
            <div className={cn("flex gap-6", showChecklist ? "flex-col lg:flex-row" : "flex-col")}>
            <div className="flex-1 relative">
            {hasCustomScreen ? (
             <div 
               className="relative w-full mx-auto aspect-video bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-zinc-800 transition-colors duration-300"
               style={{ backgroundColor: customScreen.style?.backgroundColor }}
               ref={gameContainerRef}
             >
                {customScreen.staticElements?.map(element => (
                   <StaticElement 
                     key={element.id} 
                     element={getMergedElement(element)} 
                     handleEvent={handleEvent}
                     executeLogic={executeLogic}
                     activeAnimation={activeAnimations[element.id]}
                     inputValue={inputValues[element.id]}
                     onInputChange={handleInputChange}
                     containerRef={gameContainerRef}
                   />
                ))}
             </div>
        ) : (
        <div 
          className={cn(
            "relative w-full mx-auto bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-zinc-800 transition-colors duration-300",
            hasPositioning ? "aspect-video" : "p-8"
          )}
          style={{
            backgroundColor: currentLevel.style?.backgroundColor || '#ffffff'
          }}
          ref={gameContainerRef}
        >
          {!hasPositioning && (
             <div className="flex flex-col gap-8">
                {currentLevel.stimulus && (
                    <div className="flex justify-center">
                      {isStimulusImage ? (
                        <div className="relative w-64 h-64 rounded-xl overflow-hidden shadow-md bg-white">
                          {currentLevel.stimulus.value ? (
                            <Image src={currentLevel.stimulus.value} alt={currentLevel.stimulus.alt || "Game stimulus"} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800 text-gray-300 dark:text-zinc-600">
                              <ImageIcon size={48} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="px-8 py-6 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-100 rounded-xl text-3xl font-bold">
                          {currentLevel.stimulus.value}
                        </div>
                      )}
                    </div>
                )}
                <div className={cn("grid gap-4", currentLevel.options[0]?.content.type === 'image' ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2")}>
                    {currentLevel.options.map((option) => (
                      <OptionButton
                        key={option.id}
                        option={option}
                        mergedOption={getMergedElement({ ...option, id: option.id, ...option.content })}
                        isSelected={selectedOption === option.id}
                        isAnswered={isAnswered}
                        isCorrect={option.isCorrect}
                        showFeedback={showFeedback}
                        showChecklist={!!showChecklist}
                        handleOptionClick={handleOptionClick}
                        handleEvent={handleEvent}
                        executeLogic={executeLogic}
                        getAnimationClass={getAnimationClass}
                        containerRef={gameContainerRef}
                      />
                    ))}
                </div>
             </div>
          )}
          
          {hasPositioning && (
            <>
               {currentLevel.stimulus && (
                 <div
                   style={{
                     position: 'absolute',
                     left: `${currentLevel.stimulus.position?.x || 50}%`,
                     top: `${currentLevel.stimulus.position?.y || 20}%`,
                     width: currentLevel.stimulus.style?.width ? `${currentLevel.stimulus.style.width}px` : undefined,
                     height: currentLevel.stimulus.style?.height ? `${currentLevel.stimulus.style.height}px` : undefined,
                     transform: 'translate(-50%, -50%)',
                     zIndex: currentLevel.stimulus.style?.zIndex || 10
                   }}
                   className="pointer-events-none flex items-center justify-center"
                 >
                    {currentLevel.stimulus.type === 'image' ? (
                        <div className="relative w-full h-full min-w-[100px] min-h-[100px]">
                            {currentLevel.stimulus.value ? (
                                <Image src={currentLevel.stimulus.value} alt={currentLevel.stimulus.alt || ""} fill className="object-contain" />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon /></div>
                            )}
                        </div>
                    ) : (
                        <div 
                            style={{
                                color: currentLevel.stimulus.style?.color || '#000000',
                                fontSize: currentLevel.stimulus.style?.fontSize ? `${currentLevel.stimulus.style.fontSize}px` : '2rem',
                                fontFamily: currentLevel.stimulus.style?.fontFamily,
                                fontWeight: currentLevel.stimulus.style?.fontWeight || 'bold',
                                backgroundColor: currentLevel.stimulus.style?.backgroundColor,
                                padding: currentLevel.stimulus.style?.backgroundColor ? '1rem' : undefined,
                                borderRadius: '0.5rem',
                                whiteSpace: 'pre-wrap',
                                textAlign: 'center'
                            }}
                        >
                            {currentLevel.stimulus.value}
                        </div>
                    )}
                 </div>
               )}

               {currentLevel.staticElements?.map((element) => (
                  <StaticElement 
                    key={element.id} 
                    element={getMergedElement(element)} 
                    handleEvent={handleEvent}
                    executeLogic={executeLogic}
                    activeAnimation={activeAnimations[element.id]}
                    inputValue={inputValues[element.id]}
                    onInputChange={handleInputChange}
                    containerRef={gameContainerRef}
                  />
               ))}

               {currentLevel.type !== 'info' && currentLevel.options.map((option) => (
                  <OptionButton
                    key={option.id}
                    option={option}
                    mergedOption={getMergedElement({ ...option, id: option.id, ...option.content })}
                    isSelected={showChecklist ? selectedOptions.includes(option.id) : selectedOption === option.id}
                    isAnswered={isAnswered}
                    isCorrect={option.isCorrect}
                    showFeedback={showFeedback}
                    showChecklist={!!showChecklist}
                    handleOptionClick={handleOptionClick}
                    handleEvent={handleEvent}
                    executeLogic={executeLogic}
                    getAnimationClass={getAnimationClass}
                    containerRef={gameContainerRef}
                  />
               ))}
            </>
          )}
        </div>
        )}
      </div>

      {showChecklist && (
        <div className="w-full lg:w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800 p-6 shrink-0 h-fit self-start animate-in slide-in-from-right-4 fade-in duration-500">
           <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-4 flex items-center gap-2">
              <ListChecks size={20} />
              Palavras
           </h3>
           <div className="flex flex-wrap lg:flex-col gap-2 max-h-[150px] lg:max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
              {correctOptions.map(opt => {
                 const found = selectedOptions.includes(opt.id);
                 return (
                    <div 
                      key={opt.id} 
                      className={cn(
                        "text-sm px-3 py-2 rounded-lg transition-all border",
                        found 
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900/50 line-through decoration-green-500/50" 
                          : "bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-zinc-700"
                      )}
                    >
                       {opt.content.value}
                    </div>
                 );
              })}
           </div>
        </div>
      )}
      </div>

        {(isAnswered || currentLevel.type === 'info') && (
          <div className="mt-8 flex justify-end animate-in slide-in-from-bottom-2 fade-in shrink-0 z-50">
            <button
              type="button"
              onClick={handleNextLevel}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              {currentLevelIndex === config.levels.length - 1 ? "Finalizar" : "Continuar"}
              <ArrowRight size={20} />
            </button>
          </div>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
