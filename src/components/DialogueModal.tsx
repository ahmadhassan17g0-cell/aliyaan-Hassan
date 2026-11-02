/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NPCData, Mission } from '../types/game';
import { soundFX } from '../audio/SoundFX';

interface DialogueModalProps {
  npc: NPCData;
  activeMission: Mission | null;
  onAcceptMission: (missionId: string) => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  activeMission,
  onAcceptMission,
  onClose,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const handleNext = () => {
    soundFX.playTalk();
    if (currentLineIndex < npc.dialogue.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleAcceptQuest = () => {
    if (npc.questId) {
      soundFX.playMissionComplete();
      onAcceptMission(npc.questId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8 bg-black/60 pointer-events-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-950/95 border-2 border-emerald-500/50 p-6 text-white shadow-2xl flex flex-col gap-4">
        {/* NPC Profile Header */}
        <div className="flex items-center gap-3 border-b border-emerald-900/60 pb-3">
          <div
            className="w-12 h-12 rounded-full border-2 border-emerald-400 flex items-center justify-center text-xl shadow"
            style={{ backgroundColor: npc.avatarColor }}
          >
            🧔
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-300">{npc.name}</h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-medium">
                {npc.role}
              </span>
              <span>📍 {npc.location}</span>
            </div>
          </div>
        </div>

        {/* Speech Text */}
        <div className="min-h-[70px] flex items-center">
          <p className="text-base text-zinc-100 leading-relaxed font-medium">
            "{npc.dialogue[currentLineIndex]}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            {npc.questId && (!activeMission || activeMission.id !== npc.questId) && (
              <button
                onClick={handleAcceptQuest}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs text-black uppercase tracking-wider shadow active:scale-95 transition-transform"
              >
                📜 Accept Mission
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-transform"
            >
              {currentLineIndex < npc.dialogue.length - 1 ? 'Next ➔' : 'Khuda Hafiz (Goodbye)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
