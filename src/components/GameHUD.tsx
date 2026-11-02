/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerStats, WeatherType, Mission } from '../types/game';
import { TouchJoystick } from './TouchJoystick';
import { Minimap } from './Minimap';
import { soundFX } from '../audio/SoundFX';

interface GameHUDProps {
  stats: PlayerStats;
  weather: WeatherType;
  gameTimeHours: number; // 0..24
  activeMission: Mission | null;
  playerX: number;
  playerZ: number;
  playerHeading: number;
  isDriving: boolean;
  vehicleType: string;
  isSitting: boolean;
  stamina: number;
  maxStamina: number;
  interactPrompt: string | null;
  nearVehiclePrompt: string | null;
  onMoveInput: (val: { forward: number; strafe: number }) => void;
  onJumpPress: () => void;
  onSprintToggle: (sprinting: boolean) => void;
  onInteractPress: () => void;
  onVehicleTogglePress: () => void;
  onHornPress: () => void;
  onOpenWardrobe: () => void;
  onOpenMissions: () => void;
  onOpenGarage: () => void;
  onOpenMap: () => void;
  onToggleWeather: () => void;
  onToggleTime: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  weather,
  gameTimeHours,
  activeMission,
  playerX,
  playerZ,
  playerHeading,
  isDriving,
  vehicleType,
  isSitting,
  stamina,
  maxStamina,
  interactPrompt,
  nearVehiclePrompt,
  onMoveInput,
  onJumpPress,
  onSprintToggle,
  onInteractPress,
  onVehicleTogglePress,
  onHornPress,
  onOpenWardrobe,
  onOpenMissions,
  onOpenGarage,
  onOpenMap,
  onToggleWeather,
  onToggleTime,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [isSprintingState, setIsSprintingState] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFX.getMuted());

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m < 10 ? '0' : ''}${m} ${period}`;
  };

  const getTimePeriodName = (h: number) => {
    if (h >= 5 && h < 8) return 'Dawn (صوبہ)';
    if (h >= 8 && h < 17) return 'Day (دن)';
    if (h >= 17 && h < 20) return 'Dusk (شام)';
    return 'Night (رات)';
  };

  const handleSprintClick = () => {
    const next = !isSprintingState;
    setIsSprintingState(next);
    onSprintToggle(next);
  };

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundFX.setMuted(next);
  };

  // If in photo mode, show only a tiny restore button
  if (isPhotoMode) {
    return (
      <div className="absolute inset-0 pointer-events-none z-40">
        <button
          onClick={() => setIsPhotoMode(false)}
          className="absolute top-4 right-4 pointer-events-auto px-4 py-2 rounded-xl bg-black/70 border border-emerald-500/50 text-white font-bold text-xs uppercase tracking-wider shadow-xl active:scale-95"
        >
          📷 Exit Photo Mode
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-4 overflow-hidden">
      {/* ==================================================== */}
      {/* TOP PERIMETER: STATUS CLUSTERS & COMPASS RADAR */}
      {/* ==================================================== */}
      <div className="w-full flex items-start justify-between">
        {/* Top-Left Status Cluster */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Game Brand & Location Readout */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/85 border border-emerald-500/40 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black tracking-wider text-emerald-400 uppercase">
                ALIYAAN HASSAN · OPEN WORLD
              </span>
              <span className="text-[9px] text-zinc-300 font-medium">
                {playerX < 0 ? '🌾 Chak Number 17 G' : '🏙️ Gulberg Metropolis'}
              </span>
            </div>
          </div>

          {/* Time, Weather & Wallet Bar */}
          <div className="flex items-center gap-2">
            {/* Clock & Weather Pill */}
            <button
              onClick={onToggleTime}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950/85 border border-zinc-800 text-[11px] text-zinc-200 font-semibold shadow hover:border-emerald-500/50"
              title="Click to cycle time of day"
            >
              <span>🕒</span>
              <span className="tabular-nums font-mono">{formatTime(gameTimeHours)}</span>
              <span className="text-[10px] text-zinc-400">({getTimePeriodName(gameTimeHours)})</span>
            </button>

            {/* Weather Toggle */}
            <button
              onClick={onToggleWeather}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-950/85 border border-zinc-800 text-[11px] text-zinc-200 font-semibold shadow hover:border-emerald-500/50 uppercase"
              title="Click to change weather"
            >
              <span>{weather === 'rainy' ? '🌧️' : weather === 'cloudy' ? '☁️' : '☀️'}</span>
              <span>{weather}</span>
            </button>

            {/* Coin Wallet */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-[11px] font-bold text-amber-300 shadow">
              <span>🪙</span>
              <span className="tabular-nums">{stats.coins}</span>
            </div>

            {/* Crescents Collected */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-[11px] font-bold text-emerald-300 shadow">
              <span>🌙</span>
              <span className="tabular-nums">{stats.crescentsFound}/7</span>
            </div>
          </div>

          {/* Stamina Bar */}
          <div className="w-48 h-2 rounded-full bg-zinc-900/90 border border-emerald-950 overflow-hidden shadow-inner mt-0.5">
            <div
              className={`h-full transition-all duration-150 ${
                stamina < 20 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${(stamina / maxStamina) * 100}%` }}
            />
          </div>
        </div>

        {/* Top-Center Active Mission Banner */}
        {activeMission && !activeMission.completed && (
          <div
            onClick={onOpenMissions}
            className="hidden sm:flex flex-col items-center px-4 py-2 rounded-xl bg-zinc-950/90 border border-amber-500/60 shadow-xl pointer-events-auto cursor-pointer max-w-sm text-center"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              ACTIVE MISSION · {activeMission.title}
            </span>
            <span className="text-[11px] text-zinc-200 line-clamp-1">{activeMission.hint}</span>
          </div>
        )}

        {/* Top-Right Perimeter: Minimap & Quick Toggles */}
        <div className="flex items-start gap-2">
          {/* Audio & Photo Mode Buttons */}
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            <button
              onClick={handleMuteToggle}
              className="w-8 h-8 rounded-full bg-zinc-950/85 border border-zinc-800 text-zinc-200 text-xs flex items-center justify-center shadow hover:border-emerald-500/50"
              title="Toggle sound"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={() => setIsPhotoMode(true)}
              className="w-8 h-8 rounded-full bg-zinc-950/85 border border-zinc-800 text-zinc-200 text-xs flex items-center justify-center shadow hover:border-emerald-500/50"
              title="Enter Photo Mode"
            >
              📷
            </button>
          </div>

          {/* Circular Minimap Radar */}
          <Minimap
            playerX={playerX}
            playerZ={playerZ}
            playerHeading={playerHeading}
            activeMission={activeMission}
            onOpenMapModal={onOpenMap}
          />
        </div>
      </div>

      {/* ==================================================== */}
      {/* BOTTOM PERIMETER: JOYSTICK, ACTIONS & COLLAPSIBLE DOCK */}
      {/* ==================================================== */}
      <div className="w-full flex items-end justify-between">
        {/* Left: Floating Virtual Joystick */}
        <div className="pointer-events-auto">
          <TouchJoystick onMove={onMoveInput} radius={55} />
        </div>

        {/* Center: Collapsible Unified Control Dock (Three.js Directive) */}
        <div className="flex flex-col items-center pointer-events-auto max-w-[50vw]">
          <button
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="px-3 py-1 rounded-t-lg bg-zinc-950/85 border-t border-x border-emerald-500/40 text-[10px] font-bold text-emerald-400 uppercase tracking-wider shadow"
          >
            {isDockCollapsed ? '▴ Show Menu' : '▾ Hide Menu'}
          </button>

          {!isDockCollapsed && (
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-zinc-950/90 border border-emerald-500/40 shadow-2xl overflow-x-auto max-w-full">
              <button
                onClick={onOpenMissions}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950 text-xs font-semibold text-zinc-200 border border-zinc-800 hover:border-emerald-500/50 whitespace-nowrap"
              >
                <span>📜</span>
                <span>Missions</span>
              </button>

              <button
                onClick={onOpenWardrobe}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950 text-xs font-semibold text-zinc-200 border border-zinc-800 hover:border-emerald-500/50 whitespace-nowrap"
              >
                <span>👕</span>
                <span>Wardrobe</span>
              </button>

              <button
                onClick={onOpenGarage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950 text-xs font-semibold text-zinc-200 border border-zinc-800 hover:border-emerald-500/50 whitespace-nowrap"
              >
                <span>🚗</span>
                <span>Vehicles</span>
              </button>

              <button
                onClick={onOpenMap}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-emerald-950 text-xs font-semibold text-zinc-200 border border-zinc-800 hover:border-emerald-500/50 whitespace-nowrap"
              >
                <span>🗺️</span>
                <span>Map Atlas</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Action Buttons Cluster */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Context-Sensitive Interaction Button (Talk / Ride / Sit / Shop) */}
          {(interactPrompt || nearVehiclePrompt) && (
            <button
              onClick={() => {
                if (nearVehiclePrompt) onVehicleTogglePress();
                else onInteractPress();
              }}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 font-black text-black text-xs uppercase tracking-wider shadow-2xl animate-bounce active:scale-95 transition-transform flex items-center gap-2"
            >
              <span>⚡</span>
              <span>{nearVehiclePrompt || interactPrompt}</span>
            </button>
          )}

          {/* If Driving: Horn & Exit buttons */}
          {isDriving ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onHornPress}
                className="w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-500 border-2 border-amber-300/60 shadow-xl flex items-center justify-center text-xl text-black font-black active:scale-95"
                title="Honk Horn"
              >
                📢
              </button>
              <button
                onClick={onVehicleTogglePress}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-2 border-red-300/60 shadow-xl flex flex-col items-center justify-center text-white font-bold text-[10px] active:scale-95"
                title="Exit Vehicle"
              >
                <span className="text-xl">🚪</span>
                <span>EXIT</span>
              </button>
            </div>
          ) : (
            /* On Foot: Jump & Sprint cluster */
            <div className="flex items-center gap-3">
              {/* Dedicated E Button (Requested: change boutan wki gaga ekar do) */}
              <button
                onTouchStart={() => {
                  onMoveInput({ forward: 1.0, strafe: 0 });
                  onInteractPress();
                }}
                onTouchEnd={() => {
                  onMoveInput({ forward: 0, strafe: 0 });
                }}
                onMouseDown={() => {
                  onMoveInput({ forward: 1.0, strafe: 0 });
                  onInteractPress();
                }}
                onMouseUp={() => {
                  onMoveInput({ forward: 0, strafe: 0 });
                }}
                className="w-14 h-14 rounded-full bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-300/80 shadow-2xl flex flex-col items-center justify-center text-white active:scale-95 transition-transform"
                title="E Button: Walk/Drive Forward & Interact"
              >
                <span className="text-xl font-black font-mono">E</span>
                <span className="text-[8px] font-bold tracking-tighter uppercase">MOVE</span>
              </button>

              {/* Sprint Toggle */}
              <button
                onClick={handleSprintClick}
                className={`w-14 h-14 rounded-full border-2 shadow-xl flex flex-col items-center justify-center font-bold text-[10px] active:scale-95 transition-colors ${
                  isSprintingState
                    ? 'bg-amber-500 text-black border-amber-300'
                    : 'bg-zinc-950/80 text-zinc-300 border-zinc-700'
                }`}
                title="Sprint (Shift)"
              >
                <span className="text-lg">🏃</span>
                <span>RUN</span>
              </button>

              {/* Jump Button */}
              <button
                onClick={onJumpPress}
                className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 border-2 border-emerald-300/60 shadow-2xl flex flex-col items-center justify-center text-white font-black text-[11px] active:scale-95 transition-transform"
                title="Jump (Space)"
              >
                <span className="text-2xl">⬆</span>
                <span>JUMP</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
