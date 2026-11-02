/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VehicleType } from '../types/game';
import { ProceduralTextureFactory } from './proceduralTextures';

export interface VehicleInstance {
  type: VehicleType;
  group: THREE.Group;
  steerNodes: THREE.Object3D[];
  wheelMeshes: THREE.Mesh[];
  headlightLeft?: THREE.SpotLight;
  headlightRight?: THREE.SpotLight;
  driverSeatOffset: THREE.Vector3;
}

export class VehicleFactory {
  // 1. Traditional Pakistani Auto-Rickshaw (Chingchi / Tuk-Tuk) with Truck Art
  public static createRickshaw(color: string = '#f59e0b'): VehicleInstance {
    const group = new THREE.Group();
    const steerNodes: THREE.Object3D[] = [];
    const wheelMeshes: THREE.Mesh[] = [];

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.35,
      metalness: 0.25,
    });
    const truckArtMat = new THREE.MeshStandardMaterial({
      map: ProceduralTextureFactory.createTruckArtTexture(),
      roughness: 0.4,
      metalness: 0.1,
    });
    const blackRubberMat = new THREE.MeshStandardMaterial({
      color: '#1c1917',
      roughness: 0.85,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.85,
      roughness: 0.15,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: '#047857', // Pakistani Green canopy roof
      roughness: 0.9,
    });

    // Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(1.4, 0.25, 2.4);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.42;
    chassis.castShadow = true;
    group.add(chassis);

    // Truck Art Side Decal Panels
    const sideArtGeo = new THREE.BoxGeometry(1.42, 0.45, 1.4);
    const sideArt = new THREE.Mesh(sideArtGeo, truckArtMat);
    sideArt.position.set(0, 0.72, -0.2);
    sideArt.castShadow = true;
    group.add(sideArt);

    // Front Nose / Cowling
    const noseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 8);
    noseGeo.rotateZ(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.65, 0.95);
    nose.castShadow = true;
    group.add(nose);

    // Windshield frame & Glass
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#bae6fd',
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
    });
    const windshieldGeo = new THREE.BoxGeometry(1.1, 0.55, 0.05);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.25, 0.8);
    windshield.rotation.x = -0.15;
    group.add(windshield);

    // Curved Canvas Canopy Roof
    const roofGeo = new THREE.BoxGeometry(1.45, 0.08, 2.3);
    const roof = new THREE.Mesh(roofGeo, canopyMat);
    roof.position.set(0, 1.68, -0.05);
    roof.castShadow = true;
    group.add(roof);

    // Canopy Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8);
    const p1 = new THREE.Mesh(pillarGeo, chromeMat);
    p1.position.set(0.65, 1.15, -1.05);
    group.add(p1);
    const p2 = new THREE.Mesh(pillarGeo, chromeMat);
    p2.position.set(-0.65, 1.15, -1.05);
    group.add(p2);

    // Passenger Bench
    const seatMat = new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 0.8 });
    const seatGeo = new THREE.BoxGeometry(1.25, 0.22, 0.55);
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(0, 0.65, -0.55);
    group.add(seat);

    // Driver Saddle
    const driverSeatGeo = new THREE.BoxGeometry(0.45, 0.15, 0.4);
    const driverSeat = new THREE.Mesh(driverSeatGeo, seatMat);
    driverSeat.position.set(0, 0.62, 0.35);
    group.add(driverSeat);

    // Handlebar & Front Wheel Fork (Steers)
    const forkGroup = new THREE.Group();
    forkGroup.position.set(0, 0.3, 1.05);
    group.add(forkGroup);
    steerNodes.push(forkGroup);

    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8);
    handleGeo.rotateZ(Math.PI / 2);
    const handlebar = new THREE.Mesh(handleGeo, chromeMat);
    handlebar.position.set(0, 0.55, 0);
    forkGroup.add(handlebar);

    // Front Wheel (single 3-wheeler front tire)
    const tireGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const frontWheel = new THREE.Mesh(tireGeo, blackRubberMat);
    frontWheel.position.set(0, 0, 0);
    frontWheel.castShadow = true;
    forkGroup.add(frontWheel);
    wheelMeshes.push(frontWheel);

    // Rear Wheels (Left & Right)
    const rearLeftWheel = new THREE.Mesh(tireGeo, blackRubberMat);
    rearLeftWheel.position.set(0.68, 0.24, -0.75);
    rearLeftWheel.castShadow = true;
    group.add(rearLeftWheel);
    wheelMeshes.push(rearLeftWheel);

    const rearRightWheel = new THREE.Mesh(tireGeo, blackRubberMat);
    rearRightWheel.position.set(-0.68, 0.24, -0.75);
    rearRightWheel.castShadow = true;
    group.add(rearRightWheel);
    wheelMeshes.push(rearRightWheel);

    // Front Headlight with SpotLight
    const lightGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const lightMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: '#fef08a',
      emissiveIntensity: 0.8,
    });
    const headlightMesh = new THREE.Mesh(lightGeo, lightMat);
    headlightMesh.position.set(0, 0.68, 1.25);
    group.add(headlightMesh);

    const spot = new THREE.SpotLight(0xfffaed, 2.5, 30, Math.PI / 6, 0.4);
    spot.position.set(0, 0.7, 1.3);
    spot.target.position.set(0, 0.2, 15);
    group.add(spot);
    group.add(spot.target);

    return {
      type: 'rickshaw',
      group,
      steerNodes,
      wheelMeshes,
      headlightLeft: spot,
      driverSeatOffset: new THREE.Vector3(0, 0.62, 0.35),
    };
  }

  // 2. Realistic Modern Sports Sedan Car (Chak 17 G Edition)
  public static createCar(color: string = '#dc2626'): VehicleInstance {
    const group = new THREE.Group();
    const steerNodes: THREE.Object3D[] = [];
    const wheelMeshes: THREE.Mesh[] = [];

    // Automotive Materials with Realistic Clearcoat & Reflections
    const paintMat = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.85,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
    });
    const blackTrimMat = new THREE.MeshStandardMaterial({
      color: '#111827',
      roughness: 0.8,
      metalness: 0.2,
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: '#18181b',
      roughness: 0.5,
      metalness: 0.6,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      metalness: 0.95,
      roughness: 0.1,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#0f172a',
      transparent: true,
      opacity: 0.65,
      roughness: 0.05,
      metalness: 0.1,
    });
    const tireRubberMat = new THREE.MeshStandardMaterial({
      color: '#1c1917',
      roughness: 0.9,
      metalness: 0.05,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: '#e2e8f0',
      metalness: 0.9,
      roughness: 0.15,
    });
    const brakeCaliperMat = new THREE.MeshStandardMaterial({
      color: '#ef4444', // Red Brembo style
      metalness: 0.5,
      roughness: 0.3,
    });
    const brakeDiscMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      metalness: 0.9,
      roughness: 0.25,
    });

    // 1. Lower Chassis & Aerodynamic Floor
    const chassisGeo = new THREE.BoxGeometry(1.92, 0.22, 4.4);
    const chassis = new THREE.Mesh(chassisGeo, carbonMat);
    chassis.position.y = 0.32;
    chassis.castShadow = true;
    group.add(chassis);

    // Front Splitter / Lip
    const splitterGeo = new THREE.BoxGeometry(1.88, 0.08, 0.4);
    const splitter = new THREE.Mesh(splitterGeo, carbonMat);
    splitter.position.set(0, 0.24, 2.22);
    group.add(splitter);

    // 2. Sculpted Main Body (Waistline & Side Skirts)
    const lowerBodyGeo = new THREE.BoxGeometry(1.90, 0.46, 4.3);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, paintMat);
    lowerBody.position.y = 0.54;
    lowerBody.castShadow = true;
    group.add(lowerBody);

    // Aerodynamic Sloped Hood
    const hoodGeo = new THREE.BoxGeometry(1.78, 0.16, 1.35);
    const hood = new THREE.Mesh(hoodGeo, paintMat);
    hood.position.set(0, 0.74, 1.4);
    hood.rotation.x = -0.09;
    hood.castShadow = true;
    group.add(hood);

    // Front Honeycomb Bumper & Grille
    const bumperGeo = new THREE.BoxGeometry(1.86, 0.36, 0.3);
    const bumper = new THREE.Mesh(bumperGeo, paintMat);
    bumper.position.set(0, 0.48, 2.15);
    group.add(bumper);

    const grilleGeo = new THREE.BoxGeometry(1.2, 0.22, 0.05);
    const grille = new THREE.Mesh(grilleGeo, blackTrimMat);
    grille.position.set(0, 0.46, 2.31);
    group.add(grille);

    // Chrome Grille Trim / Emblem
    const emblemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12);
    emblemGeo.rotateX(Math.PI / 2);
    const emblem = new THREE.Mesh(emblemGeo, chromeMat);
    emblem.position.set(0, 0.52, 2.34);
    group.add(emblem);

    // 3. Cabin & Curved Roofline (Sedan Coupe Fastback)
    const cabinGeo = new THREE.BoxGeometry(1.58, 0.52, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, paintMat);
    cabin.position.set(0, 1.05, -0.15);
    cabin.castShadow = true;
    group.add(cabin);

    // Sloped Front Windshield
    const frontWindshieldGeo = new THREE.BoxGeometry(1.52, 0.54, 0.04);
    const frontWindshield = new THREE.Mesh(frontWindshieldGeo, glassMat);
    frontWindshield.position.set(0, 1.02, 0.94);
    frontWindshield.rotation.x = -0.62;
    group.add(frontWindshield);

    // Sloped Rear Windshield
    const rearWindshield = new THREE.Mesh(frontWindshieldGeo, glassMat);
    rearWindshield.position.set(0, 1.02, -1.24);
    rearWindshield.rotation.x = 0.58;
    group.add(rearWindshield);

    // Side Windows (Left & Right Glass Panels)
    const sideGlassGeo = new THREE.BoxGeometry(0.04, 0.38, 1.85);
    const leftSideGlass = new THREE.Mesh(sideGlassGeo, glassMat);
    leftSideGlass.position.set(0.78, 1.02, -0.15);
    group.add(leftSideGlass);

    const rightSideGlass = new THREE.Mesh(sideGlassGeo, glassMat);
    rightSideGlass.position.set(-0.78, 1.02, -0.15);
    group.add(rightSideGlass);

    // Roof Pillars (A-Pillars & C-Pillars)
    const pillarGeo = new THREE.BoxGeometry(0.08, 0.52, 0.08);
    const pillarAL = new THREE.Mesh(pillarGeo, paintMat);
    pillarAL.position.set(0.76, 1.02, 0.88);
    pillarAL.rotation.x = -0.55;
    group.add(pillarAL);
    const pillarAR = new THREE.Mesh(pillarGeo, paintMat);
    pillarAR.position.set(-0.76, 1.02, 0.88);
    pillarAR.rotation.x = -0.55;
    group.add(pillarAR);

    // 4. Rear Trunk, Spoiler & Diffuser
    const trunkGeo = new THREE.BoxGeometry(1.78, 0.22, 0.85);
    const trunk = new THREE.Mesh(trunkGeo, paintMat);
    trunk.position.set(0, 0.72, -1.72);
    trunk.castShadow = true;
    group.add(trunk);

    // Rear Aerodynamic Spoiler Wing
    const wingGeo = new THREE.BoxGeometry(1.65, 0.05, 0.28);
    const wing = new THREE.Mesh(wingGeo, carbonMat);
    wing.position.set(0, 0.96, -2.12);
    group.add(wing);

    const wingPostGeo = new THREE.BoxGeometry(0.06, 0.16, 0.06);
    const wp1 = new THREE.Mesh(wingPostGeo, carbonMat);
    wp1.position.set(0.55, 0.86, -2.12);
    group.add(wp1);
    const wp2 = new THREE.Mesh(wingPostGeo, carbonMat);
    wp2.position.set(-0.55, 0.86, -2.12);
    group.add(wp2);

    // Rear Dual Chrome Exhaust Tips
    const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
    exhaustGeo.rotateX(Math.PI / 2);
    const exLeft = new THREE.Mesh(exhaustGeo, chromeMat);
    exLeft.position.set(0.62, 0.32, -2.25);
    group.add(exLeft);
    const exRight = new THREE.Mesh(exhaustGeo, chromeMat);
    exRight.position.set(-0.62, 0.32, -2.25);
    group.add(exRight);

    // 5. Realistic Side Mirrors & Door Handles
    const mirrorGeo = new THREE.BoxGeometry(0.24, 0.12, 0.14);
    const mirrorL = new THREE.Mesh(mirrorGeo, paintMat);
    mirrorL.position.set(0.92, 0.96, 0.75);
    group.add(mirrorL);
    const mirrorR = new THREE.Mesh(mirrorGeo, paintMat);
    mirrorR.position.set(-0.92, 0.96, 0.75);
    group.add(mirrorR);

    // Mirror indicator strips
    const indGeo = new THREE.BoxGeometry(0.18, 0.03, 0.03);
    const indMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
    const indL = new THREE.Mesh(indGeo, indMat);
    indL.position.set(0.92, 0.96, 0.83);
    group.add(indL);
    const indR = new THREE.Mesh(indGeo, indMat);
    indR.position.set(-0.92, 0.96, 0.83);
    group.add(indR);

    // 6. Angled LED Daytime Running Headlights (Realistic Projector Housing)
    const headlampHousingGeo = new THREE.BoxGeometry(0.42, 0.14, 0.12);
    const headHousingMat = new THREE.MeshStandardMaterial({
      color: '#f8fafc',
      emissive: '#f8fafc',
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });

    const leftHeadlight = new THREE.Mesh(headlampHousingGeo, headHousingMat);
    leftHeadlight.position.set(0.68, 0.62, 2.14);
    leftHeadlight.rotation.y = -0.15;
    leftHeadlight.rotation.z = -0.05;
    group.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlampHousingGeo, headHousingMat);
    rightHeadlight.position.set(-0.68, 0.62, 2.14);
    rightHeadlight.rotation.y = 0.15;
    rightHeadlight.rotation.z = 0.05;
    group.add(rightHeadlight);

    // Fog Lamps in Lower Bumper
    const fogGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10);
    fogGeo.rotateX(Math.PI / 2);
    const fogL = new THREE.Mesh(fogGeo, headHousingMat);
    fogL.position.set(0.72, 0.36, 2.25);
    group.add(fogL);
    const fogR = new THREE.Mesh(fogGeo, headHousingMat);
    fogR.position.set(-0.72, 0.36, 2.25);
    group.add(fogR);

    // 7. Wraparound LED Taillights & Rear Number Plate
    const taillightGeo = new THREE.BoxGeometry(0.44, 0.14, 0.08);
    const taillightMat = new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#ef4444',
      emissiveIntensity: 0.9,
    });

    const leftTail = new THREE.Mesh(taillightGeo, taillightMat);
    leftTail.position.set(0.68, 0.65, -2.18);
    leftTail.rotation.y = 0.15;
    group.add(leftTail);

    const rightTail = new THREE.Mesh(taillightGeo, taillightMat);
    rightTail.position.set(-0.68, 0.65, -2.18);
    rightTail.rotation.y = -0.15;
    group.add(rightTail);

    // Number Plate (Chak 17 G / Pakistan)
    const plateGeo = new THREE.BoxGeometry(0.45, 0.18, 0.02);
    const plateMat = new THREE.MeshStandardMaterial({ color: '#047857', roughness: 0.5 });
    const plateFront = new THREE.Mesh(plateGeo, plateMat);
    plateFront.position.set(0, 0.35, 2.31);
    group.add(plateFront);

    const plateRear = new THREE.Mesh(plateGeo, plateMat);
    plateRear.position.set(0, 0.46, -2.21);
    group.add(plateRear);

    // 8. High-Fidelity 3D Sports Wheels (Tires, Alloy Spoke Rims & Brake Calipers)
    const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 20);
    tireGeo.rotateZ(Math.PI / 2);

    const rimBaseGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.25, 16);
    rimBaseGeo.rotateZ(Math.PI / 2);

    const discGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.06, 12);
    discGeo.rotateZ(Math.PI / 2);

    const caliperGeo = new THREE.BoxGeometry(0.10, 0.12, 0.08);

    const buildRealisticWheel = (x: number, z: number, isFront: boolean) => {
      const wheelAssembly = new THREE.Group();
      wheelAssembly.position.set(x, 0.34, z);

      // Rubber Tire
      const tireMesh = new THREE.Mesh(tireGeo, tireRubberMat);
      tireMesh.castShadow = true;

      // Alloy Rim Hub
      const rimMesh = new THREE.Mesh(rimBaseGeo, rimMat);
      tireMesh.add(rimMesh);

      // 5 Twin-Spoke Alloy Pattern
      for (let s = 0; s < 5; s++) {
        const spokeGeo = new THREE.BoxGeometry(0.04, 0.22, 0.03);
        const spoke = new THREE.Mesh(spokeGeo, chromeMat);
        spoke.rotation.x = (s / 5) * Math.PI * 2;
        rimMesh.add(spoke);
      }

      // Center Chrome Lug Nut Cap
      const capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.26, 8);
      capGeo.rotateZ(Math.PI / 2);
      const cap = new THREE.Mesh(capGeo, chromeMat);
      rimMesh.add(cap);

      wheelAssembly.add(tireMesh);

      // Brake Disc & Caliper inside wheel
      const disc = new THREE.Mesh(discGeo, brakeDiscMat);
      wheelAssembly.add(disc);

      const caliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
      caliper.position.set(x > 0 ? -0.06 : 0.06, 0.08, 0);
      wheelAssembly.add(caliper);

      group.add(wheelAssembly);
      wheelMeshes.push(tireMesh);

      if (isFront) {
        steerNodes.push(wheelAssembly);
      }
      return wheelAssembly;
    };

    buildRealisticWheel(0.95, 1.25, true);
    buildRealisticWheel(-0.95, 1.25, true);
    buildRealisticWheel(0.95, -1.25, false);
    buildRealisticWheel(-0.95, -1.25, false);

    // High-Power Night Spotlights
    const spotL = new THREE.SpotLight(0xfffaed, 3.5, 45, Math.PI / 6, 0.25);
    spotL.position.set(0.68, 0.62, 2.2);
    spotL.target.position.set(0.68, 0.2, 25);
    group.add(spotL);
    group.add(spotL.target);

    return {
      type: 'car',
      group,
      steerNodes,
      wheelMeshes,
      headlightLeft: spotL,
      driverSeatOffset: new THREE.Vector3(-0.35, 0.72, 0.05),
    };
  }

  // 3. Motorcycle / Heavy Bike (Pakistani CD70 / Sport Roadster)
  public static createMotorcycle(color: string = '#2563eb'): VehicleInstance {
    const group = new THREE.Group();
    const steerNodes: THREE.Object3D[] = [];
    const wheelMeshes: THREE.Mesh[] = [];

    const paintMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.85, roughness: 0.15 });
    const darkMat = new THREE.MeshStandardMaterial({ color: '#171717', roughness: 0.8 });
    const tireMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.9 });

    // Chassis frame
    const frameGeo = new THREE.BoxGeometry(0.2, 0.25, 1.3);
    const frame = new THREE.Mesh(frameGeo, darkMat);
    frame.position.y = 0.55;
    group.add(frame);

    // Fuel Tank
    const tankGeo = new THREE.BoxGeometry(0.32, 0.25, 0.55);
    const tank = new THREE.Mesh(tankGeo, paintMat);
    tank.position.set(0, 0.76, 0.18);
    tank.castShadow = true;
    group.add(tank);

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.28, 0.14, 0.65);
    const seat = new THREE.Mesh(seatGeo, darkMat);
    seat.position.set(0, 0.72, -0.32);
    group.add(seat);

    // Engine Block & Chrome Exhaust Pipe
    const engineGeo = new THREE.BoxGeometry(0.28, 0.28, 0.35);
    const engine = new THREE.Mesh(engineGeo, chromeMat);
    engine.position.set(0, 0.38, 0.05);
    group.add(engine);

    const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
    pipeGeo.rotateX(Math.PI / 2);
    const pipe = new THREE.Mesh(pipeGeo, chromeMat);
    pipe.position.set(0.18, 0.28, -0.35);
    group.add(pipe);

    // Steering Fork & Front Wheel
    const fork = new THREE.Group();
    fork.position.set(0, 0.32, 0.82);
    group.add(fork);
    steerNodes.push(fork);

    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8);
    handleGeo.rotateZ(Math.PI / 2);
    const handle = new THREE.Mesh(handleGeo, chromeMat);
    handle.position.set(0, 0.62, 0);
    fork.add(handle);

    // Front Headlight
    const headGeo = new THREE.SphereGeometry(0.08, 10, 10);
    const headMat = new THREE.MeshStandardMaterial({ color: '#fef08a', emissive: '#fef08a', emissiveIntensity: 0.9 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.set(0, 0.58, 0.1);
    fork.add(headMesh);

    const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16);
    tireGeo.rotateZ(Math.PI / 2);

    const fTire = new THREE.Mesh(tireGeo, tireMat);
    fTire.castShadow = true;
    fork.add(fTire);
    wheelMeshes.push(fTire);

    // Rear Wheel
    const rTire = new THREE.Mesh(tireGeo, tireMat);
    rTire.position.set(0, 0.28, -0.68);
    rTire.castShadow = true;
    group.add(rTire);
    wheelMeshes.push(rTire);

    const spot = new THREE.SpotLight(0xfffaed, 2.5, 30, Math.PI / 6, 0.4);
    spot.position.set(0, 0.9, 0.95);
    spot.target.position.set(0, 0.2, 15);
    group.add(spot);
    group.add(spot.target);

    return {
      type: 'motorcycle',
      group,
      steerNodes,
      wheelMeshes,
      headlightLeft: spot,
      driverSeatOffset: new THREE.Vector3(0, 0.68, -0.2),
    };
  }

  // 4. Village Sports Bicycle
  public static createBicycle(color: string = '#10b981'): VehicleInstance {
    const group = new THREE.Group();
    const steerNodes: THREE.Object3D[] = [];
    const wheelMeshes: THREE.Mesh[] = [];

    const frameMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
    const tireMat = new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.9 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: '#e4e4e7', metalness: 0.8 });

    // Frame tubes
    const tubeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6);
    const tube1 = new THREE.Mesh(tubeGeo, frameMat);
    tube1.position.set(0, 0.55, 0.05);
    tube1.rotation.x = 0.55;
    group.add(tube1);

    const saddleGeo = new THREE.BoxGeometry(0.18, 0.06, 0.22);
    const saddle = new THREE.Mesh(saddleGeo, new THREE.MeshStandardMaterial({ color: '#18181b' }));
    saddle.position.set(0, 0.78, -0.2);
    group.add(saddle);

    // Front fork & handlebars
    const fork = new THREE.Group();
    fork.position.set(0, 0.32, 0.6);
    group.add(fork);
    steerNodes.push(fork);

    const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.55, 6);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, chromeMat);
    bar.position.set(0, 0.58, 0);
    fork.add(bar);

    const tireGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
    tireGeo.rotateZ(Math.PI / 2);

    const fTire = new THREE.Mesh(tireGeo, tireMat);
    fTire.castShadow = true;
    fork.add(fTire);
    wheelMeshes.push(fTire);

    const rTire = new THREE.Mesh(tireGeo, tireMat);
    rTire.position.set(0, 0.3, -0.55);
    rTire.castShadow = true;
    group.add(rTire);
    wheelMeshes.push(rTire);

    return {
      type: 'bicycle',
      group,
      steerNodes,
      wheelMeshes,
      driverSeatOffset: new THREE.Vector3(0, 0.72, -0.15),
    };
  }
}
