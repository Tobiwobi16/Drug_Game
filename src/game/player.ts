import * as THREE from 'three';
import { GameSettings } from './types';

export class PlayerController {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  settings: GameSettings;

  // Position and Physics
  position: THREE.Vector3;
  velocity: THREE.Vector3 = new THREE.Vector3();
  moveSpeed = 3.6; // meters per second
  playerRadius = 0.3; // bounding cylinder radius
  standingHeight = 1.65; // Eye height standing
  sittingHeight = 1.05; // Eye height sitting
  currentEyeHeight = 1.65;

  // Camera Rotation (Euler yaw & pitch)
  pitch = 0; // vertical look (-PI/2 to PI/2)
  yaw = Math.PI; // horizontal look (start facing south into the room)

  // Input states
  keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
  };

  // State flags
  isLocked = false;
  isSitting = false;
  isTransitioningSitting = false;
  isMenuOpen = false;
  standPosition = new THREE.Vector3(1.7, 0, 0); // Position to return to when standing
  sitPosition = new THREE.Vector3(2.45, 0, 0); // Position of chair

  // Callbacks
  onLockChange?: (locked: boolean) => void;

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement, settings: GameSettings) {
    this.camera = camera;
    this.domElement = domElement;
    this.settings = settings;

    // Spawn player in the center of the apartment
    this.position = new THREE.Vector3(0.5, 0, 0.5);
    this.camera.position.set(this.position.x, this.standingHeight, this.position.z);
    this.updateCameraRotation();

    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleBlur = () => {
    this.resetKeys();
  };

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.resetKeys();
    }
  };

  public resetKeys() {
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
    this.velocity.set(0, 0, 0);
  }

  public requestPointerLock() {
    if (this.domElement && !this.isLocked && !this.isMenuOpen) {
      this.domElement.requestPointerLock();
    }
  }

  public exitPointerLock() {
    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }
  }

  private handlePointerLockChange = () => {
    this.isLocked = document.pointerLockElement === this.domElement;
    if (this.onLockChange) {
      this.onLockChange(this.isLocked);
    }
    if (!this.isLocked) {
      // Reset input keys if pointer unlocked
      this.resetKeys();
    }
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    // Intercept Windows / Meta keys to prevent Windows Start menu from opening
    if (e.code === 'MetaLeft' || e.code === 'MetaRight' || e.key === 'Meta' || e.key === 'OS') {
      e.preventDefault();
      return;
    }

    // Intercept Alt alone during gameplay so Windows doesn't activate window menu bar
    if ((e.code === 'AltLeft' || e.code === 'AltRight' || e.key === 'Alt') && !e.ctrlKey) {
      e.preventDefault();
      return;
    }

    // Intercept Tab during active gameplay so focus stays in the canvas
    if (e.code === 'Tab' && !this.isMenuOpen) {
      e.preventDefault();
      return;
    }

    if (this.isMenuOpen) return;

    // If typing in an active input field (like Phone Messages), ignore WASD
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    // Do not handle WASD if modifier keys like Ctrl or Meta are held
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        e.preventDefault();
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        e.preventDefault();
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        e.preventDefault();
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        e.preventDefault();
        this.keys.right = true;
        break;
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'MetaLeft' || e.code === 'MetaRight' || e.key === 'Meta' || e.key === 'OS') {
      e.preventDefault();
      return;
    }
    if ((e.code === 'AltLeft' || e.code === 'AltRight' || e.key === 'Alt') && !e.ctrlKey) {
      e.preventDefault();
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isLocked) return;

    const baseSens = 0.0022;
    const sens = baseSens * this.settings.mouseSensitivity;

    this.yaw -= e.movementX * sens;
    this.pitch -= e.movementY * sens;

    // Constrain pitch (-85 deg to +85 deg)
    const maxPitch = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    this.updateCameraRotation();
  };

  private updateCameraRotation() {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.camera.quaternion.setFromEuler(euler);
  }

  public sitDown(chairPos: THREE.Vector3) {
    if (this.isSitting) return;
    // Set standing return spot safely outside the chair collision box (chair at 2.45, safe is 1.70)
    this.standPosition.set(chairPos.x - 0.75, 0, chairPos.z);
    this.sitPosition.set(chairPos.x, 0, chairPos.z);
    this.isSitting = true;
    this.isTransitioningSitting = true;
    this.resetKeys();
    // Face the computer monitor (+X direction, yaw = -Math.PI / 2)
    this.yaw = -Math.PI / 2;
    this.pitch = -0.05;
    this.updateCameraRotation();
  }

  public standUp() {
    if (!this.isSitting) return;
    this.isSitting = false;
    this.isTransitioningSitting = true;
    this.resetKeys();
  }

  /**
   * Updates player position, handles collision with world boxes, and updates camera.
   */
  public update(delta: number, collisionBoxes: THREE.Box3[], doorMeshBox?: THREE.Box3) {
    const dt = Math.min(delta, 0.1);

    // Smooth sitting / standing camera interpolation
    if (this.isSitting) {
      this.position.lerp(this.sitPosition, dt * 8);
      this.currentEyeHeight = THREE.MathUtils.lerp(this.currentEyeHeight, this.sittingHeight, dt * 8);
      this.velocity.set(0, 0, 0);
    } else if (this.isTransitioningSitting) {
      this.position.lerp(this.standPosition, dt * 8);
      this.currentEyeHeight = THREE.MathUtils.lerp(this.currentEyeHeight, this.standingHeight, dt * 8);
      if (Math.abs(this.currentEyeHeight - this.standingHeight) < 0.02 && this.position.distanceTo(this.standPosition) < 0.05) {
        this.position.copy(this.standPosition);
        this.currentEyeHeight = this.standingHeight;
        this.isTransitioningSitting = false;
      }
    } else if (!this.isMenuOpen) {
      // 1. Camera-relative movement based strictly on horizontal yaw:
      // forward = camera's forward direction, with y = 0, normalized
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0; // Discard vertical pitch completely so movement is always horizontal on floor

      if (forward.lengthSq() < 0.0001) {
        // Fallback: compute forward direction purely from yaw if looking directly vertical
        forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      } else {
        forward.normalize();
      }

      // right = camera's right direction, with y = 0, normalized (forward x worldUp)
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      // Determine movement inputs: forward (W - S), right (D - A)
      let forwardInput = 0;
      if (this.keys.forward) forwardInput += 1;
      if (this.keys.backward) forwardInput -= 1;

      let rightInput = 0;
      if (this.keys.right) rightInput += 1;
      if (this.keys.left) rightInput -= 1;

      if (forwardInput !== 0 || rightInput !== 0) {
        // movement = forward * (W - S) + right * (D - A)
        const moveDir = new THREE.Vector3();
        moveDir.addScaledVector(forward, forwardInput);
        moveDir.addScaledVector(right, rightInput);
        // Normalize final movement vector so diagonal movement isn't faster than straight movement
        moveDir.normalize();

        this.velocity.x = moveDir.x * this.moveSpeed;
        this.velocity.z = moveDir.z * this.moveSpeed;
      } else {
        // Friction deceleration
        this.velocity.x = THREE.MathUtils.damp(this.velocity.x, 0, 14, dt);
        this.velocity.z = THREE.MathUtils.damp(this.velocity.z, 0, 14, dt);
      }

      // Apply movement with axis-aligned collision detection
      const nextX = this.position.x + this.velocity.x * dt;
      const nextZ = this.position.z + this.velocity.z * dt;

      // Check collision on X axis
      if (!this.checkCollision(nextX, this.position.z, collisionBoxes, doorMeshBox)) {
        this.position.x = nextX;
      } else {
        this.velocity.x = 0;
      }

      // Check collision on Z axis
      if (!this.checkCollision(this.position.x, nextZ, collisionBoxes, doorMeshBox)) {
        this.position.z = nextZ;
      } else {
        this.velocity.z = 0;
      }

      this.currentEyeHeight = this.standingHeight;
    } else {
      // When in modal / menu, freeze velocity
      this.velocity.set(0, 0, 0);
    }

    // Set camera position
    this.camera.position.set(this.position.x, this.currentEyeHeight, this.position.z);
  }

  /**
   * Bounding cylinder vs AABB collision test
   */
  private checkCollision(x: number, z: number, boxes: THREE.Box3[], doorBox?: THREE.Box3): boolean {
    const r = this.playerRadius;
    const minX = x - r;
    const maxX = x + r;
    const minZ = z - r;
    const maxZ = z + r;
    const playerBox = new THREE.Box3(
      new THREE.Vector3(minX, 0.1, minZ),
      new THREE.Vector3(maxX, 1.8, maxZ)
    );

    for (const box of boxes) {
      if (playerBox.intersectsBox(box)) {
        return true;
      }
    }

    if (doorBox && playerBox.intersectsBox(doorBox)) {
      return true;
    }

    return false;
  }
}
