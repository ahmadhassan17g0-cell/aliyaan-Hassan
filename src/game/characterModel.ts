/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterCustomization } from '../types/game';

// Multi-part procedural 3D model for 14-year-old Pakistani boy with Shalwar Kameez
export class CharacterModel {
  public group: THREE.Group;

  // Hierarchical limbs for procedural skeletal animation
  private rootBone: THREE.Group;
  private spineBone: THREE.Group;
  private headBone: THREE.Group;
  private leftArmBone: THREE.Group;
  private rightArmBone: THREE.Group;
  private leftLegBone: THREE.Group;
  private rightLegBone: THREE.Group;
  private lowerKameez: THREE.Mesh;

  // Customization mesh groups
  private hairGroup: THREE.Group;
  private headwearGroup: THREE.Group;
  private glassesMesh: THREE.Mesh | null = null;
  private watchMesh: THREE.Mesh | null = null;
  private cricketBatMesh: THREE.Group | null = null;

  // Materials
  private skinMaterial: THREE.MeshStandardMaterial;
  private kameezMaterial: THREE.MeshStandardMaterial;
  private trimMaterial: THREE.MeshStandardMaterial;
  private shalwarMaterial: THREE.MeshStandardMaterial;
  private hairMaterial: THREE.MeshStandardMaterial;
  private headwearMaterial: THREE.MeshStandardMaterial;
  private footwearMaterial: THREE.MeshStandardMaterial;

  // Animation cycle tracker
  private animTimer: number = 0;

