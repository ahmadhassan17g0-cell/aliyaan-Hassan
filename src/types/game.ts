/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'sunset';

export interface CharacterCustomization {
  name: string;
  outfitColor: string; // Hex color for Shalwar Kameez
  outfitSecondaryColor: string; // Trim / embroidery color
  outfitStyle: 'classic' | 'embroidered' | 'kurta_waistcoat' | 'festive_eid';
  headwear: 'none' | 'side_part' | 'curly_fade' | 'sindhi_topi' | 'chitrali_pakol' | 'eid_turban';
  footwear: 'peshawari_chappal' | 'khussa' | 'sports_sneakers';
  skinTone: string;
  hasWatch: boolean;
  hasGlasses: boolean;
}

export interface PlayerStats {
  coins: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  reputation: number;
  crescentsFound: number;
  totalCrescents: number;
}

export type VehicleType = 'car' | 'rickshaw' | 'motorcycle' | 'bicycle';

export interface VehicleData {
  id: string;
  type: VehicleType;
  name: string;
  color: string;
  position: [number, number, number];
  rotation: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  handling: number;
}

export interface NPCData {
  id: string;
  name: string;
  role: string;
  location: string;
  position: [number, number, number];
  dialogue: string[];
  questId?: string;
  avatarColor: string;
  clothingColor: string;
}

export interface Mission {
  id: string;
  title: string;
  urduTitle: string;
  description: string;
  category: 'village' | 'city' | 'exploration' | 'driving';
  rewardCoins: number;
  targetPosition: [number, number, number];
  targetRadius: number;
  targetName: string;
  completed: boolean;
  hint: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
  cameraSensitivity: number;
  touchControls: boolean;
  daySpeedMultiplier: number;
}
