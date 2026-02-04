"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { Asset } from "@/types/game";
import { cn } from "@/lib/utils";
import { motion, useDragControls } from "framer-motion";

interface StaticElementProps {
  element: Asset & { id: string; position: { x: number; y: number } };
  handleEvent: (event: any) => void;
  executeLogic: (triggerType: string, triggerData?: any) => void;
  activeAnimation?: string;
  inputValue?: string;
  onInputChange?: (id: string, value: string) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  otherElements?: Array<{ id: string; rect: DOMRect | null }>;
}

const StaticElement = ({ 
  element, 
  handleEvent,
  executeLogic,
  activeAnimation,
  inputValue,
  onInputChange,
  containerRef
}: StaticElementProps) => {
  const dragControls = useDragControls();
  const overlappingElements = useRef<Set<string>>(new Set());

  if (element.type === 'audio') return null;

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

  const handleDrag = (event: any, info: any) => {
    if (!element.draggable || !executeLogic) return;

    // Get current element's rect - using closest to ensure we get the main container
    const currentElement = (event.target as HTMLElement).closest('[data-game-element-id]') as HTMLElement;
    if (!currentElement) return;

    const currentRect = currentElement.getBoundingClientRect();

    // Find all other game elements
    const otherElements = document.querySelectorAll('[data-game-element-id]');
    
    otherElements.forEach((el) => {
      const targetId = el.getAttribute('data-game-element-id');
      if (targetId === element.id || !targetId) return;

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
          executeLogic('onOverlap', { id: element.id, targetId });
        }
      } else {
        // Remove from set if it's no longer overlapping and trigger onSeparate
        if (overlappingElements.current.has(targetId)) {
          overlappingElements.current.delete(targetId);
          executeLogic('onSeparate', { id: element.id, targetId });
        }
      }
    });
  };

  const handleDragEnd = (event: any, info: any) => {
    // Trigger onSeparate for all remaining overlapping elements
    overlappingElements.current.forEach((targetId) => {
      executeLogic('onSeparate', { id: element.id, targetId });
    });
    overlappingElements.current.clear();
  };

  return (
    <motion.div
      key={element.id}
      data-game-element-id={element.id}
      drag={element.draggable}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={containerRef}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        position: 'absolute',
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        width: element.type === 'text' ? (element.style?.width ? `${element.style.width}px` : 'max-content') : (element.style?.width ? `${element.style.width}px` : (element.type === 'image' ? '128px' : (element.type === 'shape' ? '100px' : undefined))),
        height: element.type === 'text' ? 'max-content' : (element.style?.height ? `${element.style.height}px` : (element.type === 'image' ? '128px' : (element.type === 'shape' ? '100px' : undefined))),
        transform: `translate(-50%, -50%) translate(${element.style?.translateX || 0}px, ${element.style?.translateY || 0}px)`,
        transition: element.draggable ? 'none' : 'transform 0.3s ease-out',
        zIndex: element.style?.zIndex || 10,
        maxWidth: element.type === 'text' ? '100%' : undefined,
        cursor: element.draggable ? 'grab' : (element.events?.length ? 'pointer' : 'default'),
        pointerEvents: 'auto',
        touchAction: 'none'
      }}
      className={cn("flex items-center justify-center", getAnimationClass(activeAnimation || element.animation))}
      onClick={(e) => {
        e.stopPropagation();
        if (element.events?.length) {
          element.events.filter(ev => ev.trigger === 'click').forEach(handleEvent);
        }
        executeLogic('onClick', { id: element.id });
      }}
      onMouseEnter={() => {
        if (element.events?.length) {
          element.events.filter(ev => ev.trigger === 'hover').forEach(handleEvent);
        }
        executeLogic('onHover', { id: element.id });
      }}
    >
      {element.type === 'text' ? (
        <div 
          style={{
            color: element.style?.color || '#000000',
            fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : '1.125rem',
            fontFamily: element.style?.fontFamily,
            fontWeight: element.style?.fontWeight || 'normal',
            fontStyle: element.style?.fontStyle || 'normal',
            textDecoration: element.style?.textDecoration || 'none',
            backgroundColor: element.style?.backgroundColor,
            borderColor: element.style?.borderColor,
            borderWidth: element.style?.borderWidth ? `${element.style.borderWidth}px` : undefined,
            borderStyle: element.style?.borderWidth ? 'solid' : undefined,
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            whiteSpace: element.style?.width ? 'pre-wrap' : 'pre',
            textAlign: (element.style?.textAlign as any) || 'center',
            width: '100%',
            height: '100%'
          }}
        >
          {element.value}
        </div>
      ) : element.type === 'image' ? (
        <div className="relative w-full h-full min-w-[50px] min-h-[50px]">
          {element.value ? (
            <Image 
              src={element.value} 
              alt={element.alt || ""} 
              fill 
              className="object-fill rounded-md" 
            />
          ) : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>}
        </div>
      ) : element.type === 'shape' ? (
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            backgroundColor: element.style?.backgroundColor || '#3b82f6',
            borderWidth: `${element.style?.borderWidth || 0}px`,
            borderColor: element.style?.borderColor || '#000000',
            borderStyle: element.style?.borderWidth ? 'solid' : undefined,
            borderRadius: element.value === 'circle' ? '50%' : element.value === 'rounded' ? '1rem' : '0',
            clipPath: element.value === 'triangle' 
              ? 'polygon(50% 0%, 0% 100%, 100% 100%)' 
              : element.value === 'star' 
              ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
          className="shadow-sm"
        >
          {element.text && (
            <span 
              style={{
                color: element.style?.color || '#ffffff',
                fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : '1rem',
                fontFamily: element.style?.fontFamily,
                fontWeight: element.style?.fontWeight || 'bold',
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
              {element.text}
            </span>
          )}
        </div>
      ) : element.type === 'input' ? (
        <input 
          type="text"
          value={inputValue !== undefined ? inputValue : (element.value || '')}
          onChange={(e) => onInputChange?.(element.id, e.target.value)}
          onBlur={() => executeLogic('onBlur', { id: element.id, value: inputValue })}
          placeholder={element.value || "Digite algo..."}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: element.style?.backgroundColor || '#ffffff',
            color: element.style?.color || '#000000',
            fontSize: element.style?.fontSize ? `${element.style.fontSize}px` : '1rem',
            borderColor: element.style?.borderColor || '#cccccc',
            borderWidth: `${element.style?.borderWidth || 1}px`,
            borderStyle: 'solid',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            outline: 'none'
          }}
          className="shadow-inner focus:ring-2 focus:ring-blue-500 transition-all"
          onClick={(e) => e.stopPropagation()}
        />
      ) : null}
    </motion.div>
  );
};

export default StaticElement;
