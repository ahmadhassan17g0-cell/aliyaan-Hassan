/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mission } from '../types/game';
import { soundFX } from '../audio/SoundFX';

interface MissionsModalProps {
  missions: Mission[];
  activeMissionId: string | null;
  onSelectMission: (missionId: string) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  activeMissionId,
  onSelectMission,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 pointer-events-auto">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-emerald-500/40 p-6 text-white shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-wide text-emerald-400">
              OPEN WORLD MISSIONS (مشن اور چیلنجز)
            </h2>
            <p className="text-xs text-zinc-400">
              Complete village adventures, driving tasks & explore Pakistan
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Missions List */}
        <div className="flex flex-col gap-3">
          {missions.map((m) => {
            const isActive = activeMissionId === m.id;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${
                  m.completed
                    ? 'border-emerald-800/50 bg-emerald-950/20 opacity-80'
                    : isActive
                    ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/50'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {m.category === 'driving' ? '🚗' : m.category === 'exploration' ? '🧭' : '🌾'}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-100">{m.title}</h4>
                    <span className="text-xs text-emerald-400 font-serif">({m.urduTitle})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                      +{m.rewardCoins} 🪙
                    </span>
                    {m.completed && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        ✓ Done
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">{m.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="italic">💡 {m.hint}</span>

                  {!m.completed && (
                    <button
                      onClick={() => {
                        soundFX.playTalk();
                        onSelectMission(m.id);
                        onClose();
                      }}
                      className={`px-3 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-transform active:scale-95 ${
                        isActive
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {isActive ? 'Tracking' : 'Track Objective'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
