/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CharacterCustomization,
  PlayerStats,
  WeatherType,
  VehicleType,
  Mission,
  NPCData,
} from './types/game';
import { INITIAL_MISSIONS } from './game/missions';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { WardrobeModal } from './components/WardrobeModal';
import { DialogueModal } from './components/DialogueModal';
import { MissionsModal } from './components/MissionsModal';
import { VehicleShopModal } from './components/VehicleShopModal';
import { WorldMapModal } from './components/WorldMapModal';
import { CricketModal } from './components/CricketModal';
import { soundFX } from './audio/SoundFX';

const STORAGE_KEY_CUSTOMIZATION = 'mowp_customization_v2';
const STORAGE_KEY_STATS = 'mowp_stats_v1';
const STORAGE_KEY_MISSIONS = 'mowp_missions_v1';

const DEFAULT_CUSTOMIZATION: CharacterCustomization = {
  name: 'Aliyaan Hassan',
  outfitColor: '#064e3b', // Pakistani emerald green
  outfitSecondaryColor: '#eab308', // Golden zari trim
  outfitStyle: 'classic',
  headwear: 'side_part',
  footwear: 'peshawari_chappal',
  skinTone: '#e0a97a',
  hasWatch: true,
  hasGlasses: false,
};

const DEFAULT_STATS: PlayerStats = {
  coins: 200,
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  reputation: 10,
  crescentsFound: 0,
  totalCrescents: 7,
};

