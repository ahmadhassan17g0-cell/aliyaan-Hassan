/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Mission } from '../types/game';

interface MinimapProps {
  playerX: number;
  playerZ: number;
  playerHeading: number;
  activeMission: Mission | null;
  onOpenMapModal: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  playerX,
  playerZ,
  playerHeading,
  activeMission,
  onOpenMapModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const center = w / 2;
    const zoom = 0.55; // pixels per world meter

    ctx.clearRect(0, 0, w, h);

    // Save for clipping to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.clip();

    // Background base
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Coordinate transform: center on player
    ctx.save();
    ctx.translate(center, center);

    // World map elements relative to player
    const toMapX = (wx: number) => (wx - playerX) * zoom;
    const toMapY = (wz: number) => (wz - playerZ) * zoom;

    // 1. Village Green Field area (X < -20)
    ctx.fillStyle = '#14532d';
    ctx.fillRect(toMapX(-180), toMapY(-130), 160 * zoom, 260 * zoom);

    // 2. City Pavement area (X > 20)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(toMapX(20), toMapY(-130), 160 * zoom, 260 * zoom);

    // 3. Canal Water (X: -20 to 20)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(toMapX(-12), toMapY(-130), 24 * zoom, 260 * zoom);

    // 4. GT Road Highway (Horizontal along Z=0)
    ctx.fillStyle = '#334155';
    ctx.fillRect(toMapX(-180), toMapY(-6), 360 * zoom, 12 * zoom);

    // City Boulevards
    ctx.fillRect(toMapX(58), toMapY(-130), 14 * zoom, 260 * zoom);
    ctx.fillRect(toMapX(108), toMapY(-130), 14 * zoom, 260 * zoom);

    // Village Mosque landmark
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(toMapX(-110), toMapY(-45), 7, 0, Math.PI * 2);
    ctx.fill();

    // City Mall landmark
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(toMapX(75), toMapY(-12), 24 * zoom, 24 * zoom);

    // Active Mission Waypoint Marker
    if (activeMission && !activeMission.completed) {
      const mx = toMapX(activeMission.targetPosition[0]);
      const my = toMapY(activeMission.targetPosition[2]);

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.fill();

      // Waypoint pulsating ring
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(mx, my, 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Draw Player cursor at center (always facing forward relative to camera or heading)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(playerHeading);

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    ctx.restore();

    // Outer metal compass bezel with West on top
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center, center, center - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal direction text (West on top facing Chak 17 G)
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', center, 10);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 8px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('E', center, h - 10);
    ctx.fillText('S', 10, center);
    ctx.fillText('N', w - 10, center);
  }, [playerX, playerZ, playerHeading, activeMission]);

  // Distance to active objective
  const objectiveDistance = activeMission
    ? Math.round(
        Math.hypot(
          playerX - activeMission.targetPosition[0],
          playerZ - activeMission.targetPosition[2]
        )
      )
    : null;

  return (
    <div
      onClick={onOpenMapModal}
      className="relative flex flex-col items-center cursor-pointer pointer-events-auto select-none"
      title="Click to view full Open World Map"
    >
      <div className="relative w-28 h-28 rounded-full shadow-2xl bg-black/60 border border-emerald-500/40 overflow-hidden">
        <canvas ref={canvasRef} width={112} height={112} className="w-full h-full block" />
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-emerald-400 drop-shadow whitespace-nowrap">
          MAP 17 G
        </span>
      </div>
      {objectiveDistance !== null && (
        <div className="mt-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-semibold text-amber-300 tabular-nums">
          {objectiveDistance}m to Goal
        </div>
      )}
    </div>
  );
};
