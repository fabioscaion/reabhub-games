import React from "react";
import Image from "next/image";
import { Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { Option, Asset } from "@/types/game";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OptionButtonProps {
  option: Option;
  mergedOption: Asset & { id: string; position?: { x: number; y: number } };
  isSelected?: boolean;
  isAnswered?: boolean;
  isCorrect?: boolean;
  showFeedback?: boolean;
  showChecklist?: boolean;
  isWrong?: boolean;
  activeAnimation?: string;
  handleOptionClick: (option: Option) => void;
  handleEvent: (event: any) => void;
  executeLogic?: (triggerType: string, triggerData?: any) => void;
  getAnimationClass?: (anim?: string) => string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const OptionButton = ({
  option,
  mergedOption,
  isSelected = false,
  isAnswered = false,
  isCorrect = false,
  showFeedback = false,
  showChecklist = false,
  isWrong = false,
  activeAnimation,
  handleOptionClick,
  handleEvent,
  executeLogic,
  getAnimationClass,
  containerRef
}: OptionButtonProps) => {
  const overlappingElements = React.useRef<Set<string>>(new Set());

  const internalGetAnimationClass = (anim?: string) => {
    if (getAnimationClass) return getAnimationClass(anim);
    switch (anim) {
      case 'float': return 'animate-float';
      case 'pulse': return 'animate-pulse';
      case 'shake': return 'animate-shake-element';
      case 'spin': return 'animate-spin-element';
      case 'bounce': return 'animate-bounce-element';
      default: return '';
    }
  };

  let stateClass = "hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none";
  
  if (showChecklist) {
      if (isSelected) {
          if (isCorrect) stateClass = "bg-green-100 dark:bg-green-900/40 ring-2 ring-green-500";
          else stateClass = "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500";
      } else {
          stateClass = "hover:bg-blue-50 dark:hover:bg-blue-900/10";
      }
  } else if (isWrong) {
    stateClass = "animate-shake border-red-500 bg-red-50";
  } else {
      if (isAnswered) {
          if (isCorrect) stateClass = "border-green-500 bg-green-50 dark:bg-green-900/20 opacity-50";
          else if (isSelected && !isCorrect) stateClass = "bg-red-50 dark:bg-red-900/20 opacity-50";
          else if (!isSelected && isCorrect && showFeedback) stateClass = "bg-green-50 dark:bg-green-900/20 opacity-70";
          else stateClass = "opacity-40";
      }
  }

  const isPositioned = !!option.position;

  const handleDrag = (event: any, info: any) => {
    if (!mergedOption.draggable || !executeLogic) return;

    // Get current element's rect - using closest to ensure we get the main container
    const currentElement = (event.target as HTMLElement).closest('[data-game-element-id]') as HTMLElement;
    if (!currentElement) return;
    
    const currentRect = currentElement.getBoundingClientRect();

    // Find all other game elements
    const otherElements = document.querySelectorAll('[data-game-element-id]');
    
    otherElements.forEach((el) => {
      const targetId = el.getAttribute('data-game-element-id');
      if (targetId === mergedOption.id || !targetId) return;

      const targetRect = el.getBoundingClientRect();

      // Simple collision detection
      const isOverlapping = !(
        currentRect.right < targetRect.left ||
        currentRect.left > targetRect.right ||
        currentRect.bottom < targetRect.top ||
        currentRect.top > targetRect.bottom
      );

      if (isOverlapping) {
        // Only trigger if it's a new overlap
        if (!overlappingElements.current.has(targetId)) {
          overlappingElements.current.add(targetId);
          executeLogic('onOverlap', { id: mergedOption.id, targetId });
        }
      } else {
        // Remove from set if it's no longer overlapping
        overlappingElements.current.delete(targetId);
      }
    });
  };

  const handleDragEnd = () => {
    overlappingElements.current.clear();
  };

  const style: React.CSSProperties = isPositioned ? {
    position: 'absolute',
    left: `${mergedOption.position?.x || 0}%`,
    top: `${mergedOption.position?.y || 0}%`,
    width: mergedOption.type === 'text' ? (mergedOption.style?.width ? `${mergedOption.style.width}px` : 'max-content') : (mergedOption.style?.width ? `${mergedOption.style.width}px` : (mergedOption.type === 'image' ? '150px' : 'auto')),
    height: mergedOption.type === 'text' ? 'max-content' : (mergedOption.style?.height ? `${mergedOption.style.height}px` : 'auto'),
    minWidth: mergedOption.type === 'text' ? 'min-content' : '100px',
    transform: `translate(-50%, -50%) translate(${mergedOption.style?.translateX || 0}px, ${mergedOption.style?.translateY || 0}px)`,
    transition: mergedOption.draggable ? 'none' : 'transform 0.3s ease-out',
    zIndex: mergedOption.style?.zIndex || 20,
    backgroundColor: mergedOption.style?.backgroundColor,
    backgroundImage: mergedOption.style?.backgroundImage ? `url(${mergedOption.style.backgroundImage})` : undefined,
    backgroundSize: mergedOption.style?.backgroundSize || 'cover',
    backgroundPosition: mergedOption.style?.backgroundPosition || 'center',
    backgroundRepeat: mergedOption.style?.backgroundRepeat || 'no-repeat',
    borderWidth: mergedOption.style?.borderWidth ? `${mergedOption.style.borderWidth}px` : undefined,
    borderColor: mergedOption.style?.borderColor,
    borderStyle: mergedOption.style?.borderWidth ? 'solid' : undefined,
    opacity: mergedOption.style?.opacity,
    visibility: mergedOption.style?.visibility as any,
    cursor: mergedOption.draggable ? 'grab' : ((option.content.events?.length || option.targetLevelId || (!isAnswered || showChecklist)) ? 'pointer' : 'default'),
    touchAction: 'none'
  } : {
    opacity: mergedOption.style?.opacity,
    visibility: mergedOption.style?.visibility as any,
  };

  return (
    <motion.button
      type="button"
      data-game-element-id={mergedOption.id}
      drag={mergedOption.draggable && isPositioned}
      dragConstraints={containerRef}
      dragMomentum={false}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={() => handleOptionClick(option)}
      onMouseEnter={() => {
        if (option.content.events?.length) {
          option.content.events.filter(e => e.trigger === 'hover').forEach(handleEvent);
        }
      }}
      disabled={isAnswered && !showChecklist}
      style={style}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 shadow-sm",
        isPositioned ? "p-2" : "p-4 border-2 bg-white dark:bg-zinc-800",
        !isPositioned && (mergedOption.type === 'image' ? "aspect-square" : "min-h-[80px]"),
        stateClass,
        internalGetAnimationClass(activeAnimation || option.content.animation)
      )}
    >
      {mergedOption.type === 'image' ? (
        <div className={cn("relative w-full h-full rounded-lg overflow-hidden", isPositioned ? "min-w-[50px] min-h-[50px]" : "")}>
          {mergedOption.value ? (
            <Image src={mergedOption.value} alt={option.content.alt || "Option"} fill className={isPositioned ? "object-fill" : "object-cover"} />
          ) : <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300"><ImageIcon /></div>}
        </div>
      ) : (
        <span 
          className={cn("w-full h-full flex items-center justify-center", !isPositioned && "text-xl font-medium")}
          style={{
            fontFamily: mergedOption.style?.fontFamily,
            fontWeight: mergedOption.style?.fontWeight || (isPositioned ? 'normal' : 'medium'),
            color: mergedOption.style?.color || '#000000',
            fontSize: mergedOption.style?.fontSize ? `${mergedOption.style.fontSize}px` : undefined,
            textAlign: 'center',
            whiteSpace: mergedOption.style?.width ? 'pre-wrap' : (isPositioned ? 'pre' : undefined),
          }}
        >
          {mergedOption.value}
        </span>
      )}
      
      {/* Status Icons Overlay */}
      {isAnswered && isSelected && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm z-30">
          {isCorrect ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <XCircle className="text-red-500 w-6 h-6" />}
        </div>
      )}
    </motion.button>
  );
};

export default OptionButton;
