/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterCustomization, WeatherType, VehicleType, Mission, NPCData } from '../types/game';
import { CharacterModel } from '../game/characterModel';
import { VehicleFactory, VehicleInstance } from '../game/vehicleModels';
import { WorldGenerator, GeneratedWorld } from '../game/worldGenerator';
import { GamePhysicsEngine } from '../game/physics';
import { soundFX } from '../audio/SoundFX';

interface GameCanvasProps {
  customization: CharacterCustomization;
  weather: WeatherType;
  gameTimeHours: number;
  activeMission: Mission | null;
  onUpdateStats: (updater: (prev: any) => any) => void;
  onOpenDialogue: (npc: NPCData) => void;
  onOpenWardrobe: () => void;
  onOpenCricket: () => void;
  onOpenMap: () => void;
  onMissionProgress: (missionId: string) => void;
  // State sync hooks to HUD
  onSyncState: (state: {
    playerX: number;
    playerZ: number;
    playerHeading: number;
    isDriving: boolean;
    vehicleType: string;
    isSitting: boolean;
    stamina: number;
    maxStamina: number;
    interactPrompt: string | null;
    nearVehiclePrompt: string | null;
  }) => void;
  // External triggers from HUD
  inputRef: React.MutableRefObject<{
    forward: number;
    strafe: number;
    jump: boolean;
    sprint: boolean;
  }>;
  actionTriggerRef: React.MutableRefObject<{
    interact: boolean;
    toggleVehicle: boolean;
    horn: boolean;
    spawnVehicleType: VehicleType | null;
    teleportTarget: [number, number] | null;
  }>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  customization,
  weather,
  gameTimeHours,
  activeMission,
  onUpdateStats,
  onOpenDialogue,
  onOpenWardrobe,
  onOpenCricket,
  onOpenMap,
  onMissionProgress,
  onSyncState,
  inputRef,
  actionTriggerRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterModelRef = useRef<CharacterModel | null>(null);
  const physicsRef = useRef<GamePhysicsEngine | null>(null);

  // Keep references to dynamic scene elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const vehiclesRef = useRef<VehicleInstance[]>([]);
  const worldRef = useRef<GeneratedWorld | null>(null);
  const rainSystemRef = useRef<THREE.Points | null>(null);

  // Update character visual customization when props change
  useEffect(() => {
    if (characterModelRef.current) {
      characterModelRef.current.applyCustomization(customization);
    }
  }, [customization]);

