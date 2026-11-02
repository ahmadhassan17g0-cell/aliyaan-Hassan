/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldCollisionBox, InteractiveSpot } from './worldGenerator';
import { VehicleInstance } from './vehicleModels';
import { soundFX } from '../audio/SoundFX';

export interface PlayerPhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationY: number;
  isGrounded: boolean;
  isSprinting: boolean;
  isSitting: boolean;
  isDriving: boolean;
  activeVehicle: VehicleInstance | null;
  activeVehicleType: string;
  vehicleSpeed: number;
  vehicleSteerAngle: number;
  stamina: number;
  maxStamina: number;
  nearInteractive: InteractiveSpot | null;
  nearVehicle: VehicleInstance | null;
}

export class GamePhysicsEngine {
  public state: PlayerPhysicsState;
  private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 2.2, 4.5);
  private cameraTarget: THREE.Vector3 = new THREE.Vector3();
  public cameraYaw: number = 0;
  public cameraPitch: number = 0.25;
  public cameraDistance: number = 4.8;

  private gravity: number = -24.0;
  private jumpForce: number = 8.5;
  private walkSpeed: number = 4.8;
  private sprintSpeed: number = 9.2;

  private stepTimer: number = 0;

  constructor(initialPosition: THREE.Vector3 = new THREE.Vector3(-65, 0, 15)) {
    this.state = {
      position: initialPosition.clone(),
      velocity: new THREE.Vector3(0, 0, 0),
      rotationY: 0,
      isGrounded: true,
      isSprinting: false,
      isSitting: false,
      isDriving: false,
      activeVehicle: null,
      activeVehicleType: '',
      vehicleSpeed: 0,
      vehicleSteerAngle: 0,
      stamina: 100,
      maxStamina: 100,
      nearInteractive: null,
      nearVehicle: null,
    };
  }

  // Update loop called every frame with delta time
  public update(
    dt: number,
    input: { forward: number; strafe: number; jump: boolean; sprint: boolean },
    colliders: WorldCollisionBox[],
    interactiveSpots: InteractiveSpot[],
    vehicles: VehicleInstance[]
  ) {
    const clampedDt = Math.min(dt, 0.05);

    if (this.state.isDriving && this.state.activeVehicle) {
      this.updateDriving(clampedDt, input, colliders);
    } else {
      this.updateOnFoot(clampedDt, input, colliders);
    }

    // Check nearby interactive spots
    this.checkInteractions(interactiveSpots);

    // Check nearby unoccupied vehicles to drive
    this.checkNearbyVehicles(vehicles);

    // Audio engine loop
    if (this.state.isDriving) {
      const maxSpd = this.state.activeVehicleType === 'bicycle' ? 8 : 22;
      const ratio = this.state.vehicleSpeed / maxSpd;
      soundFX.updateEngine(ratio, true, this.state.activeVehicleType);
    } else {
      soundFX.updateEngine(0, false, '');
    }
  }

  // On-foot movement calculation
  private updateOnFoot(
    dt: number,
    input: { forward: number; strafe: number; jump: boolean; sprint: boolean },
    colliders: WorldCollisionBox[]
  ) {
    if (this.state.isSitting) {
      // If player pushes joystick, stand up
      if (Math.abs(input.forward) > 0.2 || Math.abs(input.strafe) > 0.2 || input.jump) {
        this.state.isSitting = false;
      }
      // Regenerate stamina faster while resting on charpai
      this.state.stamina = Math.min(this.state.maxStamina, this.state.stamina + 25 * dt);
      return;
    }

    // Camera relative movement
    const moveX = input.strafe;
    const moveZ = input.forward;
    const hasInput = Math.hypot(moveX, moveZ) > 0.08;

    this.state.isSprinting = input.sprint && this.state.stamina > 5 && hasInput;

    if (this.state.isSprinting) {
      this.state.stamina = Math.max(0, this.state.stamina - 15 * dt);
    } else {
      this.state.stamina = Math.min(this.state.maxStamina, this.state.stamina + 10 * dt);
    }

    const currentSpeed = this.state.isSprinting ? this.sprintSpeed : this.walkSpeed;

    if (hasInput) {
      // Calculate angle relative to camera yaw
      const inputAngle = Math.atan2(moveX, moveZ);
      const moveAngle = this.cameraYaw + inputAngle;

      const targetVx = Math.sin(moveAngle) * currentSpeed;
      const targetVz = Math.cos(moveAngle) * currentSpeed;

      // Smooth horizontal velocity
      this.state.velocity.x = THREE.MathUtils.damp(this.state.velocity.x, targetVx, 12, dt);
      this.state.velocity.z = THREE.MathUtils.damp(this.state.velocity.z, targetVz, 12, dt);

      // Rotate player to face movement direction
      const targetRot = moveAngle;
      let diff = targetRot - this.state.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.state.rotationY += diff * Math.min(1.0, 14 * dt);

      // Footstep sound cadence
      if (this.state.isGrounded) {
        this.stepTimer += dt * (this.state.isSprinting ? 1.6 : 1.0);
        if (this.stepTimer > 0.38) {
          const isVillage = this.state.position.x < 10;
          soundFX.playFootstep(isVillage ? 'dirt' : 'stone');
          this.stepTimer = 0;
        }
      }
    } else {
      // Decelerate
      this.state.velocity.x = THREE.MathUtils.damp(this.state.velocity.x, 0, 16, dt);
      this.state.velocity.z = THREE.MathUtils.damp(this.state.velocity.z, 0, 16, dt);
    }

    // Jump
    if (input.jump && this.state.isGrounded) {
      this.state.velocity.y = this.jumpForce;
      this.state.isGrounded = false;
      soundFX.playJump();
    }

    // Gravity
    if (!this.state.isGrounded) {
      this.state.velocity.y += this.gravity * dt;
    }

    // Apply movement with collision resolution
    const nextX = this.state.position.x + this.state.velocity.x * dt;
    const nextZ = this.state.position.z + this.state.velocity.z * dt;
    const nextY = this.state.position.y + this.state.velocity.y * dt;

    if (!this.checkCollision(nextX, this.state.position.z, colliders)) {
      this.state.position.x = nextX;
    } else {
      this.state.velocity.x = 0;
    }

    if (!this.checkCollision(this.state.position.x, nextZ, colliders)) {
      this.state.position.z = nextZ;
    } else {
      this.state.velocity.z = 0;
    }

    // Ground check (flat level at Y = 0)
    if (nextY <= 0) {
      this.state.position.y = 0;
      this.state.velocity.y = 0;
      this.state.isGrounded = true;
    } else {
      this.state.position.y = nextY;
    }

    // World boundary clamping (-180 to 180, -130 to 130)
    this.state.position.x = THREE.MathUtils.clamp(this.state.position.x, -170, 170);
    this.state.position.z = THREE.MathUtils.clamp(this.state.position.z, -125, 125);
  }

  // Vehicle driving physics
  private updateDriving(
    dt: number,
    input: { forward: number; strafe: number; jump: boolean; sprint: boolean },
    colliders: WorldCollisionBox[]
  ) {
    const veh = this.state.activeVehicle!;
    const type = this.state.activeVehicleType;

    const maxSpeed = type === 'bicycle' ? 7.5 : type === 'rickshaw' ? 16 : type === 'motorcycle' ? 24 : 28;
    const accelRate = type === 'car' ? 18 : type === 'motorcycle' ? 18 : type === 'rickshaw' ? 11 : 6;
    const turnRate = type === 'motorcycle' ? 2.6 : type === 'rickshaw' ? 2.2 : type === 'bicycle' ? 2.4 : 2.1;

    // Throttle / Reverse / Braking
    if (input.jump && Math.abs(this.state.vehicleSpeed) > 0.5) {
      // Handbrake drift / fast stop
      this.state.vehicleSpeed = THREE.MathUtils.damp(this.state.vehicleSpeed, 0, 8.0, dt);
    } else if (input.forward > 0.1) {
      this.state.vehicleSpeed = THREE.MathUtils.damp(this.state.vehicleSpeed, maxSpeed * input.forward, accelRate * 0.22, dt);
    } else if (input.forward < -0.1) {
      this.state.vehicleSpeed = THREE.MathUtils.damp(this.state.vehicleSpeed, -maxSpeed * 0.45 * Math.abs(input.forward), accelRate * 0.35, dt);
    } else {
      // Coasting friction
      this.state.vehicleSpeed = THREE.MathUtils.damp(this.state.vehicleSpeed, 0, 4.5, dt);
    }

    // Steering
    const steerInput = input.strafe;
    this.state.vehicleSteerAngle = THREE.MathUtils.damp(this.state.vehicleSteerAngle, steerInput * 0.55, 14, dt);

    // Apply vehicle turning when in motion
    if (Math.abs(this.state.vehicleSpeed) > 0.2) {
      const dir = Math.sign(this.state.vehicleSpeed);
      this.state.rotationY -= this.state.vehicleSteerAngle * turnRate * dt * dir;
    }

    // Vehicle position advancement
    const forwardX = Math.sin(this.state.rotationY);
    const forwardZ = Math.cos(this.state.rotationY);

    const nextX = this.state.position.x + forwardX * this.state.vehicleSpeed * dt;
    const nextZ = this.state.position.z + forwardZ * this.state.vehicleSpeed * dt;

    if (!this.checkCollision(nextX, nextZ, colliders, 1.2)) {
      this.state.position.x = nextX;
      this.state.position.z = nextZ;
    } else {
      // Bounce impact
      this.state.vehicleSpeed = -this.state.vehicleSpeed * 0.3;
    }

    this.state.position.y = 0;

    // Sync vehicle 3D group
    veh.group.position.set(this.state.position.x, 0, this.state.position.z);
    veh.group.rotation.y = this.state.rotationY;

    // Realistic body roll on turns (suspension dynamics)
    if (type === 'car') {
      const rollTarget = this.state.vehicleSteerAngle * 0.08 * (this.state.vehicleSpeed / maxSpeed);
      veh.group.rotation.z = THREE.MathUtils.damp(veh.group.rotation.z, rollTarget, 10, dt);
    } else if (type === 'motorcycle' || type === 'bicycle') {
      const rollTarget = -this.state.vehicleSteerAngle * 0.35 * (this.state.vehicleSpeed / maxSpeed);
      veh.group.rotation.z = THREE.MathUtils.damp(veh.group.rotation.z, rollTarget, 10, dt);
    }

    // Turn front steering fork / wheels
    veh.steerNodes.forEach((node) => {
      node.rotation.y = this.state.vehicleSteerAngle;
    });

    // Spin wheels
    const rollDelta = (this.state.vehicleSpeed * dt) / 0.35;
    veh.wheelMeshes.forEach((mesh) => {
      mesh.rotation.x += rollDelta;
    });
  }

  // Mount vehicle
  public enterVehicle(vehicle: VehicleInstance, type: string) {
    this.state.isDriving = true;
    this.state.activeVehicle = vehicle;
    this.state.activeVehicleType = type;
    this.state.vehicleSpeed = 0;
    this.cameraDistance = 7.2; // Zoom camera out for driving
    soundFX.playHorn(type as 'car' | 'rickshaw' | 'bike');
  }

  // Dismount vehicle
  public exitVehicle() {
    if (!this.state.isDriving || !this.state.activeVehicle) return;
    this.state.isDriving = false;
    this.state.activeVehicle = null;
    this.state.activeVehicleType = '';
    this.state.vehicleSpeed = 0;
    this.cameraDistance = 4.8;
    // Step out to the left side
    const sideX = Math.cos(this.state.rotationY) * 1.8;
    const sideZ = -Math.sin(this.state.rotationY) * 1.8;
    this.state.position.x += sideX;
    this.state.position.z += sideZ;
    soundFX.updateEngine(0, false, '');
  }

  // Collision detection against world bounding boxes
  private checkCollision(x: number, z: number, colliders: WorldCollisionBox[], radius: number = 0.5): boolean {
    for (const c of colliders) {
      if (
        x + radius > c.minX &&
        x - radius < c.maxX &&
        z + radius > c.minZ &&
        z - radius < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }

  // Find nearest interactive spot
  private checkInteractions(spots: InteractiveSpot[]) {
    let nearest: InteractiveSpot | null = null;
    let minDst = Infinity;

    for (const s of spots) {
      const dst = Math.hypot(
        this.state.position.x - s.position[0],
        this.state.position.z - s.position[2]
      );
      if (dst <= s.radius && dst < minDst) {
        minDst = dst;
        nearest = s;
      }
    }
    this.state.nearInteractive = nearest;
  }

  // Find nearest vehicle to mount
  private checkNearbyVehicles(vehicles: VehicleInstance[]) {
    if (this.state.isDriving) {
      this.state.nearVehicle = null;
      return;
    }

    let nearest: VehicleInstance | null = null;
    let minDst = 3.6;

    for (const v of vehicles) {
      const dst = Math.hypot(
        this.state.position.x - v.group.position.x,
        this.state.position.z - v.group.position.z
      );
      if (dst <= minDst) {
        minDst = dst;
        nearest = v;
      }
    }
    this.state.nearVehicle = nearest;
  }

  // Update third person camera position and target
  public updateCamera(camera: THREE.Camera, dt: number) {
    const targetY = this.state.isDriving ? 1.6 : 1.35;
    this.cameraTarget.set(
      this.state.position.x,
      this.state.position.y + targetY,
      this.state.position.z
    );

    // Spherical orbit calculation
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    const camX = this.cameraTarget.x - sinYaw * cosPitch * this.cameraDistance;
    const camY = this.cameraTarget.y + sinPitch * this.cameraDistance;
    const camZ = this.cameraTarget.z - cosYaw * cosPitch * this.cameraDistance;

    // Smooth exponential camera tracking
    camera.position.x = THREE.MathUtils.damp(camera.position.x, camX, 15, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, Math.max(0.6, camY), 15, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, camZ, 15, dt);

    camera.lookAt(this.cameraTarget);
  }
}
