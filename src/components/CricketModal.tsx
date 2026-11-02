/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { soundFX } from '../audio/SoundFX';

interface CricketModalProps {
  onEarnCoins: (amount: number) => void;
  onClose: () => void;
}

export const CricketModal: React.FC<CricketModalProps> = ({
  onEarnCoins,
  onClose,
}) => {
  const [ballsRemaining, setBallsRemaining] = useState(6);
  const [totalScore, setTotalScore] = useState(0);
  const [lastShotText, setLastShotText] = useState('Get ready to bat!');
  const [isBowling, setIsBowling] = useState(false);
  const [timingSweetSpot, setTimingSweetSpot] = useState(0.5);
  const [indicatorPos, setIndicatorPos] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const animRef = useRef<number | null>(null);
  const bowlStartTime = useRef<number>(0);

  // Start ball delivery
  const startNextBall = () => {
    if (ballsRemaining <= 0) {
      setIsFinished(true);
      return;
    }
    setIsBowling(true);
    setLastShotText('Bowler running in... Watch the ball!');
    setTimingSweetSpot(0.4 + Math.random() * 0.3); // between 40% and 70%
    bowlStartTime.current = performance.now();

    const speed = 1100 + Math.random() * 400; // 1.1s - 1.5s delivery time

    const updateBall = (now: number) => {
      const elapsed = now - bowlStartTime.current;
      const progress = elapsed / speed;

      if (progress >= 1.0) {
        // Missed / Bowled!
        setIndicatorPos(1.0);
        setIsBowling(false);
        soundFX.playCricketHit(false);
        setLastShotText('Dot Ball! Beaten by pace!');
        setBallsRemaining((b) => {
          const next = b - 1;
          if (next <= 0) setIsFinished(true);
          return next;
        });
      } else {
        setIndicatorPos(progress);
        animRef.current = requestAnimationFrame(updateBall);
      }
    };

    animRef.current = requestAnimationFrame(updateBall);
  };

  useEffect(() => {
    startNextBall();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Swing Bat
  const handleSwing = () => {
    if (!isBowling) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsBowling(false);

    const diff = Math.abs(indicatorPos - timingSweetSpot);

    let runs = 0;
    let text = '';
    let isSix = false;

    if (diff < 0.06) {
      // Perfect timing: SIX!
      runs = 6;
      text = '🚀 OUT OF THE GROUND! MASSIVE SIX OVER THE BANYAN TREE!';
      isSix = true;
    } else if (diff < 0.12) {
      // Great timing: FOUR!
      runs = 4;
      text = '⚡ CRACKING SHOT! FOUR RUNS TO THE BOUNDARY!';
      isSix = false;
    } else if (diff < 0.20) {
      runs = 2;
      text = '🏃 Nicely placed in the gap! Quick 2 runs!';
    } else if (diff < 0.30) {
      runs = 1;
      text = '👍 Pushed to mid-off for a single (1 run).';
    } else {
      runs = 0;
      text = '❌ Swing and a miss! Beaten outside off-stump.';
    }

    soundFX.playCricketHit(isSix);
    setLastShotText(text);
    setTotalScore((s) => s + runs);

    const nextBalls = ballsRemaining - 1;
    setBallsRemaining(nextBalls);

    if (nextBalls <= 0) {
      setTimeout(() => {
        setIsFinished(true);
      }, 1200);
    }
  };

  const handleFinishMatch = () => {
    const earned = totalScore * 10;
    soundFX.playMissionComplete();
    onEarnCoins(earned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 pointer-events-auto">
      <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border-2 border-emerald-500/50 p-6 text-white shadow-2xl flex flex-col gap-5 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
          <div className="text-left">
            <h2 className="text-lg font-black tracking-wide text-emerald-400">
              VILLAGE TAP-BALL CRICKET (ٹیپ بال کرکٹ)
            </h2>
            <p className="text-xs text-zinc-400">Chak Number 17 G Village School Match · Starring Aliyaan Hassan</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500/50 text-amber-300 font-bold text-sm tabular-nums">
              Score: {totalScore}
            </span>
          </div>
        </div>

        {/* Pitch Display & Delivery Timing Bar */}
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span>Balls Left: {ballsRemaining}/6</span>
            <span className="font-bold text-amber-400">{lastShotText}</span>
          </div>

          {/* Timing Bar */}
          <div className="relative w-full h-8 rounded-lg bg-zinc-950 border border-zinc-700 overflow-hidden flex items-center">
            {/* Sweet Spot Zone */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-500/50 border-x-2 border-emerald-400"
              style={{
                left: `${(timingSweetSpot - 0.08) * 100}%`,
                width: '16%',
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                PERFECT
              </span>
            </div>

            {/* Ball Indicator Cursor */}
            <div
              className="absolute top-1 bottom-1 w-4 rounded-full bg-red-500 border border-white shadow-lg transition-none"
              style={{
                left: `calc(${indicatorPos * 100}% - 8px)`,
              }}
            />
          </div>

          <p className="text-[11px] text-zinc-400">
            Tap <strong className="text-emerald-300">SWING BAT</strong> right when the red ball reaches the green sweet spot!
          </p>
        </div>

        {/* Controls */}
        {!isFinished ? (
          <div className="flex items-center gap-3">
            {isBowling ? (
              <button
                onClick={handleSwing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-base uppercase tracking-wider shadow-2xl active:scale-95 transition-transform"
              >
                🏏 SWING BAT (شاٹ ماریں)
              </button>
            ) : (
              <button
                onClick={startNextBall}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm uppercase tracking-wider shadow-xl active:scale-95 transition-transform"
              >
                Next Ball ➔
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-center">
              <h3 className="text-xl font-black text-amber-300">OVER FINISHED!</h3>
              <p className="text-sm font-semibold text-white mt-1">
                You scored <strong className="text-emerald-400 text-lg">{totalScore} Runs</strong>!
              </p>
              <p className="text-xs text-amber-400 mt-0.5">
                Reward: +{totalScore * 10} Coins (سکے)
              </p>
            </div>

            <button
              onClick={handleFinishMatch}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wide shadow-xl active:scale-95"
            >
              Collect Coins & Return to Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
