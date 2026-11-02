/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural Canvas Textures for Pakistani Open World
export class ProceduralTextureFactory {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  // 1. Asphalt Road with Lane Markings
  public static createRoadTexture(): THREE.CanvasTexture {
    if (this.cache.has('road')) return this.cache.get('road')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Asphalt dark base with grain
    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle road grain
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const gray = Math.floor(25 + Math.random() * 25);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Outer white road edge lines
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(15, 0, 8, 512);
    ctx.fillRect(489, 0, 8, 512);

    // Center dashed yellow line (Pakistani GT road style)
    ctx.fillStyle = '#f59e0b';
    for (let y = 10; y < 512; y += 70) {
      ctx.fillRect(250, y, 12, 45);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('road', tex);
    return tex;
  }

  // 2. Village Brick / Clay Wall Texture
  public static createVillageWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('village_wall')) return this.cache.get('village_wall')!;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Terracotta clay tone
    ctx.fillStyle = '#c28153';
    ctx.fillRect(0, 0, 256, 256);

    // Brick mortar lines
    ctx.strokeStyle = '#8d5531';
    ctx.lineWidth = 3;

    const rowH = 28;
    const brickW = 64;
    for (let y = 0; y < 256; y += rowH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();

      const offset = (Math.floor(y / rowH) % 2) * (brickW / 2);
      for (let x = -offset; x < 256; x += brickW) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH);
        ctx.stroke();
      }
    }

    // Weathering speckles
    ctx.fillStyle = 'rgba(60, 30, 10, 0.15)';
    for (let i = 0; i < 500; i++) {
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('village_wall', tex);
    return tex;
  }

  // 3. Pakistani Truck Art Pattern for Rickshaw & Trucks
  public static createTruckArtTexture(): THREE.CanvasTexture {
    if (this.cache.has('truck_art')) return this.cache.get('truck_art')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Bright yellow/orange vibrant background
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 512, 512);

    // Red geometric borders
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 512, 24);
    ctx.fillRect(0, 488, 512, 24);
    ctx.fillRect(0, 0, 24, 512);
    ctx.fillRect(488, 0, 24, 512);

    // Green diamond pattern
    ctx.fillStyle = '#059669';
    for (let x = 40; x < 480; x += 70) {
      for (let y = 40; y < 480; y += 70) {
        ctx.beginPath();
        ctx.moveTo(x + 25, y);
        ctx.lineTo(x + 50, y + 25);
        ctx.lineTo(x + 25, y + 50);
        ctx.lineTo(x, y + 25);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Central circular rosette / peacock eye medallion
    ctx.beginPath();
    ctx.arc(256, 256, 90, 0, Math.PI * 2);
    ctx.fillStyle = '#1d4ed8';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(256, 256, 65, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(256, 256, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();

    // Calligraphic flair / star
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ ماشاءاللہ ★', 256, 264);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('truck_art', tex);
    return tex;
  }

  // 4. Skyscraper Modern Glass Window Grid
  public static createBuildingFacade(type: 'blue' | 'bronze' | 'dark' = 'blue'): THREE.CanvasTexture {
    const key = `building_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const baseColor = type === 'blue' ? '#0f172a' : type === 'bronze' ? '#291e13' : '#111827';
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 256, 512);

    const winColor = type === 'blue' ? '#38bdf8' : type === 'bronze' ? '#fcd34d' : '#94a3b8';
    const litChance = 0.55;

    const rows = 16;
    const cols = 6;
    const cellW = 256 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLit = Math.random() < litChance;
        ctx.fillStyle = isLit ? winColor : '#1e293b';
        ctx.fillRect(c * cellW + 6, r * cellH + 6, cellW - 12, cellH - 12);

        // Reflection highlight
        if (isLit) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(c * cellW + 6, r * cellH + 6, cellW - 12, 4);
        }
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  // 5. Signboard Texture (Chai Hotel, Super Mart, Hospital, etc.)
  public static createSignboard(textEn: string, textUrdu: string, bgColor: string, textColor: string = '#ffffff'): THREE.CanvasTexture {
    const key = `sign_${textEn}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    // Border and fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 512, 160);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 148);

    // Urdu text
    ctx.fillStyle = textColor;
    ctx.font = 'bold 36px "Noto Nastaliq Urdu", "Plus Jakarta Sans", serif';
    ctx.textAlign = 'center';
    ctx.fillText(textUrdu, 256, 65);

    // English text
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(textEn, 256, 120);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set(key, tex);
    return tex;
  }

  // 6. Mosque Marble & Arabesque Crescent
  public static createMosqueTileTexture(): THREE.CanvasTexture {
    if (this.cache.has('mosque_tile')) return this.cache.get('mosque_tile')!;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Pure white marble
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);

    // Green Islamic geometric star border
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 236, 236);

    // Subtle diamond
    ctx.beginPath();
    ctx.moveTo(128, 20);
    ctx.lineTo(236, 128);
    ctx.lineTo(128, 236);
    ctx.lineTo(20, 128);
    ctx.closePath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('mosque_tile', tex);
    return tex;
  }

  // 7. Bab-e-Chak 17 G Gateway Archway Banner
  public static createChak17GatewayTexture(): THREE.CanvasTexture {
    if (this.cache.has('babe_chak17')) return this.cache.get('babe_chak17')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Pakistani Emerald Green Background
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, 512, 128);

    // Gold decorative border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    // Urdu Banner Text
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 38px "Noto Nastaliq Urdu", serif';
    ctx.textAlign = 'center';
    ctx.fillText('بابِ چک نمبر 17 جی · خوش آمدید', 256, 55);

    // English Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('WELCOME TO CHAK NUMBER 17 G', 256, 100);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('babe_chak17', tex);
    return tex;
  }

  // 8. Chak 17 G Open World Map Billboard
  public static createChak17MapSignTexture(): THREE.CanvasTexture {
    if (this.cache.has('map17_sign')) return this.cache.get('map17_sign')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d')!;

    // Board background
    ctx.fillStyle = '#062e24';
    ctx.fillRect(0, 0, 512, 320);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 308);

    // Title
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ CHAK NO. 17 G OFFICIAL MAP ★', 256, 45);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 24px "Noto Nastaliq Urdu", serif';
    ctx.fillText('نقشہ چک نمبر 17 جی پنجاب', 256, 85);

    // Sectors listing
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';

    const items = [
      '1. Jamia Mosque & Crescent Minaret (مسجد)',
      '2. Govt Primary School & Cricket Pitch (اسکول)',
      '3. Uncle Shakoor Dairy Farm & Pen (ڈیری فارم)',
      '4. Karak Chai Hotel & Village Dhabba (ہوٹل)',
      '5. Tube-Well Oasis & Mustard Fields (کھیت)',
      '6. GT Road Highway Canal Bridge (نہر کا پل)',
    ];

    items.forEach((txt, i) => {
      ctx.fillText(txt, 30, 130 + i * 28);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('map17_sign', tex);
    return tex;
  }

  // 9. High-Fidelity Agrarian Grass & Crop Ground
  public static createLushGrassTexture(): THREE.CanvasTexture {
    if (this.cache.has('lush_grass')) return this.cache.get('lush_grass')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Rich fertile soil base
    ctx.fillStyle = '#2d4a1d';
    ctx.fillRect(0, 0, 512, 512);

    // Multi-shade grass clumps
    const greens = ['#365314', '#3f6212', '#4d7c0f', '#15803d', '#166534', '#65a30d'];
    for (let i = 0; i < 6000; i++) {
      const gx = Math.random() * 512;
      const gy = Math.random() * 512;
      const len = 3 + Math.random() * 7;
      ctx.strokeStyle = greens[Math.floor(Math.random() * greens.length)];
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + (Math.random() - 0.5) * 4, gy - len);
      ctx.stroke();
    }

    // Yellow mustard wildflowers speckles
    ctx.fillStyle = '#facc15';
    for (let i = 0; i < 120; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 512, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 26);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('lush_grass', tex);
    return tex;
  }

  // 10. Modern Interlocking City Paver Blocks
  public static createCityPavementTexture(): THREE.CanvasTexture {
    if (this.cache.has('city_pavement')) return this.cache.get('city_pavement')!;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Concrete base
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);

    // Granite speckling
    for (let i = 0; i < 5000; i++) {
      const px = Math.random() * 512;
      const py = Math.random() * 512;
      const gray = Math.floor(45 + Math.random() * 40);
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
      ctx.fillRect(px, py, 2, 2);
    }

    // Paver grid tiles
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    const tileSize = 64;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 26);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('city_pavement', tex);
    return tex;
  }
}
