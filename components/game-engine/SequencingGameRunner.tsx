"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { GameConfig, Option, Asset } from "@/types/game";
import { CheckCircle2, ArrowRight, RotateCcw, Home, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { triggerConfetti, triggerSuccessConfetti } from "@/lib/confetti";
import { useGameLogic } from "@/hooks/useGameLogic";
import StaticElement from "./StaticElement";
import OptionButton from "./OptionButton";
import { motion, AnimatePresence } from "framer-motion";
import { transitionVariants } from "@/lib/transitions";

interface SequencingGameRunnerProps {
  config: GameConfig;
}

export default function SequencingGameRunner({ config }: SequencingGameRunnerProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<Option[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // Expecting order 1, then 2, etc.
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [activeTransition, setActiveTransition] = useState<string>('fade');
  const [wrongFeedbackId, setWrongFeedbackId] = useState<string | null>(null);
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
    onLevelComplete: () => {},
    onGameFinished: () => {
      setIsFinished(true);
      triggerConfetti();
    },
    onShowSuccess: () => {
      triggerSuccessConfetti();
    },
    onShowError: () => {
      // Feedback for error
    },
    onLevelChange: (levelId, transition) => {
      const levelIndex = config.levels.findIndex(l => l.id === levelId);
      if (levelIndex !== -1) {
        if (transition) setActiveTransition(transition);
        setCurrentLevelIndex(levelIndex);
        setShuffledOptions([]);
        setCurrentStep(1);
        setCompletedIds([]);
        setWrongFeedbackId(null);
        resetLogicState();
      }
    }
  });

  const currentLevel = config.levels[currentLevelIndex];
  const hasPositioning = currentLevel.options.some(opt => opt.position);

  useEffect(() => {
    initializeLevel();
  }, [currentLevelIndex]);

  const initializeLevel = () => {
    // Determine correct order.
    // If options have 'order', use it. Else use index+1.
    const optionsWithOrder = config.levels[currentLevelIndex].options.map((opt, idx) => ({
      ...opt,
      order: opt.order || (idx + 1)
    }));

    // Shuffle for display
    const shuffled = [...optionsWithOrder].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setCurrentStep(1);
    setCompletedIds([]);
    setWrongFeedbackId(null);
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

  const resetLevelState = () => {
    setCurrentStep(1);
    setCompletedIds([]);
    setWrongFeedbackId(null);
    resetLogicState();
    initializeLevel();
  };

  const handleOptionClick = (option: Option) => {
    // Execute custom events if they exist
    if (option.content.events?.length) {
      option.content.events.forEach(event => {
        if (event.trigger === 'click') {
          handleEvent(event);
        }
      });
    }

    // Execute flow logic
    executeLogic('onClick', { id: option.id });

    // Play interaction audio if present
    if (option.content.interactionAudio) {
        const audio = new Audio(option.content.interactionAudio);
        audio.play().catch(err => console.error("Error playing interaction audio:", err));
    }

    if (completedIds.includes(option.id)) return;

    // Check if this option is the next one
    // We expect option.order === currentStep
    const optionOrder = option.order || 0; 

    if (optionOrder === currentStep) {
      // Correct!
      setCompletedIds(prev => [...prev, option.id]);
      setCurrentStep(prev => prev + 1);
      triggerSuccessConfetti();
      
      // Check completion happens in render or effect, but here works too
    } else {
      // Wrong!
      setWrongFeedbackId(option.id);
      setTimeout(() => {
        setWrongFeedbackId(null);
        // Reset the game level on error
        setCompletedIds([]);
        setCurrentStep(1);
      }, 500);
    }
  };

  const isLevelComplete = shuffledOptions.length > 0 && completedIds.length === shuffledOptions.length;

  useEffect(() => {
    if (isLevelComplete) {
      handleNextLevel();
    }
  }, [isLevelComplete]);

  const handleNextLevel = () => {
    nextLevelLogic();
  };

  const restartGame = () => {
    setCurrentLevelIndex(0);
    setIsFinished(false);
    initializeLevel();
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-8 bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-2xl mx-auto mt-10">
        <h2 className="text-3xl font-bold text-green-600">Parabéns!</h2>
        <p className="text-xl">Você completou a sequência!</p>
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
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{config.name}</h2>
                <p className="text-gray-500">Nível {currentLevelIndex + 1} de {config.levels.length}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 uppercase font-bold mb-1">Passo Atual</div>
                <div className="text-3xl font-bold text-blue-600">
                  {currentStep} / {shuffledOptions.length}
                </div>
              </div>
            </div>
            
            {/* Sequence Progress Bar */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {Array.from({ length: shuffledOptions.length }).map((_, idx) => {
                const stepNumber = idx + 1;
                const isDone = currentStep > stepNumber;
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 font-bold shrink-0 transition-colors",
                      isDone ? "bg-green-500 border-green-500 text-white" : "border-gray-200 dark:border-zinc-800 text-gray-400"
                    )}
                  >
                    {stepNumber}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Options Grid */}
          <div 
            ref={gameContainerRef}
            className={cn(
              "gap-4 relative bg-white dark:bg-zinc-950",
              hasPositioning 
               ? "w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-xl"
               : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 min-h-[400px] p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl"
            )}
            style={{ backgroundColor: currentLevel.style?.backgroundColor }}
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
            
            {shuffledOptions.map((option) => {
              const isCompleted = completedIds.includes(option.id);
              const isWrong = wrongFeedbackId === option.id;

              return (
                <OptionButton
                  key={option.id}
                  option={option}
                  mergedOption={getMergedElement({ ...option, id: option.id, ...option.content })}
                  handleEvent={handleEvent}
                  executeLogic={executeLogic}
                  activeAnimation={activeAnimations[option.id]}
                  isAnswered={isCompleted}
                  isCorrect={isCompleted}
                  isWrong={isWrong}
                  handleOptionClick={() => handleOptionClick(option)}
                  containerRef={gameContainerRef}
                />
              );
            })}
          </div>

          {currentStep > shuffledOptions.length && shuffledOptions.length > 0 && (
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