export default function App() {
  // Game shell state: 'title' | 'playing' | 'paused'
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused'>('title');

  // Character Customization & Stats
  const [customization, setCustomization] = useState<CharacterCustomization>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOMIZATION);
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMIZATION;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  });

  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // Missions
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MISSIONS);
      return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
    } catch {
      return INITIAL_MISSIONS;
    }
  });
  const [activeMissionId, setActiveMissionId] = useState<string | null>('quest_milk_run');

  // Weather & Day/Night (0..24 hours)
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [gameTimeHours, setGameTimeHours] = useState<number>(9.5); // 09:30 AM Morning start

  // Modals state
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [showGarage, setShowGarage] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showCricket, setShowCricket] = useState(false);
  const [activeNPC, setActiveNPC] = useState<NPCData | null>(null);
  const [missionRewardNotification, setMissionRewardNotification] = useState<string | null>(null);

  // Synced dynamic state from WebGL physics
  const [hudState, setHudState] = useState({
    playerX: -65,
    playerZ: 15,
    playerHeading: 0,
    isDriving: false,
    vehicleType: '',
    isSitting: false,
    stamina: 100,
    maxStamina: 100,
    interactPrompt: null as string | null,
    nearVehiclePrompt: null as string | null,
  });

  // Input refs for high-frequency 60fps simulation
  const inputRef = useRef({
    forward: 0,
    strafe: 0,
    jump: false,
    sprint: false,
  });

  const actionTriggerRef = useRef<{
    interact: boolean;
    toggleVehicle: boolean;
    horn: boolean;
    spawnVehicleType: VehicleType | null;
    teleportTarget: [number, number] | null;
  }>({
    interact: false,
    toggleVehicle: false,
    horn: false,
    spawnVehicleType: null,
    teleportTarget: null,
  });

  // Auto-save progression to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMIZATION, JSON.stringify(customization));
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
      localStorage.setItem(STORAGE_KEY_MISSIONS, JSON.stringify(missions));
    } catch {
      // Ignore storage errors in sandbox
    }
  }, [customization, stats, missions]);

  // Day & Night Simulation Clock (advances time smoothly)
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setGameTimeHours((prev) => {
        const next = prev + 0.04;
        return next >= 24 ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Keyboard shortcut for Esc (Pause / Unpause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Mission completion callback
  const handleMissionProgress = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && !m.completed) {
          soundFX.playMissionComplete();
          // Award coins
          setStats((st) => ({ ...st, coins: st.coins + m.rewardCoins }));
          setMissionRewardNotification(`Mission Completed: ${m.title}! +${m.rewardCoins} Coins!`);
          setTimeout(() => setMissionRewardNotification(null), 4000);
          return { ...m, completed: true };
        }
        return m;
      })
    );
  };

  const activeMission = missions.find((m) => m.id === activeMissionId) || null;

  // Weather toggle
  const toggleWeather = () => {
    soundFX.playTalk();
    const cycle: WeatherType[] = ['sunny', 'rainy', 'cloudy', 'sunset'];
    const nextIdx = (cycle.indexOf(weather) + 1) % cycle.length;
    setWeather(cycle[nextIdx]);
  };

  // Time toggle
  const toggleTime = () => {
    soundFX.playTalk();
    // Cycle between Morning (9am), Midday (1pm), Sunset (6:30pm), Night (11pm)
    if (gameTimeHours < 12) setGameTimeHours(13.0);
    else if (gameTimeHours < 17) setGameTimeHours(18.5);
    else if (gameTimeHours < 22) setGameTimeHours(23.0);
    else setGameTimeHours(8.5);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Canvas Layer */}
      <GameCanvas
        customization={customization}
        weather={weather}
        gameTimeHours={gameTimeHours}
        activeMission={activeMission}
        onUpdateStats={setStats}
        onOpenDialogue={(npc) => setActiveNPC(npc)}
        onOpenWardrobe={() => setShowWardrobe(true)}
        onOpenCricket={() => setShowCricket(true)}
        onOpenMap={() => setShowMap(true)}
        onMissionProgress={handleMissionProgress}
        onSyncState={setHudState}
        inputRef={inputRef}
        actionTriggerRef={actionTriggerRef}
      />

      {/* ========================================================= */}
      {/* 1. TITLE SCREEN (Atmospheric live world background) */}
      {/* ========================================================= */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-t from-black/90 via-black/45 to-transparent backdrop-blur-none text-white pointer-events-auto">
          {/* Top Title Lockup & Emblem */}
          <div className="flex flex-col items-center gap-2 mt-4 text-center">
            {/* Bespoke Pakistani Crescent & Star Emblem */}
            <div className="w-16 h-16 rounded-full bg-emerald-950/90 border-2 border-emerald-400/80 shadow-2xl flex items-center justify-center text-3xl">
              🌙
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-emerald-400 drop-shadow-lg uppercase">
              MY OPEN WORLD PAKISTAN
            </h1>
            <p className="text-base sm:text-xl font-bold text-emerald-400 font-serif tracking-wider">
              علیان حسن · چک نمبر 17 جی
            </p>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mt-1 font-medium">
              3D Open World Adventure · Starring Aliyaan Hassan in Chak No. 17 G
            </p>
          </div>

          {/* Center Feature Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl text-xs font-semibold text-zinc-200">
            <span className="px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
              🌾 Chak 17 G Village & Jamia Mosque
            </span>
            <span className="px-3 py-1.5 rounded-full bg-slate-950/80 border border-sky-500/40">
              🏙️ Modern City & Skyscrapers
            </span>
            <span className="px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40">
              🛺 Drive Truck Art Rickshaws & Cars
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40">
              👕 Pakistani Shalwar Kameez Boutique
            </span>
          </div>

          {/* Primary CTA & Controls Hint */}
          <div className="flex flex-col items-center gap-4 mb-2 w-full max-w-sm">
            <button
              onClick={() => {
                soundFX.playJump();
                setGameState('playing');
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base uppercase tracking-widest shadow-2xl active:scale-95 transition-all border border-emerald-300/50"
            >
              START ADVENTURE (کھیل شروع کریں)
            </button>

            {/* Flat Single Control-Hint Line */}
            <p className="text-[11px] text-zinc-400 font-medium tracking-wide text-center">
              E / W / Joystick Move · Space Jump · E Interact · F Drive · Esc Pause
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PLAYING HUD OVERLAY */}
      {/* ========================================================= */}
      {gameState === 'playing' && (
        <GameHUD
          stats={stats}
          weather={weather}
          gameTimeHours={gameTimeHours}
          activeMission={activeMission}
          playerX={hudState.playerX}
          playerZ={hudState.playerZ}
          playerHeading={hudState.playerHeading}
          isDriving={hudState.isDriving}
          vehicleType={hudState.vehicleType}
          isSitting={hudState.isSitting}
          stamina={hudState.stamina}
          maxStamina={hudState.maxStamina}
          interactPrompt={hudState.interactPrompt}
          nearVehiclePrompt={hudState.nearVehiclePrompt}
          onMoveInput={(val) => {
            inputRef.current.forward = val.forward;
            inputRef.current.strafe = val.strafe;
          }}
          onJumpPress={() => {
            inputRef.current.jump = true;
            setTimeout(() => {
              inputRef.current.jump = false;
            }, 120);
          }}
          onSprintToggle={(sprinting) => {
            inputRef.current.sprint = sprinting;
          }}
          onInteractPress={() => {
            actionTriggerRef.current.interact = true;
          }}
          onVehicleTogglePress={() => {
            actionTriggerRef.current.toggleVehicle = true;
          }}
          onHornPress={() => {
            actionTriggerRef.current.horn = true;
          }}
          onOpenWardrobe={() => setShowWardrobe(true)}
          onOpenMissions={() => setShowMissions(true)}
          onOpenGarage={() => setShowGarage(true)}
          onOpenMap={() => setShowMap(true)}
          onToggleWeather={toggleWeather}
          onToggleTime={toggleTime}
        />
      )}

      {/* Mission Reward Banner Notification */}
      {missionRewardNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-amber-500 text-black font-black text-sm uppercase tracking-wider shadow-2xl animate-bounce">
          🎉 {missionRewardNotification}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PAUSE MENU MODAL */}
      {/* ========================================================= */}
      {gameState === 'paused' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-emerald-500/40 p-6 text-white shadow-2xl flex flex-col gap-4 text-center">
            <h3 className="text-xl font-bold tracking-wide text-emerald-400">GAME PAUSED</h3>
            <p className="text-xs text-zinc-400">
              Progress auto-saved in local storage. Ready to resume?
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs uppercase tracking-wider shadow"
              >
                Resume Game
              </button>
              <button
                onClick={() => setShowWardrobe(true)}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 font-bold text-zinc-200 text-xs uppercase tracking-wider border border-zinc-700 shadow"
              >
                Wardrobe / Clothes
              </button>
              <button
                onClick={() => setShowMap(true)}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 font-bold text-zinc-200 text-xs uppercase tracking-wider border border-zinc-700 shadow"
              >
                View Map Atlas
              </button>
              <button
                onClick={() => setGameState('title')}
                className="w-full py-3 rounded-xl bg-red-950/80 hover:bg-red-900/80 text-red-300 font-bold text-xs uppercase tracking-wider border border-red-800/60 shadow"
              >
                Quit to Title
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. INTERACTIVE MODALS */}
      {/* ========================================================= */}
      {showWardrobe && (
        <WardrobeModal
          customization={customization}
          stats={stats}
          onUpdateCustomization={setCustomization}
          onClose={() => setShowWardrobe(false)}
        />
      )}

      {showMissions && (
        <MissionsModal
          missions={missions}
          activeMissionId={activeMissionId}
          onSelectMission={(id) => setActiveMissionId(id)}
          onClose={() => setShowMissions(false)}
        />
      )}

      {showGarage && (
        <VehicleShopModal
          onSpawnVehicle={(type) => {
            actionTriggerRef.current.spawnVehicleType = type;
          }}
          onClose={() => setShowGarage(false)}
        />
      )}

      {showMap && (
        <WorldMapModal
          playerX={hudState.playerX}
          playerZ={hudState.playerZ}
          onTeleport={(tx, tz) => {
            actionTriggerRef.current.teleportTarget = [tx, tz];
          }}
          onClose={() => setShowMap(false)}
        />
      )}

      {activeNPC && (
        <DialogueModal
          npc={activeNPC}
          activeMission={activeMission}
          onAcceptMission={(questId) => {
            setActiveMissionId(questId);
          }}
          onClose={() => setActiveNPC(null)}
        />
      )}

      {showCricket && (
        <CricketModal
          onEarnCoins={(amount) => {
            setStats((s) => ({ ...s, coins: s.coins + amount }));
            setMissionRewardNotification(`Cricket Match Finished! +${amount} Coins!`);
            setTimeout(() => setMissionRewardNotification(null), 4000);
          }}
          onClose={() => setShowCricket(false)}
        />
      )}
    </div>
  );
}
