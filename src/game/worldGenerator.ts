/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ProceduralTextureFactory } from './proceduralTextures';
import { NPCData } from '../types/game';

export interface WorldCollisionBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
}

export interface InteractiveSpot {
  id: string;
  type: 'npc' | 'sit' | 'shop' | 'crescent' | 'water' | 'cricket';
  name: string;
  prompt: string;
  position: [number, number, number];
  radius: number;
  data?: unknown;
}

export interface GeneratedWorld {
  sceneGroup: THREE.Group;
  colliders: WorldCollisionBox[];
  interactiveSpots: InteractiveSpot[];
  npcs: NPCData[];
  streetLamps: THREE.PointLight[];
  trafficLights: THREE.Group[];
  crescents: THREE.Group[];
  animals: THREE.Group[];
}

export class WorldGenerator {
  public static buildWorld(): GeneratedWorld {
    const sceneGroup = new THREE.Group();
    const colliders: WorldCollisionBox[] = [];
    const interactiveSpots: InteractiveSpot[] = [];
    const streetLamps: THREE.PointLight[] = [];
    const trafficLights: THREE.Group[] = [];
    const crescents: THREE.Group[] = [];
    const animals: THREE.Group[] = [];

    // Helper to register static box colliders
    const addCollider = (x: number, z: number, w: number, d: number, h: number = 5) => {
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        height: h,
      });
    };

    // Shared Realistic Materials
    const villageWallTex = ProceduralTextureFactory.createVillageWallTexture();
    const roadTex = ProceduralTextureFactory.createRoadTexture();
    const mosqueTileTex = ProceduralTextureFactory.createMosqueTileTexture();
    const lushGrassTex = ProceduralTextureFactory.createLushGrassTexture();
    const cityPaverTex = ProceduralTextureFactory.createCityPavementTexture();

    const terrainGreenMat = new THREE.MeshStandardMaterial({
      map: lushGrassTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const cityPavementMat = new THREE.MeshStandardMaterial({
      map: cityPaverTex,
      roughness: 0.7,
      metalness: 0.2,
    });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.85 });
    const whiteMarbleMat = new THREE.MeshStandardMaterial({
      map: mosqueTileTex,
      roughness: 0.3,
      metalness: 0.1,
    });
    const pakistaniGreenMat = new THREE.MeshStandardMaterial({
      color: '#064e3b',
      roughness: 0.4,
      metalness: 0.2,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      metalness: 0.85,
      roughness: 0.2,
    });

    // ==========================================
    // 1. TERRAIN BASE (Village: X < -20, City: X > 20, Highway: -20 to 20)
    // ==========================================
    // Village side grass
    const villageGroundGeo = new THREE.PlaneGeometry(160, 260);
    villageGroundGeo.rotateX(-Math.PI / 2);
    const villageGround = new THREE.Mesh(villageGroundGeo, terrainGreenMat);
    villageGround.position.set(-100, 0, 0);
    villageGround.receiveShadow = true;
    sceneGroup.add(villageGround);

    // City side pavement
    const cityGroundGeo = new THREE.PlaneGeometry(160, 260);
    cityGroundGeo.rotateX(-Math.PI / 2);
    const cityGround = new THREE.Mesh(cityGroundGeo, cityPavementMat);
    cityGround.position.set(100, 0, 0);
    cityGround.receiveShadow = true;
    sceneGroup.add(cityGround);

    // Central Canal / River separating Village and City (Reflective Water)
    const waterGeo = new THREE.PlaneGeometry(24, 260);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: '#0284c7',
      roughness: 0.08,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9,
    });
    const canal = new THREE.Mesh(waterGeo, waterMat);
    canal.position.set(0, -0.2, 0);
    sceneGroup.add(canal);

    // ==========================================
    // 2. CONNECTING HIGHWAY & BRIDGE (GT Road)
    // ==========================================
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.6,
      metalness: 0.1,
    });
    roadTex.repeat.set(1, 16);

    // Main East-West Highway connecting Village and City
    const highwayGeo = new THREE.PlaneGeometry(12, 240);
    highwayGeo.rotateX(-Math.PI / 2);
    highwayGeo.rotateY(Math.PI / 2);
    const highway = new THREE.Mesh(highwayGeo, roadMat);
    highway.position.set(0, 0.05, 0);
    highway.receiveShadow = true;
    sceneGroup.add(highway);

    // Bridge crossing over the canal
    const bridgeRailingGeo = new THREE.BoxGeometry(26, 1.2, 0.4);
    const bridgeMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 });
    const railingN = new THREE.Mesh(bridgeRailingGeo, bridgeMat);
    railingN.position.set(0, 0.6, 6.2);
    sceneGroup.add(railingN);
    addCollider(0, 6.2, 26, 0.6, 2);

    const railingS = new THREE.Mesh(bridgeRailingGeo, bridgeMat);
    railingS.position.set(0, 0.6, -6.2);
    sceneGroup.add(railingS);
    addCollider(0, -6.2, 26, 0.6, 2);

    // Milestone on Highway
    const milestoneGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.1, 12);
    const milestoneMat = new THREE.MeshStandardMaterial({ color: '#fef08a' });
    const milestone = new THREE.Mesh(milestoneGeo, milestoneMat);
    milestone.position.set(-15, 0.55, 7.5);
    sceneGroup.add(milestone);

    // ==========================================
    // 3. PAKISTANI VILLAGE ("CHAK NUMBER 17 G")
    // ==========================================

    // BAB-E-CHAK 17 G (Grand Entrance Gateway Arch)
    const gatewayArch = new THREE.Group();
    gatewayArch.position.set(-32, 0, 0);

    const pillarMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 });
    const greenTrimMat = new THREE.MeshStandardMaterial({ color: '#064e3b', roughness: 0.3 });

    // North & South Pillars
    const pillarGeo = new THREE.BoxGeometry(2.0, 7.5, 2.0);
    const pNorth = new THREE.Mesh(pillarGeo, pillarMat);
    pNorth.position.set(0, 3.75, 7.2);
    pNorth.castShadow = true;
    gatewayArch.add(pNorth);
    addCollider(-32, 7.2, 2.2, 2.2, 8);

    const pSouth = new THREE.Mesh(pillarGeo, pillarMat);
    pSouth.position.set(0, 3.75, -7.2);
    pSouth.castShadow = true;
    gatewayArch.add(pSouth);
    addCollider(-32, -7.2, 2.2, 2.2, 8);

    // Crossbeam
    const beamGeo = new THREE.BoxGeometry(2.2, 1.8, 16.5);
    const beam = new THREE.Mesh(beamGeo, greenTrimMat);
    beam.position.set(0, 7.2, 0);
    beam.castShadow = true;
    gatewayArch.add(beam);

    // Archway Signboard (Bab-e-Chak 17 G)
    const archTex = ProceduralTextureFactory.createChak17GatewayTexture();
    const signGeo = new THREE.PlaneGeometry(12, 1.6);
    const signEast = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: archTex }));
    signEast.position.set(1.12, 7.2, 0);
    signEast.rotation.y = Math.PI / 2;
    gatewayArch.add(signEast);

    const signWest = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: archTex }));
    signWest.position.set(-1.12, 7.2, 0);
    signWest.rotation.y = -Math.PI / 2;
    gatewayArch.add(signWest);

    // Golden crescents atop pillars
    const crescentGeoPillar = new THREE.TorusGeometry(0.5, 0.1, 8, 16, Math.PI * 1.5);
    const cresN = new THREE.Mesh(crescentGeoPillar, goldMat);
    cresN.position.set(0, 8.2, 7.2);
    gatewayArch.add(cresN);
    const cresS = new THREE.Mesh(crescentGeoPillar, goldMat);
    cresS.position.set(0, 8.2, -7.2);
    gatewayArch.add(cresS);

    sceneGroup.add(gatewayArch);

    // 3D MAP 17 G BILLBOARD (Roadside tourist & village map)
    const map17Board = new THREE.Group();
    map17Board.position.set(-38, 0, 8.5);

    const boardPostGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8);
    const postL = new THREE.Mesh(boardPostGeo, new THREE.MeshStandardMaterial({ color: '#334155' }));
    postL.position.set(-2.5, 1.9, 0);
    map17Board.add(postL);

    const postR = new THREE.Mesh(boardPostGeo, new THREE.MeshStandardMaterial({ color: '#334155' }));
    postR.position.set(2.5, 1.9, 0);
    map17Board.add(postR);

    const mapSignTex = ProceduralTextureFactory.createChak17MapSignTexture();
    const mapSignGeo = new THREE.PlaneGeometry(6, 3.6);
    const mapBoardMesh = new THREE.Mesh(mapSignGeo, new THREE.MeshBasicMaterial({ map: mapSignTex }));
    mapBoardMesh.position.set(0, 3.2, 0.05);
    map17Board.add(mapBoardMesh);

    sceneGroup.add(map17Board);
    interactiveSpots.push({
      id: 'map17_billboard_spot',
      type: 'shop',
      name: 'Chak 17 G Official Map',
      prompt: 'Open Map 17 G (نقشہ دیکھیں) 🗺️',
      position: [-38, 1.0, 8.5],
      radius: 4.8,
    });

    // Village Dirt Main Track
    const dirtTrackMat = new THREE.MeshStandardMaterial({ color: '#a16207', roughness: 0.95 });
    const vRoadGeo = new THREE.PlaneGeometry(10, 180);
    vRoadGeo.rotateX(-Math.PI / 2);
    const vRoad = new THREE.Mesh(vRoadGeo, dirtTrackMat);
    vRoad.position.set(-80, 0.04, 0);
    vRoad.receiveShadow = true;
    sceneGroup.add(vRoad);

    // A. GRAND VILLAGE MOSQUE (Jamia Masjid Al-Falah)
    const mosqueGroup = new THREE.Group();
    mosqueGroup.position.set(-110, 0, -45);

    // Main Prayer Hall
    const prayerHallGeo = new THREE.BoxGeometry(22, 9, 20);
    const prayerHall = new THREE.Mesh(prayerHallGeo, whiteMarbleMat);
    prayerHall.position.y = 4.5;
    prayerHall.castShadow = true;
    prayerHall.receiveShadow = true;
    mosqueGroup.add(prayerHall);
    addCollider(-110, -45, 22, 20, 12);

    // Arched Entrance Portico
    const porticoGeo = new THREE.BoxGeometry(8, 7, 4);
    const portico = new THREE.Mesh(porticoGeo, pakistaniGreenMat);
    portico.position.set(0, 3.5, 12);
    mosqueGroup.add(portico);

    // Grand Central Green Dome
    const domeGeo = new THREE.SphereGeometry(6, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const dome = new THREE.Mesh(domeGeo, pakistaniGreenMat);
    dome.position.set(0, 9, 0);
    dome.castShadow = true;
    mosqueGroup.add(dome);

    // Golden Finial on Dome
    const finialGeo = new THREE.ConeGeometry(0.4, 2, 8);
    const finial = new THREE.Mesh(finialGeo, goldMat);
    finial.position.set(0, 16, 0);
    mosqueGroup.add(finial);

    // Iconic Tall Minaret (24m)
    const minaretBaseGeo = new THREE.CylinderGeometry(1.6, 2.0, 24, 16);
    const minaret = new THREE.Mesh(minaretBaseGeo, whiteMarbleMat);
    minaret.position.set(11, 12, 11);
    minaret.castShadow = true;
    mosqueGroup.add(minaret);

    const minaretTopGeo = new THREE.ConeGeometry(1.8, 4, 12);
    const minaretTop = new THREE.Mesh(minaretTopGeo, pakistaniGreenMat);
    minaretTop.position.set(11, 26, 11);
    mosqueGroup.add(minaretTop);

    // Minaret Crescent Relic
    const crescentGeo = new THREE.TorusGeometry(0.7, 0.15, 8, 16, Math.PI * 1.5);
    const crescentMesh = new THREE.Mesh(crescentGeo, goldMat);
    crescentMesh.position.set(11, 28.5, 11);
    mosqueGroup.add(crescentMesh);

    sceneGroup.add(mosqueGroup);

    // B. VILLAGE HOUSES (Kaccha & Pakka Mud Houses with Courtyards)
    const houseCoords = [
      { x: -55, z: -25, w: 10, d: 9, h: 4 },
      { x: -55, z: 25, w: 12, d: 10, h: 4.5 },
      { x: -75, z: -65, w: 11, d: 11, h: 4 },
      { x: -85, z: 65, w: 14, d: 10, h: 4.2 },
      { x: -115, z: 35, w: 12, d: 12, h: 4.5 },
      { x: -125, z: -15, w: 10, d: 10, h: 3.8 },
    ];

    houseCoords.forEach((h, idx) => {
      const houseMat = new THREE.MeshStandardMaterial({
        map: villageWallTex,
        roughness: 0.9,
      });
      const hMesh = new THREE.Mesh(new THREE.BoxGeometry(h.w, h.h, h.d), houseMat);
      hMesh.position.set(h.x, h.h / 2, h.z);
      hMesh.castShadow = true;
      hMesh.receiveShadow = true;
      sceneGroup.add(hMesh);
      addCollider(h.x, h.z, h.w, h.d, h.h);

      // Wooden door
      const doorGeo = new THREE.BoxGeometry(1.4, 2.4, 0.2);
      const door = new THREE.Mesh(doorGeo, woodMat);
      door.position.set(h.x, 1.2, h.z + h.d / 2 + 0.1);
      sceneGroup.add(door);

      // Charpai outside each house under veranda
      if (idx % 2 === 0) {
        const charpai = this.createCharpai();
        charpai.position.set(h.x + 3.5, 0, h.z + h.d / 2 + 2.5);
        sceneGroup.add(charpai);
        interactiveSpots.push({
          id: `sit_charpai_${idx}`,
          type: 'sit',
          name: 'Village Charpai',
          prompt: 'Sit on Charpai (Rest)',
          position: [h.x + 3.5, 0.45, h.z + h.d / 2 + 2.5],
          radius: 2.2,
        });
      }
    });

    // C. KARAK CHAI HOTEL & DHABBA (Village Social Hub)
    const chaiHotel = new THREE.Group();
    chaiHotel.position.set(-68, 0, 8);

    const dhabbaBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(10, 4, 8),
      new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.85 })
    );
    dhabbaBuilding.position.y = 2;
    dhabbaBuilding.castShadow = true;
    chaiHotel.add(dhabbaBuilding);
    addCollider(-68, 8, 10, 8, 4);

    // Dhabba Canopy Awning (Striped orange/white)
    const awningGeo = new THREE.BoxGeometry(9.5, 0.15, 3.5);
    const awningMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.7 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 3.4, 5.2);
    awning.rotation.x = 0.2;
    chaiHotel.add(awning);

    // Signboard: "KARAK CHAI HOTEL"
    const chaiSignTex = ProceduralTextureFactory.createSignboard('KARAK CHAI HOTEL', 'کڑک چائے ہوٹل', '#b45309');
    const chaiSignGeo = new THREE.PlaneGeometry(6, 1.8);
    const chaiSign = new THREE.Mesh(chaiSignGeo, new THREE.MeshBasicMaterial({ map: chaiSignTex }));
    chaiSign.position.set(0, 4.8, 4.05);
    chaiHotel.add(chaiSign);

    // Samovar Tea Kettle on Counter
    const kettleGeo = new THREE.CylinderGeometry(0.25, 0.35, 0.8, 12);
    const kettle = new THREE.Mesh(kettleGeo, new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 }));
    kettle.position.set(2, 2.2, 4.2);
    chaiHotel.add(kettle);

    // Charpai outside Dhabba
    const dhabbaCharpai = this.createCharpai();
    dhabbaCharpai.position.set(-2, 0, 6.5);
    chaiHotel.add(dhabbaCharpai);

    sceneGroup.add(chaiHotel);

    interactiveSpots.push({
      id: 'chai_dhabba_interact',
      type: 'shop',
      name: 'Karak Chai Hotel',
      prompt: 'Order Fresh Chai (+Stamina)',
      position: [-68, 1.0, 13],
      radius: 3.5,
    });

    // D. VILLAGE PRIMARY SCHOOL & PLAYGROUND
    const schoolGroup = new THREE.Group();
    schoolGroup.position.set(-110, 0, 85);

    const schoolHall = new THREE.Mesh(
      new THREE.BoxGeometry(20, 5, 12),
      new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.8 })
    );
    schoolHall.position.y = 2.5;
    schoolHall.castShadow = true;
    schoolGroup.add(schoolHall);
    addCollider(-110, 85, 20, 12, 5);

    const schoolSignTex = ProceduralTextureFactory.createSignboard('GOVT PRIMARY SCHOOL CHAK 17 G', 'گورنمنٹ پرائمری اسکول چک 17 جی', '#047857');
    const schoolSign = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 2.0),
      new THREE.MeshBasicMaterial({ map: schoolSignTex })
    );
    schoolSign.position.set(0, 4.5, 6.1);
    schoolGroup.add(schoolSign);

    // Pakistan Flagpole
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 10, 8);
    const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.8 }));
    pole.position.set(6, 5, 10);
    schoolGroup.add(pole);

    const flagGeo = new THREE.PlaneGeometry(2.4, 1.5);
    const flagMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.6 });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(7.2, 9, 10);
    schoolGroup.add(flag);

    // Cricket Pitch with Wickets
    const pitchGeo = new THREE.PlaneGeometry(4, 16);
    pitchGeo.rotateX(-Math.PI / 2);
    const pitchMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.95 });
    const pitch = new THREE.Mesh(pitchGeo, pitchMat);
    pitch.position.set(-12, 0.03, 10);
    schoolGroup.add(pitch);

    // Wickets (Stumps)
    for (let s = -0.15; s <= 0.15; s += 0.15) {
      const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.75, 6), woodMat);
      stump.position.set(-12 + s, 0.38, 18);
      schoolGroup.add(stump);
    }

    // Cricket Bat resting near stumps
    const batMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.75, 0.04), woodMat);
    batMesh.position.set(-11.6, 0.35, 18);
    batMesh.rotation.z = 0.25;
    schoolGroup.add(batMesh);

    sceneGroup.add(schoolGroup);

    // Register Cricket minigame interactive spot
    interactiveSpots.push({
      id: 'cricket_pitch_spot',
      type: 'cricket',
      name: 'Village Cricket Pitch',
      prompt: 'Play Tap-Ball Cricket 🏏',
      position: [-122, 0.5, 95],
      radius: 4.5,
    });

    // E. VILLAGE TUBE-WELL (Water Pump / Chashma)
    const tubewellGroup = new THREE.Group();
    tubewellGroup.position.set(-50, 0, -65);

    // Pump pipe
    const pipeGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.8, 10);
    const pumpPipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.8 }));
    pumpPipe.position.y = 0.9;
    tubewellGroup.add(pumpPipe);

    // Water pool
    const poolGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.6, 16);
    const pool = new THREE.Mesh(poolGeo, new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.1, metalness: 0.7 }));
    pool.position.y = 0.3;
    tubewellGroup.add(pool);

    sceneGroup.add(tubewellGroup);
    interactiveSpots.push({
      id: 'tubewell_splash',
      type: 'water',
      name: 'Village Tube-Well',
      prompt: 'Drink Fresh Well Water',
      position: [-50, 0.5, -65],
      radius: 4,
    });

    // F. MUSTARD FIELDS & CROPS (Yellow & Green Instanced Foliage)
    const mustardMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.85 });
    for (let x = -135; x <= -105; x += 6) {
      for (let z = -110; z <= -80; z += 6) {
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), leafMat);
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6, 6), mustardMat);
        flower.position.y = 0.7;
        stalk.add(flower);
        stalk.position.set(x + (Math.random() - 0.5) * 2, 0.6, z + (Math.random() - 0.5) * 2);
        sceneGroup.add(stalk);
      }
    }

    // G. VILLAGE ANIMALS (Sahiwal Cow, Buffalo, Goats)
    const cow1 = this.createCow('#991b1b', true); // Reddish-brown Sahiwal humped cow
    cow1.position.set(-58, 0, -40);
    cow1.rotation.y = 0.4;
    sceneGroup.add(cow1);
    animals.push(cow1);

    const goat1 = this.createGoat('#f8fafc'); // White goat
    goat1.position.set(-65, 0, -35);
    goat1.rotation.y = -0.6;
    sceneGroup.add(goat1);
    animals.push(goat1);

    const goat2 = this.createGoat('#18181b'); // Black goat
    goat2.position.set(-115, 0, -95); // Wandered into mustard fields!
    goat2.rotation.y = 1.2;
    sceneGroup.add(goat2);
    animals.push(goat2);

    // Pakistani Millat Red Tractor parked in Chak 17 G
    const tractor = this.createTractor();
    tractor.position.set(-95, 0, -45);
    tractor.rotation.y = -0.4;
    sceneGroup.add(tractor);
    addCollider(-95, -45, 2.2, 3.5, 3);

    // Natural Horizon Mountains surrounding the open world
    const horizonMountains = this.createHorizonMountains();
    sceneGroup.add(horizonMountains);

    // ==========================================
    // 4. SHADY BANYAN & NEEM TREES
    // ==========================================
    const treePositions = [
      [-65, 12], [-85, -20], [-105, 10], [-55, 60], [-80, -90],
      [-30, 25], [-28, -35], [25, 30], [28, -40]
    ];
    treePositions.forEach(([tx, tz]) => {
      const tree = this.createTree();
      tree.position.set(tx, 0, tz);
      sceneGroup.add(tree);
      addCollider(tx, tz, 2.5, 2.5, 8);
    });

    // ==========================================
    // 5. MODERN CITY ("GULBERG METROPOLIS")
    // ==========================================
    const cityRoadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.5,
      metalness: 0.1,
    });

    // Dual Carriageway City Boulevards (Grid layout)
    // North-South Boulevard 1
    const nsBlvd1 = new THREE.Mesh(new THREE.PlaneGeometry(14, 240), cityRoadMat);
    nsBlvd1.position.set(65, 0.05, 0);
    nsBlvd1.receiveShadow = true;
    sceneGroup.add(nsBlvd1);

    // North-South Boulevard 2
    const nsBlvd2 = new THREE.Mesh(new THREE.PlaneGeometry(14, 240), cityRoadMat);
    nsBlvd2.position.set(115, 0.05, 0);
    nsBlvd2.receiveShadow = true;
    sceneGroup.add(nsBlvd2);

    // East-West Cross Avenue 1
    const ewAve1 = new THREE.Mesh(new THREE.PlaneGeometry(14, 130), cityRoadMat);
    ewAve1.position.set(90, 0.05, -50);
    ewAve1.rotation.z = Math.PI / 2;
    ewAve1.receiveShadow = true;
    sceneGroup.add(ewAve1);

    // East-West Cross Avenue 2
    const ewAve2 = new THREE.Mesh(new THREE.PlaneGeometry(14, 130), cityRoadMat);
    ewAve2.position.set(90, 0.05, 50);
    ewAve2.rotation.z = Math.PI / 2;
    ewAve2.receiveShadow = true;
    sceneGroup.add(ewAve2);

    // A. SKYSCRAPERS (Tall Glass & Steel Towers)
    const skyscraperConfigs = [
      { x: 42, z: -85, w: 20, d: 20, h: 48, type: 'blue' as const },
      { x: 90, z: -90, w: 24, d: 24, h: 62, type: 'dark' as const },
      { x: 135, z: -85, w: 22, d: 20, h: 54, type: 'bronze' as const },
      { x: 138, z: 0, w: 24, d: 22, h: 45, type: 'blue' as const },
      { x: 42, z: 85, w: 22, d: 20, h: 52, type: 'dark' as const },
      { x: 135, z: 85, w: 24, d: 22, h: 58, type: 'bronze' as const },
    ];

    skyscraperConfigs.forEach((cfg) => {
      const tex = ProceduralTextureFactory.createBuildingFacade(cfg.type);
      const bMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.25,
        metalness: 0.6,
      });
      const tower = new THREE.Mesh(new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d), bMat);
      tower.position.set(cfg.x, cfg.h / 2, cfg.z);
      tower.castShadow = true;
      tower.receiveShadow = true;
      sceneGroup.add(tower);
      addCollider(cfg.x, cfg.z, cfg.w, cfg.d, cfg.h);

      // Rooftop helipad or communication antenna
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.3, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.9 })
      );
      antenna.position.set(cfg.x, cfg.h + 4, cfg.z);
      sceneGroup.add(antenna);
    });

    // B. EMERALD SHOPPING MALL ("EMERALD MALL")
    const mallGroup = new THREE.Group();
    mallGroup.position.set(90, 0, 0);

    const mallBody = new THREE.Mesh(
      new THREE.BoxGeometry(32, 16, 26),
      new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3, metalness: 0.7 })
    );
    mallBody.position.y = 8;
    mallBody.castShadow = true;
    mallGroup.add(mallBody);
    addCollider(90, 0, 32, 26, 16);

    // Glass Atrium Dome
    const mallAtrium = new THREE.Mesh(
      new THREE.SphereGeometry(7, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
      new THREE.MeshPhysicalMaterial({ color: '#38bdf8', transparent: true, opacity: 0.5, roughness: 0.1 })
    );
    mallAtrium.position.set(0, 16, 0);
    mallGroup.add(mallAtrium);

    // Mall Signboard
    const mallSignTex = ProceduralTextureFactory.createSignboard('EMERALD MEGA MALL', 'ایمرلڈ میگا مال', '#065f46');
    const mallSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), new THREE.MeshBasicMaterial({ map: mallSignTex }));
    mallSign.position.set(0, 14, 13.1);
    mallGroup.add(mallSign);

    sceneGroup.add(mallGroup);
    interactiveSpots.push({
      id: 'mall_wardrobe_shop',
      type: 'shop',
      name: 'Emerald Mall Boutique',
      prompt: 'Enter Mall / Wardrobe Shop',
      position: [90, 1.0, 16],
      radius: 4.5,
    });

    // C. JINNAH MEMORIAL HOSPITAL
    const hospitalGroup = new THREE.Group();
    hospitalGroup.position.set(40, 0, -25);

    const hospBuilding = new THREE.Mesh(
      new THREE.BoxGeometry(22, 14, 18),
      new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.4 })
    );
    hospBuilding.position.y = 7;
    hospBuilding.castShadow = true;
    hospitalGroup.add(hospBuilding);
    addCollider(40, -25, 22, 18, 14);

    const hospSignTex = ProceduralTextureFactory.createSignboard('JINNAH CARE HOSPITAL', 'جناح کیئر ہسپتال', '#b91c1c');
    const hospSign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: hospSignTex }));
    hospSign.position.set(0, 11, 9.1);
    hospitalGroup.add(hospSign);

    sceneGroup.add(hospitalGroup);

    // D. IQBAL CENTRAL URBAN PARK
    const parkGroup = new THREE.Group();
    parkGroup.position.set(90, 0, 85);

    // Green lawn
    const parkLawn = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.85 })
    );
    parkLawn.rotateX(-Math.PI / 2);
    parkLawn.position.y = 0.08;
    parkGroup.add(parkLawn);

    // Water fountain pool
    const fountainPool = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 0.8, 20),
      new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.2, metalness: 0.6 })
    );
    fountainPool.position.y = 0.4;
    parkGroup.add(fountainPool);

    // Fountain spray column
    const spray = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.8, 3.5, 12),
      new THREE.MeshStandardMaterial({ color: '#e0f2fe', transparent: true, opacity: 0.75 })
    );
    spray.position.y = 2.0;
    parkGroup.add(spray);

    // Palm trees in park
    const palmPositions = [[-12, -12], [12, -12], [-12, 12], [12, 12]];
    palmPositions.forEach(([px, pz]) => {
      const palm = this.createPalmTree();
      palm.position.set(px, 0, pz);
      parkGroup.add(palm);
    });

    // Park benches
    const bench1 = this.createBench();
    bench1.position.set(0, 0, -8);
    parkGroup.add(bench1);

    sceneGroup.add(parkGroup);
    interactiveSpots.push({
      id: 'park_sit_bench',
      type: 'sit',
      name: 'Iqbal Park Bench',
      prompt: 'Sit in Park (+Stamina)',
      position: [90, 0.5, 77],
      radius: 2.5,
    });

    // E. TRAFFIC LIGHTS AT INTERSECTIONS
    const tLightCoords = [
      [65, -50], [115, -50], [65, 50], [115, 50]
    ];
    tLightCoords.forEach(([lx, lz]) => {
      const tLight = this.createTrafficLight();
      tLight.position.set(lx + 7.5, 0, lz + 7.5);
      sceneGroup.add(tLight);
      trafficLights.push(tLight);
    });

    // F. STREET LAMPS (Warm light pools at night)
    const lampCoords = [
      [65, -20], [65, 20], [115, -20], [115, 20],
      [40, 0], [-20, 0], [20, 0], [90, -42], [90, 42]
    ];
    lampCoords.forEach(([lx, lz]) => {
      const lamp = this.createStreetLamp();
      lamp.position.set(lx, 0, lz);
      sceneGroup.add(lamp);

      const light = new THREE.PointLight(0xffecd2, 1.8, 22, 1.2);
      light.position.set(lx, 5.8, lz);
      sceneGroup.add(light);
      streetLamps.push(light);
    });

    // ==========================================
    // 6. COLLECTIBLE CRESCENT COINS (7 HIDDEN)
    // ==========================================
    const crescentLocs = [
      { id: 'c1', pos: [-110, 2.5, -30], name: 'Mosque Courtyard Crescent' },
      { id: 'c2', pos: [-50, 1.5, -65], name: 'Tube-Well Oasis Crescent' },
      { id: 'c3', pos: [-122, 1.5, 10], name: 'Cricket Pitch Crescent' },
      { id: 'c4', pos: [0, 2.0, 0], name: 'Canal Bridge Apex Crescent' },
      { id: 'c5', pos: [90, 1.8, 85], name: 'Iqbal Park Fountain Crescent' },
      { id: 'c6', pos: [90, 2.0, 16], name: 'Emerald Mall Plaza Crescent' },
      { id: 'c7', pos: [40, 1.8, -15], name: 'Jinnah Hospital Terrace Crescent' },
    ];

    crescentLocs.forEach((c) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(c.pos[0], c.pos[1], c.pos[2]);

      const crescentShape = new THREE.TorusGeometry(0.5, 0.12, 10, 24, Math.PI * 1.5);
      const starShape = new THREE.ConeGeometry(0.18, 0.35, 5);
      starShape.rotateZ(Math.PI / 2);

      const cMesh = new THREE.Mesh(crescentShape, goldMat);
      const sMesh = new THREE.Mesh(starShape, goldMat);
      sMesh.position.set(0.35, 0.2, 0);

      cGroup.add(cMesh);
      cGroup.add(sMesh);
      sceneGroup.add(cGroup);
      crescents.push(cGroup);

      interactiveSpots.push({
        id: `crescent_${c.id}`,
        type: 'crescent',
        name: c.name,
        prompt: 'Collect Crescent (+50 Coins)',
        position: c.pos as [number, number, number],
        radius: 2.4,
      });
    });

    // ==========================================
    // 7. VILLAGE & CITY NPCS
    // ==========================================
    const npcs: NPCData[] = [
      {
        id: 'npc_aliyaan',
        name: 'Aliyaan Hassan',
        role: 'Chak 17 G Hero & Leader',
        location: 'Chak 17 G Central Square',
        position: [-65, 0, 12],
        dialogue: [
          'As-salamu alaykum! I am Aliyaan Hassan from Chak Number 17 G.',
          'Take my realistic sports car parked near the highway and test its horsepower on the GT Road!',
          'Uncle Shakoor has fresh dairy milk ready, and the cricket pitch is open at the school!',
        ],
        questId: 'quest_gt_speedster',
        avatarColor: '#047857',
        clothingColor: '#064e3b',
      },
      {
        id: 'npc_shakoor',
        name: 'Uncle Shakoor',
        role: 'Dairy Farmer',
        location: 'Chak 17 G Cattle Pen',
        position: [-60, 0, -32],
        dialogue: [
          'Arrey Aliyaan beta! My mischievous white goat escaped into the Chak 17 G golden mustard fields!',
          'Can you find her and bring her back before sunset?',
        ],
        questId: 'quest_lost_goat',
        avatarColor: '#d97706',
        clothingColor: '#78350f',
      },
      {
        id: 'npc_chaiwallah',
        name: 'Kashif Bhai',
        role: 'Chai Master',
        location: 'Karak Chai Hotel',
        position: [-68, 0, 11],
        dialogue: [
          'Aliyaan bhai! Garam karak patti chai ready hai! Special cardamom and elaichi blend!',
          'Drink a cup to recharge your sprint stamina anytime!',
        ],
        avatarColor: '#b45309',
        clothingColor: '#f59e0b',
      },
      {
        id: 'npc_schoolmaster',
        name: 'Master Tariq',
        role: 'School Teacher',
        location: 'Chak 17 G Govt School',
        position: [-105, 0, 88],
        dialogue: [
          'Welcome Aliyaan! Education is the true treasure of Pakistan, son.',
          'You bat brilliantly on our Chak 17 G cricket pitch! Keep practicing!',
        ],
        avatarColor: '#0284c7',
        clothingColor: '#047857',
      },
      {
        id: 'npc_police',
        name: 'Sub-Inspector Imran',
        role: 'Traffic Warden',
        location: 'Canal Bridge Checkpoint',
        position: [5, 0, 8],
        dialogue: [
          'Keep your vehicle under the speed limit on the GT Road!',
          'Always respect the zebra crossing and wear your helmet.',
        ],
        avatarColor: '#1e3a8a',
        clothingColor: '#1e40af',
      },
      {
        id: 'npc_sarah',
        name: 'Sarah',
        role: 'University Student',
        location: 'Emerald Mall Plaza',
        position: [88, 0, 18],
        dialogue: [
          'Hey! The new Pakistani cultural festival is happening at the Mall!',
          'Have you explored the rooftop view of the skyline yet?',
        ],
        questId: 'quest_crescent_hunt',
        avatarColor: '#be185d',
        clothingColor: '#ec4899',
      },
    ];

    npcs.forEach((npc) => {
      // Procedural NPC representation
      const npcGroup = new THREE.Group();
      npcGroup.position.set(npc.position[0], 0, npc.position[2]);

      const bodyMat = new THREE.MeshStandardMaterial({ color: npc.clothingColor, roughness: 0.8 });
      const skinMat = new THREE.MeshStandardMaterial({ color: '#f3c59a', roughness: 0.6 });

      // Torso
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.8, 10), bodyMat);
      torso.position.y = 1.0;
      torso.castShadow = true;
      npcGroup.add(torso);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
      head.position.y = 1.55;
      npcGroup.add(head);

      // Turban / Cap
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.1, 10), new THREE.MeshStandardMaterial({ color: npc.avatarColor }));
      cap.position.y = 1.68;
      npcGroup.add(cap);

      sceneGroup.add(npcGroup);

      interactiveSpots.push({
        id: `npc_talk_${npc.id}`,
        type: 'npc',
        name: npc.name,
        prompt: `Talk to ${npc.name}`,
        position: npc.position,
        radius: 3.2,
        data: npc,
      });
    });

    return {
      sceneGroup,
      colliders,
      interactiveSpots,
      npcs,
      streetLamps,
      trafficLights,
      crescents,
      animals,
    };
  }

  // Traditional Pakistani Charpai (Woven rope daybed)
  private static createCharpai(): THREE.Group {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    const ropeMat = new THREE.MeshStandardMaterial({ color: '#e2d5b8', roughness: 0.95 });

    // Woven rope webbing surface
    const surfaceGeo = new THREE.BoxGeometry(2.1, 0.08, 1.2);
    const surface = new THREE.Mesh(surfaceGeo, ropeMat);
    surface.position.y = 0.45;
    surface.castShadow = true;
    group.add(surface);

    // 4 Turned wooden legs (Paaye)
    const legGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.45, 8);
    const offsets = [
      [0.95, 0.5], [-0.95, 0.5], [0.95, -0.5], [-0.95, -0.5]
    ];
    offsets.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, 0.225, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    return group;
  }

  // Village Animal: Pakistani Cow / Buffalo
  private static createCow(color: string, hasHump: boolean): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });

    // Body barrel
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 2.2), mat);
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    // Hump (Iconic Sahiwal Cow feature)
    if (hasHump) {
      const hump = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), mat);
      hump.position.set(0, 1.85, 0.5);
      group.add(hump);
    }

    // Head & Horns
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.7), mat);
    head.position.set(0, 1.6, 1.3);
    group.add(head);

    // 4 Sturdy Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.8, 8);
    const legs = [
      [0.45, 0.7], [-0.45, 0.7], [0.45, -0.7], [-0.45, -0.7]
    ];
    legs.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, mat);
      leg.position.set(lx, 0.4, lz);
      leg.castShadow = true;
      group.add(leg);
    });

    return group;
  }

  // Village Goat
  private static createGoat(color: string): THREE.Group {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 1.1), mat);
    body.position.y = 0.7;
    body.castShadow = true;
    group.add(body);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.4), mat);
    head.position.set(0, 0.95, 0.65);
    group.add(head);

    // Horns
    const hornMat = new THREE.MeshStandardMaterial({ color: '#292524' });
    const hornGeo = new THREE.ConeGeometry(0.04, 0.25, 6);
    const h1 = new THREE.Mesh(hornGeo, hornMat);
    h1.position.set(0.08, 1.18, 0.65);
    h1.rotation.x = -0.3;
    group.add(h1);
    const h2 = new THREE.Mesh(hornGeo, hornMat);
    h2.position.set(-0.08, 1.18, 0.65);
    h2.rotation.x = -0.3;
    group.add(h2);

    const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.5, 6);
    [[-0.2, 0.35], [0.2, 0.35], [-0.2, -0.35], [0.2, -0.35]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, mat);
      leg.position.set(lx, 0.25, lz);
      group.add(leg);
    });

    return group;
  }

  // Shady Banyan / Neem Tree
  private static createTree(): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#3f2212', roughness: 0.9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.8 });

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 4.5, 8), trunkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage canopy clusters
    for (let i = 0; i < 5; i++) {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(2.4 + Math.random() * 0.8, 8, 8), leafMat);
      crown.position.set((Math.random() - 0.5) * 1.5, 4.8 + Math.random() * 1.2, (Math.random() - 0.5) * 1.5);
      crown.castShadow = true;
      group.add(crown);
    }
    return group;
  }

  // Palm Tree
  private static createPalmTree(): THREE.Group {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 6, 8),
      new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 })
    );
    trunk.position.y = 3;
    trunk.castShadow = true;
    group.add(trunk);

    const frondMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.7 });
    for (let f = 0; f < 8; f++) {
      const ang = (f / 8) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 3.2), frondMat);
      frond.position.set(Math.cos(ang) * 1.4, 5.8, Math.sin(ang) * 1.4);
      frond.rotation.y = -ang;
      frond.rotation.x = 0.35;
      group.add(frond);
    }
    return group;
  }

  // Park Bench
  private static createBench(): THREE.Group {
    const group = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.7 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.6), wood);
    seat.position.y = 0.45;
    group.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.08), wood);
    back.position.set(0, 0.75, -0.28);
    group.add(back);
    return group;
  }

  // Street Lamp
  private static createStreetLamp(): THREE.Group {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.2 });

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6, 8), metalMat);
    post.position.y = 3;
    post.castShadow = true;
    group.add(post);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), metalMat);
    arm.position.set(0.5, 5.9, 0);
    group.add(arm);

    const lampHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#fef08a' })
    );
    lampHead.position.set(1.0, 5.8, 0);
    group.add(lampHead);

    return group;
  }

  // Traffic Light
  private static createTrafficLight(): THREE.Group {
    const group = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), postMat);
    pole.position.y = 2.5;
    group.add(pole);

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), postMat);
    box.position.set(0, 4.8, 0);
    group.add(box);

    const red = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: '#ef4444' }));
    red.position.set(0, 5.2, 0.21);
    group.add(red);

    const yellow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: '#f59e0b' }));
    yellow.position.set(0, 4.8, 0.21);
    group.add(yellow);

    const green = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: '#22c55e' }));
    green.position.set(0, 4.4, 0.21);
    group.add(green);

    return group;
  }

  // Authentic Pakistani Farm Tractor (Millat / Massey Ferguson Red)
  private static createTractor(): THREE.Group {
    const group = new THREE.Group();
    const redMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.35, metalness: 0.2 });
    const darkMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.85 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.2 });

    // Hood / Engine Body
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.85, 1.8), redMat);
    hood.position.set(0, 1.15, 0.4);
    hood.castShadow = true;
    group.add(hood);

    // Front Grille & Headlamps
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.1), darkMat);
    grille.position.set(0, 1.15, 1.32);
    group.add(grille);

    const lampGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 10);
    lampGeo.rotateX(Math.PI / 2);
    const lampL = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: '#fef08a' }));
    lampL.position.set(0.35, 1.25, 1.35);
    group.add(lampL);
    const lampR = new THREE.Mesh(lampGeo, new THREE.MeshBasicMaterial({ color: '#fef08a' }));
    lampR.position.set(-0.35, 1.25, 1.35);
    group.add(lampR);

    // Vertical Exhaust Pipe
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.3, 8), chromeMat);
    pipe.position.set(0.42, 2.1, 0.7);
    group.add(pipe);

    // Operator Platform & Rear Mudguards
    const platform = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 1.4), darkMat);
    platform.position.set(0, 0.7, -0.8);
    group.add(platform);

    const fenderGeo = new THREE.BoxGeometry(0.28, 0.7, 1.4);
    const fL = new THREE.Mesh(fenderGeo, redMat);
    fL.position.set(0.85, 1.3, -0.8);
    fL.castShadow = true;
    group.add(fL);
    const fR = new THREE.Mesh(fenderGeo, redMat);
    fR.position.set(-0.85, 1.3, -0.8);
    fR.castShadow = true;
    group.add(fR);

    // Steering Wheel & Seat
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 6, 12), darkMat);
    wheel.position.set(0, 1.55, -0.3);
    wheel.rotation.x = Math.PI / 3;
    group.add(wheel);

    // Big Rear Tractor Tread Wheels
    const rearTireGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.35, 16);
    rearTireGeo.rotateZ(Math.PI / 2);
    const rWheelL = new THREE.Mesh(rearTireGeo, darkMat);
    rWheelL.position.set(0.95, 0.72, -0.8);
    rWheelL.castShadow = true;
    group.add(rWheelL);
    const rWheelR = new THREE.Mesh(rearTireGeo, darkMat);
    rWheelR.position.set(-0.95, 0.72, -0.8);
    rWheelR.castShadow = true;
    group.add(rWheelR);

    // Small Front Wheels
    const frontTireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 14);
    frontTireGeo.rotateZ(Math.PI / 2);
    const fWheelL = new THREE.Mesh(frontTireGeo, darkMat);
    fWheelL.position.set(0.7, 0.38, 1.05);
    fWheelL.castShadow = true;
    group.add(fWheelL);
    const fWheelR = new THREE.Mesh(frontTireGeo, darkMat);
    fWheelR.position.set(-0.7, 0.38, 1.05);
    fWheelR.castShadow = true;
    group.add(fWheelR);

    return group;
  }

  // Realistic Horizon Mountain Ranges (Organic open world boundary)
  private static createHorizonMountains(): THREE.Group {
    const group = new THREE.Group();
    const mountainMat = new THREE.MeshStandardMaterial({
      color: '#475569',
      roughness: 0.9,
    });
    const hillMat = new THREE.MeshStandardMaterial({
      color: '#273822',
      roughness: 0.95,
    });

    // Ring of distant natural hills
    const mountainCount = 18;
    for (let i = 0; i < mountainCount; i++) {
      const angle = (i / mountainCount) * Math.PI * 2;
      const dist = 210 + Math.sin(i * 3) * 25;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const height = 35 + (i % 5) * 12;
      const radius = 24 + (i % 3) * 8;

      const coneGeo = new THREE.ConeGeometry(radius, height, 7);
      const isGreen = x < 0; // Village side hills are green agrarians
      const hill = new THREE.Mesh(coneGeo, isGreen ? hillMat : mountainMat);
      hill.position.set(x, height / 2 - 4, z);
      group.add(hill);
    }

    return group;
  }
}
