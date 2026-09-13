import * as THREE from 'three';
import { InteractableObject, InteractionState } from './types';

export class InteractionManager {
  private camera: THREE.PerspectiveCamera;
  private raycaster: THREE.Raycaster;
  private interactables: InteractableObject[] = [];
  public currentTarget: InteractableObject | null = null;
  public currentPrompt: string | null = null;
  public state: InteractionState = {
    isSitting: false,
    isDoorOpen: false,
    isPhoneOpen: false,
    isComputerOpen: false,
  };

  // Door animation state
  public doorHinge: THREE.Group | null = null;
  public targetDoorAngle = 0; // 0 = closed, -Math.PI / 2 = open
  public currentDoorAngle = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = 3.2; // Max interaction distance

    window.addEventListener('keydown', this.handleKeyDown);
  }

  public register(interactable: InteractableObject) {
    this.interactables.push(interactable);
  }

  public destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // If typing in an active text input or phone/computer is open, do not trigger world interaction
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    if (e.code === 'KeyE' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (this.state.isPhoneOpen || this.state.isComputerOpen) {
        return;
      }
      e.preventDefault();

      // Interact with current target (e.g. computer when looking at computer while sitting, chair to stand/sit, door to open/close)
      if (this.currentTarget) {
        this.currentTarget.onInteract(this.state);
      }
    }
  };

  /**
   * Update raycasting from center of screen and update door animation
   */
  public update(delta: number): { target: InteractableObject | null; prompt: string | null } {
    // Animate door hinge rotation smoothly
    if (this.doorHinge) {
      this.currentDoorAngle = THREE.MathUtils.damp(this.currentDoorAngle, this.targetDoorAngle, 10, delta);
      this.doorHinge.rotation.y = this.currentDoorAngle;
    }

    // If phone or computer is open, clear active prompt
    if (this.state.isPhoneOpen || this.state.isComputerOpen) {
      this.currentTarget = null;
      this.currentPrompt = null;
      return { target: null, prompt: null };
    }

    // Cast ray from camera forward (center of view)
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);

    const checkMeshes: { mesh: THREE.Object3D; interactable: InteractableObject }[] = [];
    for (const item of this.interactables) {
      item.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          checkMeshes.push({ mesh: child, interactable: item });
        }
      });
    }

    const intersects = this.raycaster.intersectObjects(
      checkMeshes.map((m) => m.mesh),
      false
    );

    let hitInteractable: InteractableObject | null = null;
    if (intersects.length > 0) {
      const hit = intersects[0];
      const baseMaxDist = this.state.isSitting ? 3.5 : 2.8;
      const found = checkMeshes.find((m) => m.mesh === hit.object);
      if (found) {
        const effectiveMax = found.interactable.maxDistance || baseMaxDist;
        if (hit.distance <= effectiveMax) {
          hitInteractable = found.interactable;
        }
      }
    }

    // SITTING STATE:
    // Can look around and use computer if aimed at computer; otherwise can stand up
    if (this.state.isSitting) {
      if (hitInteractable && hitInteractable.id === 'computer') {
        this.currentTarget = hitInteractable;
        this.currentPrompt = '[E] Use Computer';
        return { target: this.currentTarget, prompt: this.currentPrompt };
      }

      const chair = this.interactables.find((i) => i.id === 'chair') || null;
      this.currentTarget = chair;
      this.currentPrompt = '[E] Stand up';
      return { target: this.currentTarget, prompt: this.currentPrompt };
    }

    // STANDING STATE:
    if (hitInteractable) {
      if (hitInteractable.id === 'computer') {
        // Computer CANNOT be used while standing
        this.currentTarget = null;
        this.currentPrompt = 'Sit down to use computer';
        return { target: null, prompt: this.currentPrompt };
      }

      if (hitInteractable.id === 'chair') {
        this.currentTarget = hitInteractable;
        this.currentPrompt = '[E] Sit';
        return { target: this.currentTarget, prompt: this.currentPrompt };
      }

      if (hitInteractable.id === 'door') {
        this.currentTarget = hitInteractable;
        this.currentPrompt = this.state.isDoorOpen ? '[E] Close Door' : '[E] Open Door';
        return { target: this.currentTarget, prompt: this.currentPrompt };
      }

      this.currentTarget = hitInteractable;
      this.currentPrompt = hitInteractable.prompt(this.state);
      return { target: this.currentTarget, prompt: this.currentPrompt };
    }

    this.currentTarget = null;
    this.currentPrompt = null;
    return { target: null, prompt: null };
  }
}
