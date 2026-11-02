/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { soundFX } from '../audio/SoundFX';

interface WorldMapModalProps {
  playerX: number;
  playerZ: number;
  onTeleport?: (x: number, z: number) => void;
  onClose: () => void;
}

const LANDMARKS = [
  { name: 'Bab-e-Chak 17 G (Main Gateway Arch)', urdu: 'بابِ چک نمبر 17 جی', x: -32, z: 0, zone: 'Chak 17 G', icon: '⛩️' },
  { name: 'Jamia Mosque Al-Falah', urdu: 'جامع مسجد الفلاح', x: -110, z: -45, zone: 'Chak 17 G', icon: '🕌' },
  { name: 'Karak Chai Hotel', urdu: 'کڑک چائے ہوٹل', x: -68, z: 11, zone: 'Chak 17 G', icon: '☕' },
  { name: 'Chak 17 G Govt School & Cricket Pitch', urdu: 'گورنمنٹ اسکول چک 17 جی', x: -110, z: 85, zone: 'Chak 17 G', icon: '🏏' },
  { name: 'Uncle Shakoor Dairy Pen', urdu: 'چک 17 جی مویشی باڑہ', x: -60, z: -32, zone: 'Chak 17 G', icon: '🐄' },
  { name: 'Village Tube-Well Oasis', urdu: 'چشمہ اور ٹیوب ویل', x: -50, z: -65, zone: 'Chak 17 G', icon: '💧' },
  { name: 'Canal Bridge (GT Road)', urdu: 'نہر کا پل', x: 0, z: 0, zone: 'Highway', icon: '🌉' },
  { name: 'Emerald Mega Mall', urdu: 'ایمرلڈ میگا مال', x: 90, z: 16, zone: 'City', icon: '🛍️' },
  { name: 'Jinnah Care Hospital', urdu: 'جناح کیئر ہسپتال', x: 40, z: -25, zone: 'City', icon: '🏥' },
  { name: 'Iqbal Central Urban Park', urdu: 'اقبال سینٹرل پارک', x: 90, z: 85, zone: 'City', icon: '🌳' },
];

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  playerX,
  playerZ,
  onTeleport,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border-2 border-emerald-500/50 p-6 text-white shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-wide text-emerald-400">
              MY OPEN WORLD PAKISTAN - MAP ATLAS (نقشہ)
            </h2>
            <p className="text-xs text-zinc-400">
              Explore Chak Number 17 G Village, Grand Trunk Road highway, and Gulberg Metropolis City
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold"
          >
            ✕
          </button>
        </div>

        {/* 2D Interactive Map Canvas Representation */}
        <div className="relative w-full h-80 rounded-xl bg-zinc-900 border border-emerald-900/80 overflow-hidden shadow-inner flex">
          {/* Village side (West / Left) */}
          <div className="w-1/2 h-full bg-emerald-950/60 border-r-4 border-sky-600 relative p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-emerald-400/80 tracking-wider">
              🌾 CHAK NUMBER 17 G (چک نمبر 17 جی)
            </span>
            <div className="text-[10px] text-emerald-300/60 leading-tight">
              Mud houses · Green wheat fields · Jamia Mosque · Cricket ground · Livestock
            </div>
          </div>

          {/* City side (East / Right) */}
          <div className="w-1/2 h-full bg-slate-950/80 relative p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-sky-400/80 tracking-wider text-right">
              🏙️ MODERN METROPOLIS (GULBERG)
            </span>
            <div className="text-[10px] text-sky-300/60 leading-tight text-right">
              Glass skyscrapers · Emerald Mall · Jinnah Hospital · Iqbal Urban Park · Boulevards
            </div>
          </div>

          {/* Central Canal River */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 bg-sky-500/70 border-x border-sky-300/40 flex items-center justify-center">
            <span className="text-[9px] font-bold text-sky-950 -rotate-90 whitespace-nowrap">
              CANAL WATER
            </span>
          </div>

          {/* Central GT Road bridge */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-8 bg-zinc-800/90 border-y border-amber-500/60 flex items-center justify-center">
            <span className="text-[9px] font-bold text-amber-300 tracking-widest uppercase">
              GT ROAD HIGHWAY (LAHORE ➔ ISLAMABAD)
            </span>
          </div>

          {/* Landmarks Pins */}
          {LANDMARKS.map((lm) => {
            // Map world coords (-180..180, -130..130) to percentage (0..100)
            const leftPct = ((lm.x + 180) / 360) * 100;
            const topPct = ((lm.z + 130) / 260) * 100;
            return (
              <div
                key={lm.name}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                onClick={() => {
                  if (onTeleport) {
                    soundFX.playJump();
                    onTeleport(lm.x, lm.z);
                    onClose();
                  }
                }}
              >
                <span className="text-lg drop-shadow hover:scale-125 transition-transform">
                  {lm.icon}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-emerald-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                  {lm.name}
                </span>
              </div>
            );
          })}

          {/* Player Pin */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{
              left: `${((playerX + 180) / 360) * 100}%`,
              top: `${((playerZ + 130) / 260) * 100}%`,
            }}
          >
            <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg animate-pulse" />
            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded shadow">
              YOU
            </span>
          </div>
        </div>

        {/* Landmarks Directory List */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {LANDMARKS.map((lm) => (
            <button
              key={lm.name}
              onClick={() => {
                if (onTeleport) {
                  soundFX.playJump();
                  onTeleport(lm.x, lm.z);
                  onClose();
                }
              }}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-emerald-500/70 text-left text-xs transition-colors flex flex-col gap-1"
            >
              <div className="flex items-center gap-1.5 font-bold text-zinc-100">
                <span>{lm.icon}</span>
                <span className="truncate">{lm.name}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-serif">{lm.urdu}</span>
              <span className="text-[9px] text-zinc-400">Zone: {lm.zone} · Fast Travel ➔</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
