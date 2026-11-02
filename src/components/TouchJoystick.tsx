/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface TouchJoystickProps {
  onMove: (values: { forward: number; strafe: number }) => void;
  radius?: number;
}

export const TouchJoystick: React.FC<TouchJoystickProps> = ({
  onMove,
  radius = 60,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchId, setTouchId] = useState<number | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (touchId !== null) return;
      const touch = e.changedTouches[0];
      setTouchId(touch.identifier);
      updatePosition(touch.clientX, touch.clientY);
    },
    [touchId]
  );

  const updatePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    const clampedDist = Math.min(distance, radius);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: knobX, y: knobY });

    // Normalize forward (-1 to 1: up is positive forward) & strafe (-1 to 1: right is positive)
    const normStrafe = knobX / radius;
    const normForward = -knobY / radius;

    onMove({ forward: normForward, strafe: normStrafe });
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          updatePosition(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [touchId]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          setTouchId(null);
          setKnobPos({ x: 0, y: 0 });
          onMove({ forward: 0, strafe: 0 });
          break;
        }
      }
    },
    [touchId, onMove]
  );

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      className="relative flex items-center justify-center rounded-full bg-emerald-950/40 border-2 border-emerald-500/30 backdrop-blur-none pointer-events-auto touch-none select-none shadow-xl"
      style={{
        width: radius * 2.3,
        height: radius * 2.3,
      }}
    >
      {/* Outer compass ring markings: West on top (facing Chak 17 G) */}
      <div className="absolute inset-2 rounded-full border border-dashed border-emerald-400/20" />
      <span className="absolute top-1 text-[11px] font-black text-amber-300 drop-shadow">W</span>
      <span className="absolute bottom-1 text-[10px] font-bold text-emerald-400/70">E</span>
      <span className="absolute left-1 text-[10px] font-bold text-emerald-400/70">S</span>
      <span className="absolute right-1 text-[10px] font-bold text-emerald-400/70">N</span>

      {/* Center stick knob */}
      <div
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 border border-emerald-200/50 shadow-lg flex items-center justify-center"
        style={{
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: touchId === null ? 'transform 0.15s ease-out' : 'none',
        }}
      >
        <div className="w-5 h-5 rounded-full bg-emerald-900/40 border border-white/30" />
      </div>
    </div>
  );
};