  constructor(customization: CharacterCustomization) {
    this.group = new THREE.Group();

    // 1. Initialize PBR Materials
    this.skinMaterial = new THREE.MeshStandardMaterial({
      color: customization.skinTone,
      roughness: 0.65,
      metalness: 0.05,
    });

    this.kameezMaterial = new THREE.MeshStandardMaterial({
      color: customization.outfitColor,
      roughness: 0.75,
      metalness: 0.05,
    });

    this.trimMaterial = new THREE.MeshStandardMaterial({
      color: customization.outfitSecondaryColor,
      roughness: 0.5,
      metalness: 0.3,
    });

    this.shalwarMaterial = new THREE.MeshStandardMaterial({
      color: customization.outfitColor, // matches or complements kameez
      roughness: 0.85,
      metalness: 0.02,
    });

    this.hairMaterial = new THREE.MeshStandardMaterial({
      color: '#1a1818',
      roughness: 0.8,
      metalness: 0.1,
    });

    this.headwearMaterial = new THREE.MeshStandardMaterial({
      color: '#b45309',
      roughness: 0.7,
      metalness: 0.15,
    });

    this.footwearMaterial = new THREE.MeshStandardMaterial({
      color: '#451a03', // Traditional deep brown leather
      roughness: 0.55,
      metalness: 0.1,
    });

    // 2. Build Multi-Part Hierarchical Skeleton (Height: ~1.55m for 14yo boy)
    this.rootBone = new THREE.Group();
    this.rootBone.position.y = 0.82; // Pelvis height
    this.group.add(this.rootBone);

    // Pelvis & Kameez waist
    const pelvisGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.18, 12);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, this.kameezMaterial);
    pelvisMesh.castShadow = true;
    this.rootBone.add(pelvisMesh);

    // Lower Kameez flared skirt (falls to knees)
    const lowerKameezGeo = new THREE.CylinderGeometry(0.20, 0.25, 0.38, 12, 1, true);
    this.lowerKameez = new THREE.Mesh(lowerKameezGeo, this.kameezMaterial);
    this.lowerKameez.position.y = -0.22;
    this.lowerKameez.castShadow = true;
    this.rootBone.add(this.lowerKameez);

    // Spine & Torso
    this.spineBone = new THREE.Group();
    this.spineBone.position.y = 0.10;
    this.rootBone.add(this.spineBone);

    const chestGeo = new THREE.CylinderGeometry(0.21, 0.18, 0.36, 12);
    const chestMesh = new THREE.Mesh(chestGeo, this.kameezMaterial);
    chestMesh.position.y = 0.18;
    chestMesh.castShadow = true;
    this.spineBone.add(chestMesh);

    // Pakistani Kurta Collar & Placket (Patti with buttons)
    const collarGeo = new THREE.CylinderGeometry(0.11, 0.12, 0.08, 10, 1, true);
    const collarMesh = new THREE.Mesh(collarGeo, this.trimMaterial);
    collarMesh.position.y = 0.36;
    this.spineBone.add(collarMesh);

    const placketGeo = new THREE.BoxGeometry(0.045, 0.22, 0.02);
    const placketMesh = new THREE.Mesh(placketGeo, this.trimMaterial);
    placketMesh.position.set(0, 0.24, 0.20);
    this.spineBone.add(placketMesh);

    // Head Bone & Neck
    this.headBone = new THREE.Group();
    this.headBone.position.y = 0.42;
    this.spineBone.add(this.headBone);

    const neckGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.10, 10);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMaterial);
    neckMesh.position.y = 0.04;
    this.headBone.add(neckMesh);

    // Cartoon-realistic Head (stylized youthful proportions)
    const headGeo = new THREE.SphereGeometry(0.17, 16, 16);
    headGeo.scale(0.9, 1.05, 0.95);
    const headMesh = new THREE.Mesh(headGeo, this.skinMaterial);
    headMesh.position.y = 0.18;
    headMesh.castShadow = true;
    this.headBone.add(headMesh);

    // Expressive cartoon Eyes
    const eyeWhiteGeo = new THREE.SphereGeometry(0.035, 12, 12);
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });

    const leftEye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    leftEye.position.set(0.06, 0.19, 0.14);
    this.headBone.add(leftEye);

    const rightEye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
    rightEye.position.set(-0.06, 0.19, 0.14);
    this.headBone.add(rightEye);

    // Dark pupils
    const pupilGeo = new THREE.SphereGeometry(0.02, 10, 10);
    const pupilMat = new THREE.MeshBasicMaterial({ color: '#171717' });
    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(0.06, 0.19, 0.165);
    this.headBone.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(-0.06, 0.19, 0.165);
    this.headBone.add(rightPupil);

    // Eyebrows
    const browGeo = new THREE.BoxGeometry(0.065, 0.015, 0.02);
    const leftBrow = new THREE.Mesh(browGeo, this.hairMaterial);
    leftBrow.position.set(0.065, 0.23, 0.145);
    leftBrow.rotation.z = -0.1;
    this.headBone.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, this.hairMaterial);
    rightBrow.position.set(-0.065, 0.23, 0.145);
    rightBrow.rotation.z = 0.1;
    this.headBone.add(rightBrow);

    // Hair Group & Headwear
    this.hairGroup = new THREE.Group();
    this.headBone.add(this.hairGroup);
    this.headwearGroup = new THREE.Group();
    this.headBone.add(this.headwearGroup);

    // 3. Left Arm
    this.leftArmBone = new THREE.Group();
    this.leftArmBone.position.set(0.24, 0.32, 0);
    this.spineBone.add(this.leftArmBone);

    const sleeveGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.26, 10);
    const leftSleeve = new THREE.Mesh(sleeveGeo, this.kameezMaterial);
    leftSleeve.position.y = -0.13;
    leftSleeve.castShadow = true;
    this.leftArmBone.add(leftSleeve);

    const forearmGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.24, 10);
    const leftForearm = new THREE.Mesh(forearmGeo, this.skinMaterial);
    leftForearm.position.y = -0.36;
    leftForearm.castShadow = true;
    this.leftArmBone.add(leftForearm);

    const handGeo = new THREE.SphereGeometry(0.045, 10, 10);
    const leftHand = new THREE.Mesh(handGeo, this.skinMaterial);
    leftHand.position.y = -0.48;
    this.leftArmBone.add(leftHand);

    // 4. Right Arm
    this.rightArmBone = new THREE.Group();
    this.rightArmBone.position.set(-0.24, 0.32, 0);
    this.spineBone.add(this.rightArmBone);

    const rightSleeve = new THREE.Mesh(sleeveGeo, this.kameezMaterial);
    rightSleeve.position.y = -0.13;
    rightSleeve.castShadow = true;
    this.rightArmBone.add(rightSleeve);

    const rightForearm = new THREE.Mesh(forearmGeo, this.skinMaterial);
    rightForearm.position.y = -0.36;
    rightForearm.castShadow = true;
    this.rightArmBone.add(rightForearm);

    const rightHand = new THREE.Mesh(handGeo, this.skinMaterial);
    rightHand.position.y = -0.48;
    this.rightArmBone.add(rightHand);

    // 5. Left Leg (Flared Pakistani Shalwar)
    this.leftLegBone = new THREE.Group();
    this.leftLegBone.position.set(0.12, -0.05, 0);
    this.rootBone.add(this.leftLegBone);

    const shalwarThighGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.38, 12);
    const leftThigh = new THREE.Mesh(shalwarThighGeo, this.shalwarMaterial);
    leftThigh.position.y = -0.19;
    leftThigh.castShadow = true;
    this.leftLegBone.add(leftThigh);

    const shalwarCalfGeo = new THREE.CylinderGeometry(0.11, 0.075, 0.38, 12);
    const leftCalf = new THREE.Mesh(shalwarCalfGeo, this.shalwarMaterial);
    leftCalf.position.y = -0.54;
    leftCalf.castShadow = true;
    this.leftLegBone.add(leftCalf);

    // Foot (Peshawari Chappal / shoe)
    const footGeo = new THREE.BoxGeometry(0.09, 0.05, 0.18);
    const leftFoot = new THREE.Mesh(footGeo, this.footwearMaterial);
    leftFoot.position.set(0, -0.74, 0.04);
    leftFoot.castShadow = true;
    this.leftLegBone.add(leftFoot);

    // 6. Right Leg
    this.rightLegBone = new THREE.Group();
    this.rightLegBone.position.set(-0.12, -0.05, 0);
    this.rootBone.add(this.rightLegBone);

    const rightThigh = new THREE.Mesh(shalwarThighGeo, this.shalwarMaterial);
    rightThigh.position.y = -0.19;
    rightThigh.castShadow = true;
    this.rightLegBone.add(rightThigh);

    const rightCalf = new THREE.Mesh(shalwarCalfGeo, this.shalwarMaterial);
    rightCalf.position.y = -0.54;
    rightCalf.castShadow = true;
    this.rightLegBone.add(rightCalf);

    const rightFoot = new THREE.Mesh(footGeo, this.footwearMaterial);
    rightFoot.position.set(0, -0.74, 0.04);
    rightFoot.castShadow = true;
    this.rightLegBone.add(rightFoot);

    // Ground shadow contact disc
    const shadowGeo = new THREE.CircleGeometry(0.35, 16);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.02;
    this.group.add(shadowMesh);

    // Apply initial customizations
    this.applyCustomization(customization);
  }

  // Update appearance smoothly when customized in the wardrobe shop
  public applyCustomization(c: CharacterCustomization) {
    this.skinMaterial.color.set(c.skinTone);
    this.kameezMaterial.color.set(c.outfitColor);
    this.shalwarMaterial.color.set(c.outfitColor);
    this.trimMaterial.color.set(c.outfitSecondaryColor);

    // Rebuild hair / headwear
    while (this.hairGroup.children.length > 0) {
      this.hairGroup.remove(this.hairGroup.children[0]);
    }
    while (this.headwearGroup.children.length > 0) {
      this.headwearGroup.remove(this.headwearGroup.children[0]);
    }

    if (c.headwear === 'side_part' || c.headwear === 'none') {
      // Natural side-part hair
      const hairGeo = new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const hairMesh = new THREE.Mesh(hairGeo, this.hairMaterial);
      hairMesh.position.set(0, 0.20, -0.01);
      this.hairGroup.add(hairMesh);

      // Side swoosh
      const swooshGeo = new THREE.BoxGeometry(0.14, 0.06, 0.08);
      const swoosh = new THREE.Mesh(swooshGeo, this.hairMaterial);
      swoosh.position.set(0.04, 0.31, 0.09);
      swoosh.rotation.z = -0.15;
      this.hairGroup.add(swoosh);
    } else if (c.headwear === 'curly_fade') {
      // Modern textured fade
      for (let i = 0; i < 7; i++) {
        const curlGeo = new THREE.SphereGeometry(0.065, 8, 8);
        const curl = new THREE.Mesh(curlGeo, this.hairMaterial);
        const ang = (i / 7) * Math.PI;
        curl.position.set(Math.cos(ang) * 0.12, 0.28, Math.sin(ang) * 0.10);
        this.hairGroup.add(curl);
      }
    } else if (c.headwear === 'sindhi_topi') {
      // Sindhi Embroidered Cap (with circular cutout front)
      const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
      this.headwearMaterial.color.set('#d97706');
      const cap = new THREE.Mesh(capGeo, this.headwearMaterial);
      cap.position.set(0, 0.30, 0);
      this.headwearGroup.add(cap);

      // Gold mirror-work embroidery band
      const trimGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.03, 16);
      const goldTrim = new THREE.Mesh(trimGeo, this.trimMaterial);
      goldTrim.position.set(0, 0.26, 0);
      this.headwearGroup.add(goldTrim);
    } else if (c.headwear === 'chitrali_pakol') {
      // Traditional Chitrali woolen Pakol cap
      this.headwearMaterial.color.set('#d6d3d1');
      const pakolGeo = new THREE.CylinderGeometry(0.21, 0.18, 0.08, 16);
      const pakol = new THREE.Mesh(pakolGeo, this.headwearMaterial);
      pakol.position.set(0, 0.30, -0.01);
      this.headwearGroup.add(pakol);

      // Rolled woolen brim
      const brimGeo = new THREE.TorusGeometry(0.19, 0.04, 8, 16);
      brimGeo.rotateX(Math.PI / 2);
      const brim = new THREE.Mesh(brimGeo, this.headwearMaterial);
      brim.position.set(0, 0.27, -0.01);
      this.headwearGroup.add(brim);
    } else if (c.headwear === 'eid_turban') {
      // Festive Kulla / Turban with peak (Shamla)
      this.headwearMaterial.color.set('#047857');
      const turbanBase = new THREE.TorusGeometry(0.18, 0.05, 8, 16);
      turbanBase.rotateX(Math.PI / 2);
      const tMesh = new THREE.Mesh(turbanBase, this.headwearMaterial);
      tMesh.position.set(0, 0.28, 0);
      this.headwearGroup.add(tMesh);

      // Golden fan / shamla
      const shamlaGeo = new THREE.ConeGeometry(0.08, 0.18, 8);
      const shamla = new THREE.Mesh(shamlaGeo, this.trimMaterial);
      shamla.position.set(0, 0.40, 0.05);
      this.headwearGroup.add(shamla);
    }

    // Footwear style
    if (c.footwear === 'sports_sneakers') {
      this.footwearMaterial.color.set('#ffffff');
      this.footwearMaterial.roughness = 0.4;
    } else if (c.footwear === 'khussa') {
      this.footwearMaterial.color.set('#b45309');
      this.footwearMaterial.roughness = 0.7;
    } else {
      // Peshawari chappal
      this.footwearMaterial.color.set('#3e2723');
      this.footwearMaterial.roughness = 0.6;
    }

    // Accessories
    if (c.hasGlasses && !this.glassesMesh) {
      const gGeo = new THREE.BoxGeometry(0.18, 0.035, 0.03);
      const gMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.3 });
      this.glassesMesh = new THREE.Mesh(gGeo, gMat);
      this.glassesMesh.position.set(0, 0.19, 0.17);
      this.headBone.add(this.glassesMesh);
    } else if (!c.hasGlasses && this.glassesMesh) {
      this.headBone.remove(this.glassesMesh);
      this.glassesMesh = null;
    }

    if (c.hasWatch && !this.watchMesh) {
      const wGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 10);
      const wMat = new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.8, roughness: 0.2 });
      this.watchMesh = new THREE.Mesh(wGeo, wMat);
      this.watchMesh.position.set(0, -0.42, 0);
      this.leftArmBone.add(this.watchMesh);
    } else if (!c.hasWatch && this.watchMesh) {
      this.leftArmBone.remove(this.watchMesh);
      this.watchMesh = null;
    }
  }

  public setCricketBatVisible(visible: boolean) {
    if (visible && !this.cricketBatMesh) {
      const batGroup = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: '#ca8a04', roughness: 0.65 });
      const gripMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 }); // Green grip

      // Blade
      const bladeGeo = new THREE.BoxGeometry(0.11, 0.45, 0.035);
      const blade = new THREE.Mesh(bladeGeo, woodMat);
      blade.position.y = -0.32;
      batGroup.add(blade);

      // Handle
      const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8);
      const handle = new THREE.Mesh(handleGeo, gripMat);
      handle.position.y = -0.05;
      batGroup.add(handle);

      this.cricketBatMesh = batGroup;
      this.rightArmBone.add(batGroup);
      batGroup.position.set(0, -0.48, 0.05);
      batGroup.rotation.x = Math.PI / 4;
    } else if (!visible && this.cricketBatMesh) {
      this.rightArmBone.remove(this.cricketBatMesh);
      this.cricketBatMesh = null;
    }
  }

  // Procedural bone animation loop
  public updateAnimation(
    state: 'idle' | 'walk' | 'run' | 'jump' | 'sit' | 'drive' | 'batting',
    delta: number,
    speedMultiplier: number = 1.0
  ) {
    this.animTimer += delta;

    if (state === 'batting') {
      // Classic cricket batting stance and follow-through
      const swing = Math.sin(this.animTimer * 6);
      this.rootBone.position.y = 0.78;
      this.spineBone.rotation.set(0.2, -0.3 + swing * 0.4, 0);
      this.headBone.rotation.set(0, 0.35, 0);

      this.leftArmBone.rotation.set(0.6 + swing * 0.3, 0.4, 0.2);
      this.rightArmBone.rotation.set(0.8 + swing * 0.5, -0.2, -0.1);

      this.leftLegBone.rotation.set(-0.2, 0, 0.1);
      this.rightLegBone.rotation.set(0.15, 0, -0.1);
      return;
    }

    if (state === 'idle') {
      // Gentle breathing & subtle weight shifting
      const breath = Math.sin(this.animTimer * 2.2) * 0.015;
      this.spineBone.position.y = 0.10 + breath;
      this.spineBone.rotation.set(0, 0, Math.sin(this.animTimer * 1.1) * 0.02);
      this.headBone.rotation.set(Math.sin(this.animTimer * 1.5) * 0.02, Math.cos(this.animTimer * 0.8) * 0.03, 0);

      // Relaxed arms
      this.leftArmBone.rotation.set(0, 0, 0.1 + Math.sin(this.animTimer * 2) * 0.02);
      this.rightArmBone.rotation.set(0, 0, -0.1 - Math.sin(this.animTimer * 2) * 0.02);

      // Standing legs
      this.leftLegBone.rotation.set(0, 0, 0.02);
      this.rightLegBone.rotation.set(0, 0, -0.02);
      this.rootBone.position.y = 0.82;
      this.lowerKameez.rotation.set(0, 0, 0);

    } else if (state === 'walk' || state === 'run') {
      const isRun = state === 'run';
      const strideFreq = isRun ? 11 : 7.5;
      const legAmplitude = isRun ? 0.75 : 0.45;
      const armAmplitude = isRun ? 0.85 : 0.40;
      const lean = isRun ? 0.15 : 0.04;

      const cycle = this.animTimer * strideFreq * speedMultiplier;
      const swing = Math.sin(cycle);

      // Root bounce & forward lean
      this.rootBone.position.y = 0.82 + Math.abs(Math.sin(cycle * 2)) * (isRun ? 0.05 : 0.025);
      this.spineBone.rotation.set(lean, 0, -swing * 0.04);
      this.headBone.rotation.set(-lean * 0.6, swing * 0.03, 0);

      // Legs swing in opposition
      this.leftLegBone.rotation.set(swing * legAmplitude, 0, 0.02);
      this.rightLegBone.rotation.set(-swing * legAmplitude, 0, -0.02);

      // Arms swing in opposition to legs
      this.leftArmBone.rotation.set(-swing * armAmplitude, 0, 0.08);
      this.rightArmBone.rotation.set(swing * armAmplitude, 0, -0.08);

      // Kameez tunic swaying dynamically with running wind
      this.lowerKameez.rotation.x = -lean * 1.2 + Math.sin(cycle) * 0.08;

    } else if (state === 'jump') {
      // Airborne pose: legs tucked slightly, arms raised for balance
      this.rootBone.position.y = 0.88;
      this.spineBone.rotation.set(-0.08, 0, 0);
      this.leftLegBone.rotation.set(-0.35, 0, 0.05);
      this.rightLegBone.rotation.set(-0.25, 0, -0.05);
      this.leftArmBone.rotation.set(-0.55, 0, 0.35);
      this.rightArmBone.rotation.set(-0.55, 0, -0.35);
      this.lowerKameez.rotation.set(0.15, 0, 0);

    } else if (state === 'sit') {
      // Seated relaxed pose on charpai / park bench
      this.rootBone.position.y = 0.48; // Lowered to bench height
      this.spineBone.rotation.set(0.04, 0, 0);
      this.leftLegBone.rotation.set(Math.PI / 2 * 0.95, 0, 0.1);
      this.rightLegBone.rotation.set(Math.PI / 2 * 0.95, 0, -0.1);
      this.leftArmBone.rotation.set(0.3, 0, 0.2);
      this.rightArmBone.rotation.set(0.3, 0, -0.2);
      this.lowerKameez.rotation.set(Math.PI / 2 * 0.7, 0, 0);

    } else if (state === 'drive') {
      // Driving pose: hands forward gripping steering wheel / handlebars
      this.rootBone.position.y = 0.52;
      this.spineBone.rotation.set(0.18, 0, 0);
      this.leftLegBone.rotation.set(Math.PI / 2 * 0.8, 0, 0.12);
      this.rightLegBone.rotation.set(Math.PI / 2 * 0.8, 0, -0.12);
      this.leftArmBone.rotation.set(0.85, 0.2, 0.1);
      this.rightArmBone.rotation.set(0.85, -0.2, -0.1);
      this.lowerKameez.rotation.set(Math.PI / 2 * 0.5, 0, 0);
    }
  }
}
