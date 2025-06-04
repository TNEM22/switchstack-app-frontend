import { ReactNode, useState, useEffect } from 'react';
import { motion, useDragControls, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface DragContainerProps {
  children: ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (info: any) => void;
  className?: string;
  dragEnabled?: boolean;
  dragId?: string;
  dragHandleClassName?: string;
}

export function DragContainer({
  children,
  onDragStart,
  onDragEnd,
  className = '',
  dragEnabled = true,
  dragId,
  dragHandleClassName,
}: DragContainerProps) {
  const isMobile = useIsMobile();
  const [longPressActive, setLongPressActive] = useState(false);
  const dragControls = useDragControls();
  const [touchTimer, setTouchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [touchStartPoint, setTouchStartPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (touchTimer) clearTimeout(touchTimer);
    };
  }, [touchTimer]);

  const handleLongPressStart = () => {
    if (isMobile && dragEnabled) {
      setLongPressActive(true);
      if (onDragStart) onDragStart();

      // Prevent text selection globally when drag starts
      document.body.classList.add('touch-none', 'select-none');
    }
  };

  const handleDragEnd = (info: any) => {
    setLongPressActive(false);
    if (onDragEnd) onDragEnd(info);

    // Re-enable text selection when drag ends
    document.body.classList.remove('touch-none', 'select-none');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile && dragEnabled) {
      const touch = e.touches[0];
      setTouchStartPoint({ x: touch.clientX, y: touch.clientY });
      // Use a shorter timeout (200ms) for more responsive feel
      const timer = setTimeout(handleLongPressStart, 200);
      setTouchTimer(timer);

      // Prevent default behavior during touch start to avoid text selection
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPoint || !isMobile || !dragEnabled) return;

    // Prevent default to avoid text selection during drag
    e.preventDefault();

    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartPoint.x);
    const diffY = Math.abs(touch.clientY - touchStartPoint.y);

    // If user has moved finger more than 3px (reduced from 5px), activate drag mode
    if ((diffX > 3 || diffY > 3) && !longPressActive) {
      if (touchTimer) {
        clearTimeout(touchTimer);
        setTouchTimer(null);
      }
      // Immediately activate drag mode when user starts moving finger
      handleLongPressStart();
    }
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
    setTouchStartPoint(null);

    // Re-enable text selection when touch ends
    document.body.classList.remove('touch-none', 'select-none');
  };

  return (
    <motion.div
      className={`${className} ${
        longPressActive ? 'z-50 select-none touch-none' : ''
      }`}
      drag={isMobile ? longPressActive && dragEnabled : dragEnabled}
      dragControls={dragControls}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0} // Changed to 0 for direct cursor following
      dragMomentum={false} // Disabled momentum for precise control
      dragTransition={{
        power: 0, // No power needed for direct following
        timeConstant: 0, // No time constant for immediate response
      }}
      onDragStart={onDragStart}
      onDragEnd={(event, info) => handleDragEnd(info)}
      whileDrag={{
        scale: 1.03,
        zIndex: 50,
        opacity: 0.9,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        cursor: 'grabbing',
      }}
      whileTap={dragEnabled ? { scale: 1.02, cursor: 'grabbing' } : undefined}
      whileHover={dragEnabled ? { scale: 1.01 } : undefined}
      data-drag-id={dragId}
      onContextMenu={(e) => {
        if (isMobile && dragEnabled) e.preventDefault();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        touchAction: longPressActive ? 'none' : 'auto',
        position: dragEnabled ? 'relative' : 'static',
        transition: 'box-shadow 0.2s ease, opacity 0.2s ease',
        userSelect: longPressActive ? 'none' : 'auto',
        cursor: longPressActive ? 'grabbing' : dragEnabled ? 'grab' : 'auto',
      }}
    >
      <AnimatePresence>
        {longPressActive && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='fixed inset-0 bg-background/80 backdrop-blur-sm z-40 touch-none'
            onClick={() => setLongPressActive(false)}
          />
        )}
      </AnimatePresence>
      <div
        className={`${
          longPressActive && isMobile
            ? 'relative z-50 select-none touch-none'
            : ''
        } ${dragEnabled ? 'w-full h-full' : ''}`}
      >
        {dragEnabled && isMobile && (
          <div className='absolute inset-0 bg-transparent z-10' />
        )}
        {children}
      </div>
    </motion.div>
  );
}
