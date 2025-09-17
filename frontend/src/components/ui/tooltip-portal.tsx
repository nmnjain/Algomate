import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipPortalProps {
  isVisible: boolean;
  targetRef: React.RefObject<HTMLElement>;
  content: React.ReactNode;
  offset?: number;
}

const TooltipPortal: React.FC<TooltipPortalProps> = ({ 
  isVisible, 
  targetRef, 
  content, 
  offset = 10 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isVisible && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - offset
      });
    }
  }, [isVisible, targetRef, offset]);

  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed text-white text-xs rounded-md px-2 py-1 pointer-events-none shadow-lg"
        style={{
          backgroundColor: '#21262d',
          border: '1px solid #30363d',
          left: position.x,
          top: position.y,
          transform: 'translateX(-50%) translateY(-100%)',
          zIndex: 10000,
          whiteSpace: 'nowrap'
        }}
      >
        {content}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default TooltipPortal;
