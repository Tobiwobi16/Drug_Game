import * as THREE from 'three';

export interface GameSettings {
  masterVolume: number; // 0.0 to 1.0
  mouseSensitivity: number; // 0.5 to 3.0
  graphicsMode: 'retro-low' | 'retro-med' | 'native'; // Pixelation levels
  crtFilter: boolean;
}

export interface MessageItem {
  id: string;
  sender: 'Unknown' | 'Player';
  text: string;
  time: string;
}

export interface InteractableObject {
  id: string;
  name: string;
  mesh: THREE.Object3D;
  prompt: (state: InteractionState) => string;
  onInteract: (state: InteractionState) => void;
  maxDistance?: number;
}

export interface InteractionState {
  isSitting: boolean;
  isDoorOpen: boolean;
  isPhoneOpen: boolean;
  isComputerOpen: boolean;
}
