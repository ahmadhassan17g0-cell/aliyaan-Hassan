/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CharacterCustomization, PlayerStats } from '../types/game';
import { soundFX } from '../audio/SoundFX';

interface WardrobeModalProps {
  customization: CharacterCustomization;
  stats: PlayerStats;
  onUpdateCustomization: (c: CharacterCustomization) => void;
  onClose: () => void;
}

const OUTFIT_COLORS = [
  { name: 'Emerald Green', hex: '#064e3b', secondary: '#eab308' },
  { name: 'Pearl White', hex: '#f8fafc', secondary: '#cbd5e1' },
  { name: 'Royal Indigo', hex: '#1e3a8a', secondary: '#93c5fd' },
  { name: 'Desert Khaki', hex: '#a16207', secondary: '#fef08a' },
  { name: 'Crimson Velvet', hex: '#881337', secondary: '#fcd34d' },
  { name: 'Charcoal Black', hex: '#18181b', secondary: '#e2e8f0' },
];

const HEADWEAR_OPTIONS = [
  { id: 'side_part', name: 'Youth Side-Part Hair', icon: '👦' },
  { id: 'curly_fade', name: 'Modern Curly Fade', icon: '✨' },
  { id: 'sindhi_topi', name: 'Traditional Sindhi Topi', icon: '👑' },
  { id: 'chitrali_pakol', name: 'Chitrali Woolen Pakol', icon: '🧢' },
  { id: 'eid_turban', name: 'Festive Eid Kulla / Turban', icon: '🌟' },
];

const FOOTWEAR_OPTIONS = [
  { id: 'peshawari_chappal', name: 'Peshawari Chappal (Leather)', icon: '👡' },
  { id: 'khussa', name: 'Handcrafted Punjabi Khussa', icon: '👞' },
  { id: 'sports_sneakers', name: 'City Athletic Sneakers', icon: '👟' },
];

export const WardrobeModal: React.FC<WardrobeModalProps> = ({
  customization,
  stats,
  onUpdateCustomization,
  onClose,
}) => {
  const handleColorChange = (hex: string, sec: string) => {
    soundFX.playTalk();
    onUpdateCustomization({
      ...customization,
      outfitColor: hex,
      outfitSecondaryColor: sec,
    });
  };

  const handleHeadwearChange = (headwear: CharacterCustomization['headwear']) => {
    soundFX.playTalk();
    onUpdateCustomization({
      ...customization,
      headwear,
    });
  };

  const handleFootwearChange = (footwear: CharacterCustomization['footwear']) => {
    soundFX.playTalk();
    onUpdateCustomization({
      ...customization,
      footwear,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 pointer-events-auto">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-emerald-500/40 p-6 text-white shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-wide text-emerald-400">
              PAKISTANI WARDROBE & BOUTIQUE
            </h2>
            <p className="text-xs text-zinc-400">
              Customize Aliyaan Hassan’s Shalwar Kameez, headwear & style
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50">
            <span className="text-amber-400 font-bold text-sm">🪙 {stats.coins}</span>
          </div>
        </div>

        {/* 1. Shalwar Kameez Colors */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Shalwar Kameez Color (روایتی شلوار قمیص)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {OUTFIT_COLORS.map((col) => {
              const active = customization.outfitColor === col.hex;
              return (
                <button
                  key={col.hex}
                  onClick={() => handleColorChange(col.hex, col.secondary)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    active
                      ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-500/40'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-white/30 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span className="truncate">{col.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Headwear & Hairstyles */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Headwear & Hairstyle (ٹوپی اور پگڑی)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {HEADWEAR_OPTIONS.map((opt) => {
              const active = customization.headwear === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleHeadwearChange(opt.id as CharacterCustomization['headwear'])}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all ${
                    active
                      ? 'border-emerald-400 bg-emerald-950/80 font-bold text-emerald-200 ring-2 ring-emerald-500/40'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  <span className="truncate">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Footwear */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Footwear (پشاوری چپل اور جوتے)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FOOTWEAR_OPTIONS.map((f) => {
              const active = customization.footwear === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleFootwearChange(f.id as CharacterCustomization['footwear'])}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center text-xs transition-all ${
                    active
                      ? 'border-emerald-400 bg-emerald-950/80 font-bold text-emerald-200 ring-2 ring-emerald-500/40'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-[11px] leading-tight">{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Accessories */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={customization.hasWatch}
                onChange={(e) => {
                  soundFX.playTalk();
                  onUpdateCustomization({ ...customization, hasWatch: e.target.checked });
                }}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Gold Wristwatch ⌚</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={customization.hasGlasses}
                onChange={(e) => {
                  soundFX.playTalk();
                  onUpdateCustomization({ ...customization, hasGlasses: e.target.checked });
                }}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Classic Glasses 👓</span>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundFX.playCoin();
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white tracking-wide shadow-lg transition-transform active:scale-95"
        >
          CONFIRM & WEAR OUTFIT
        </button>
      </div>
    </div>
  );
};
