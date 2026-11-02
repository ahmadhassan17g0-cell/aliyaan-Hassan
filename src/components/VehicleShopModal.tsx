/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VehicleType } from '../types/game';
import { soundFX } from '../audio/SoundFX';

interface VehicleShopModalProps {
  onSpawnVehicle: (type: VehicleType) => void;
  onClose: () => void;
}

const VEHICLE_CATALOG = [
  {
    type: 'rickshaw' as VehicleType,
    name: 'Pakistani Truck Art Auto-Rickshaw',
    urdu: 'روایتی آٹو رکشہ / چنگچی',
    icon: '🛺',
    desc: 'Iconic 3-wheeler decorated with vibrant peacock truck art, Pakistani flags & loud horn!',
    topSpeed: '60 km/h',
    handling: 'Sharp 3-Wheel Turn',
  },
  {
    type: 'car' as VehicleType,
    name: 'Realistic Sports Sedan (Chak 17 G Edition)',
    urdu: 'حقیقی اسپورٹس کار',
    icon: '🏎️',
    desc: 'Ultra-realistic modern sports sedan with clearcoat paint, alloy twin-spoke wheels, red Brembo calipers, dual exhaust, rear spoiler & Xenon LED lights!',
    topSpeed: '160 km/h',
    handling: 'Precision 4-Wheel Drive & Drift',
  },
  {
    type: 'motorcycle' as VehicleType,
    name: 'Roadster Heavy Motorbike',
    urdu: 'موٹر سائیکل / ہیوی بائیک',
    icon: '🏍️',
    desc: 'Agile 70cc / sport bike. Leans dynamically into tight curves and zips through traffic.',
    topSpeed: '100 km/h',
    handling: 'High Agility & Lean',
  },
  {
    type: 'bicycle' as VehicleType,
    name: 'Village Sports Bicycle',
    urdu: 'گاؤں کی اسپورٹس سائیکل',
    icon: '🚲',
    desc: 'Classic pedal bicycle for relaxing rides through village wheat & mustard fields.',
    topSpeed: '30 km/h',
    handling: 'Eco-friendly Pedal',
  },
];

export const VehicleShopModal: React.FC<VehicleShopModalProps> = ({
  onSpawnVehicle,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 pointer-events-auto">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-950 border border-emerald-500/40 p-6 text-white shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-wide text-emerald-400">
              VEHICLE GARAGE (گاڑیاں اور موٹر سائیکل)
            </h2>
            <p className="text-xs text-zinc-400">
              Select any vehicle to spawn next to your character
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VEHICLE_CATALOG.map((v) => (
            <div
              key={v.type}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-emerald-500/60 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{v.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">{v.name}</h4>
                    <span className="text-[11px] text-emerald-400 font-serif">{v.urdu}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">{v.desc}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-300 pt-2 border-t border-zinc-800">
                <span className="text-amber-400 font-semibold">⚡ {v.topSpeed}</span>
                <button
                  onClick={() => {
                    soundFX.playHorn(v.type as 'car' | 'rickshaw' | 'bike');
                    onSpawnVehicle(v.type);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow active:scale-95 transition-transform"
                >
                  Spawn & Drive
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