  // Main Three.js WebGL Engine Initialization & Simulation Loop
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // 1. Detect Software WebGL (SwiftShader / llvmpipe / WARP)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 3. Scene, Camera & Fog
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const skyColor = new THREE.Color('#38bdf8');
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2('#38bdf8', 0.0055);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.2,
      600
    );
    camera.position.set(-65, 3.5, 20);

    // 4. Mandatory Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Setup (Warm Key Light, Cool Sky Hemisphere Fill)
    const hemiLight = new THREE.HemisphereLight(0xfffaed, 0x1e3a8a, 1.2);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    dirLight.position.set(50, 100, 40);
    dirLight.castShadow = !isSoftwareGl;
    if (dirLight.castShadow) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 10;
      dirLight.shadow.camera.far = 280;
      const d = 60;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.bias = -0.0005;
      dirLight.shadow.normalBias = 0.02;
    }
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 6. Build Open World Geometry
    const world = WorldGenerator.buildWorld();
    worldRef.current = world;
    scene.add(world.sceneGroup);

    // 7. Build Main Character (14yo Pakistani boy with Shalwar Kameez)
    const character = new CharacterModel(customization);
    characterModelRef.current = character;
    scene.add(character.group);

    // 8. Spawn Initial Open-World Vehicles
    const vehicles: VehicleInstance[] = [];
    vehiclesRef.current = vehicles;

    // A. Rickshaw parked near Karak Chai Hotel
    const rickshaw = VehicleFactory.createRickshaw('#f59e0b');
    rickshaw.group.position.set(-73, 0, 18);
    rickshaw.group.rotation.y = 0.5;
    scene.add(rickshaw.group);
    vehicles.push(rickshaw);

    // B. Sedan Car parked on Canal Bridge Approach
    const car = VehicleFactory.createCar('#dc2626');
    car.group.position.set(-18, 0, 0);
    car.group.rotation.y = Math.PI / 2;
    scene.add(car.group);
    vehicles.push(car);

    // C. Motorbike parked in City Center
    const bike = VehicleFactory.createMotorcycle('#2563eb');
    bike.group.position.set(65, 0, 25);
    scene.add(bike.group);
    vehicles.push(bike);

    // D. Village Bicycle parked near Primary School
    const bicycle = VehicleFactory.createBicycle('#10b981');
    bicycle.group.position.set(-98, 0, 80);
    scene.add(bicycle.group);
    vehicles.push(bicycle);

    // 9. Rain Particle System
    const rainCount = 1800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 160;
      rainPos[i * 3 + 1] = Math.random() * 45;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: '#93c5fd',
      size: 0.22,
      transparent: true,
      opacity: 0.6,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);
    rainSystemRef.current = rainPoints;

    // 10. Initialize Physics Controller
    const physics = new GamePhysicsEngine(new THREE.Vector3(-65, 0, 15));
    physicsRef.current = physics;

    // 11. Touch Drag & Keyboard Input Listeners
    let isDraggingCamera = false;
    let prevTouchX = 0;
    let prevTouchY = 0;
    let touchStartDist = 0;

    const handlePointerDown = (e: PointerEvent) => {
      // Allow camera drag from right 70% of screen
      if (e.clientX > window.innerWidth * 0.25) {
        isDraggingCamera = true;
        prevTouchX = e.clientX;
        prevTouchY = e.clientY;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingCamera) return;
      const dx = e.clientX - prevTouchX;
      const dy = e.clientY - prevTouchY;
      prevTouchX = e.clientX;
      prevTouchY = e.clientY;

      physics.cameraYaw -= dx * 0.0055;
      physics.cameraPitch = THREE.MathUtils.clamp(
        physics.cameraPitch + dy * 0.004,
        -0.15,
        1.05
      );
    };

    const handlePointerUp = () => {
      isDraggingCamera = false;
    };

    const handleWheel = (e: WheelEvent) => {
      physics.cameraDistance = THREE.MathUtils.clamp(
        physics.cameraDistance + e.deltaY * 0.005,
        2.5,
        12.0
      );
    };

    // Keyboard support for desktop testing
    const keysDown: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDown[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown[e.key.toLowerCase()] = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 12. Main 60fps Game & Animation Loop
    let clock = new THREE.Clock();
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let crescentRotateTimer = 0;

    const gameTick = () => {
      const delta = Math.min(clock.getDelta(), 0.05);

      // 1. Process Desktop Keyboard inputs alongside Touch Joystick inputs
      let forwardInput = inputRef.current.forward;
      let strafeInput = inputRef.current.strafe;
      let jumpInput = inputRef.current.jump;
      let sprintInput = inputRef.current.sprint;

      if (keysDown['w'] || keysDown['e'] || keysDown['arrowup']) forwardInput = 1.0;
      if (keysDown['s'] || keysDown['arrowdown']) forwardInput = -1.0;
      if (keysDown['a'] || keysDown['arrowleft']) strafeInput = -1.0;
      if (keysDown['d'] || keysDown['arrowright']) strafeInput = 1.0;
      if (keysDown[' ']) jumpInput = true;
      if (keysDown['shift']) sprintInput = true;

      // External Spawn Vehicle trigger
      if (actionTriggerRef.current.spawnVehicleType) {
        const type = actionTriggerRef.current.spawnVehicleType;
        actionTriggerRef.current.spawnVehicleType = null;
        let newVeh: VehicleInstance;
        if (type === 'rickshaw') newVeh = VehicleFactory.createRickshaw('#f59e0b');
        else if (type === 'motorcycle') newVeh = VehicleFactory.createMotorcycle('#2563eb');
        else if (type === 'bicycle') newVeh = VehicleFactory.createBicycle('#10b981');
        else newVeh = VehicleFactory.createCar('#dc2626');

        // Position in front of player
        const spawnX = physics.state.position.x + Math.sin(physics.state.rotationY) * 3;
        const spawnZ = physics.state.position.z + Math.cos(physics.state.rotationY) * 3;
        newVeh.group.position.set(spawnX, 0, spawnZ);
        newVeh.group.rotation.y = physics.state.rotationY;
        scene.add(newVeh.group);
        vehicles.push(newVeh);

        // Mount directly
        physics.enterVehicle(newVeh, type);
      }

      // External Fast Travel / Teleport
      if (actionTriggerRef.current.teleportTarget) {
        const [tx, tz] = actionTriggerRef.current.teleportTarget;
        actionTriggerRef.current.teleportTarget = null;
        physics.state.position.set(tx, 0, tz);
        physics.state.velocity.set(0, 0, 0);
      }

      // External Vehicle Mount / Dismount Toggle
      if (actionTriggerRef.current.toggleVehicle || keysDown['f']) {
        actionTriggerRef.current.toggleVehicle = false;
        keysDown['f'] = false;
        if (physics.state.isDriving) {
          physics.exitVehicle();
        } else if (physics.state.nearVehicle) {
          const veh = physics.state.nearVehicle;
          physics.enterVehicle(veh, veh.type);
        }
      }

      // External Horn Honk
      if (actionTriggerRef.current.horn || keysDown['h']) {
        actionTriggerRef.current.horn = false;
        keysDown['h'] = false;
        if (physics.state.isDriving) {
          soundFX.playHorn(physics.state.activeVehicleType as any);
        }
      }

      // External Interaction (Talk / Sit / Shop / Collect)
      if (actionTriggerRef.current.interact || keysDown['e']) {
        actionTriggerRef.current.interact = false;
        keysDown['e'] = false;
        const spot = physics.state.nearInteractive;
        if (spot) {
          if (spot.type === 'npc' && spot.data) {
            onOpenDialogue(spot.data as NPCData);
          } else if (spot.type === 'shop') {
            if (spot.id === 'chai_dhabba_interact') {
              soundFX.playCoin();
              physics.state.stamina = physics.state.maxStamina; // boost stamina!
            } else if (spot.id === 'map17_billboard_spot') {
              soundFX.playTalk();
              onOpenMap();
            } else {
              onOpenWardrobe();
            }
          } else if (spot.type === 'sit') {
            physics.state.isSitting = !physics.state.isSitting;
          } else if (spot.type === 'crescent') {
            // Collect crescent relic!
            soundFX.playCoin();
            onUpdateStats((prev) => ({
              ...prev,
              coins: prev.coins + 50,
              crescentsFound: Math.min(7, prev.crescentsFound + 1),
            }));
            // Remove crescent from world
            const idx = world.interactiveSpots.findIndex((s) => s.id === spot.id);
            if (idx !== -1) world.interactiveSpots.splice(idx, 1);
            onMissionProgress('quest_crescent_hunt');
          } else if (spot.type === 'cricket') {
            onOpenCricket();
          }
        }
      }

      // 2. Physics & Player Update
      physics.update(
        delta,
        { forward: forwardInput, strafe: strafeInput, jump: jumpInput, sprint: sprintInput },
        world.colliders,
        world.interactiveSpots,
        vehicles
      );

      // 3. Update Character 3D Position & Bones Animation
      if (physics.state.isDriving && physics.state.activeVehicle) {
        // Place character inside vehicle driver seat
        const v = physics.state.activeVehicle;
        character.group.position.copy(v.group.position).add(v.driverSeatOffset);
        character.group.rotation.y = v.group.rotation.y;
        character.updateAnimation('drive', delta);
      } else {
        character.group.position.set(
          physics.state.position.x,
          physics.state.position.y,
          physics.state.position.z
        );
        character.group.rotation.y = physics.state.rotationY;

        let animState: 'idle' | 'walk' | 'run' | 'jump' | 'sit' = 'idle';
        if (physics.state.isSitting) animState = 'sit';
        else if (!physics.state.isGrounded) animState = 'jump';
        else if (Math.hypot(physics.state.velocity.x, physics.state.velocity.z) > 0.5) {
          animState = physics.state.isSprinting ? 'run' : 'walk';
        }
        character.updateAnimation(animState, delta);
      }

      // 4. Update Camera
      physics.updateCamera(camera, delta);

      // 5. Spin Collectible Crescent Relics
      crescentRotateTimer += delta * 2.5;
      world.crescents.forEach((c) => {
        c.rotation.y = crescentRotateTimer;
      });

      // 6. Rain System Update
      if (rainPoints.visible) {
        const positions = rainGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < rainCount; i++) {
          positions[i * 3 + 1] -= delta * 32;
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 45;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
        rainPoints.position.set(physics.state.position.x, 0, physics.state.position.z);
      }

      // 7. Check active mission completion if reached waypoint
      if (activeMission && !activeMission.completed) {
        const dist = Math.hypot(
          physics.state.position.x - activeMission.targetPosition[0],
          physics.state.position.z - activeMission.targetPosition[2]
        );
        if (dist <= activeMission.targetRadius) {
          onMissionProgress(activeMission.id);
        }
      }

      // 8. Sync state with React HUD (throttled to save CPU)
      const nearSpot = physics.state.nearInteractive;
      const nearVeh = physics.state.nearVehicle;

      onSyncState({
        playerX: physics.state.position.x,
        playerZ: physics.state.position.z,
        playerHeading: -physics.cameraYaw,
        isDriving: physics.state.isDriving,
        vehicleType: physics.state.activeVehicleType,
        isSitting: physics.state.isSitting,
        stamina: physics.state.stamina,
        maxStamina: physics.state.maxStamina,
        interactPrompt: nearSpot ? nearSpot.prompt : null,
        nearVehiclePrompt: nearVeh
          ? `Mount ${nearVeh.type.toUpperCase()}`
          : null,
      });

      // Render
      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(gameTick);
      else frameId = requestAnimationFrame(gameTick);
    };

    frameId = requestAnimationFrame(gameTick);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update dynamic weather and Day/Night Sky & Lighting
  useEffect(() => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current) return;
    const scene = sceneRef.current;
    const dir = dirLightRef.current;
    const hemi = hemiLightRef.current;

    // Day / Night interpolation
    const isNight = gameTimeHours < 5 || gameTimeHours >= 19.5;
    const isSunset = gameTimeHours >= 17 && gameTimeHours < 19.5;
    const isDawn = gameTimeHours >= 5 && gameTimeHours < 7.5;

    let skyHex = '#38bdf8'; // Crisp day sky
    let dirIntensity = 2.2;
    let hemiIntensity = 1.2;

    if (isNight) {
      skyHex = '#050b14'; // Midnight starry sky
      dirIntensity = 0.35;
      hemiIntensity = 0.25;
      dir.color.set('#38bdf8');
    } else if (isSunset) {
      skyHex = '#ea580c'; // Vibrant Pakistani dusk
      dirIntensity = 1.6;
      hemiIntensity = 0.9;
      dir.color.set('#f59e0b');
    } else if (isDawn) {
      skyHex = '#fdba74';
      dirIntensity = 1.8;
      hemiIntensity = 1.0;
      dir.color.set('#fde047');
    } else {
      skyHex = weather === 'cloudy' ? '#94a3b8' : '#38bdf8';
      dirIntensity = weather === 'rainy' ? 1.0 : 2.2;
      hemiIntensity = weather === 'rainy' ? 0.6 : 1.2;
      dir.color.set('#ffffff');
    }

    scene.background = new THREE.Color(skyHex);
    if (scene.fog) {
      scene.fog.color = new THREE.Color(skyHex);
    }
    dir.intensity = dirIntensity;
    hemi.intensity = hemiIntensity;

    // Rain System Toggle
    if (rainSystemRef.current) {
      const isRain = weather === 'rainy';
      rainSystemRef.current.visible = isRain;
      soundFX.setRainActive(isRain);
    }

    // Street Lamps Intensity
    if (worldRef.current) {
      const lampInt = isNight ? 2.5 : isSunset ? 1.2 : 0;
      worldRef.current.streetLamps.forEach((lamp) => {
        lamp.intensity = lampInt;
      });
    }
  }, [weather, gameTimeHours]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full absolute inset-0 overflow-hidden select-none touch-none"
    />
  );
};
