import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameSettings } from './game/types';
import {
  StoryState,
  StoryMessage,
  DialogueChoice,
  initialStoryState,
  BOB_DIALOGUE_TREE,
} from './game/story';
import { CharlesCat } from './game/cat';
import { createApartment, WorldObjects } from './game/world';
import { PlayerController } from './game/player';
import { InteractionManager } from './game/interaction';
import {
  setSoundVolume,
  playDoorSound,
  playSitSound,
  playPhoneBeep,
  playMessageSentSound,
  playMessageReceivedSound,
  apartmentAmbience,
} from './game/sound';
import { Phone } from './components/Phone';
import { ComputerScreen } from './components/ComputerScreen';
import { Crosshair } from './components/Crosshair';
import { GameHUD } from './components/GameHUD';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Core Game Settings
  const [settings, setSettings] = useState<GameSettings>({
    masterVolume: 0.7,
    mouseSensitivity: 1.0,
    graphicsMode: 'retro-med',
    crtFilter: true,
  });

  // UI States
  const [isLocked, setIsLocked] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isComputerOpen, setIsComputerOpen] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Story & Dialogue States
  const [storyState, setStoryState] = useState<StoryState>(initialStoryState);
  const [messages, setMessages] = useState<StoryMessage[]>([
    {
      id: 'msg-start',
      sender: 'Bob',
      text: BOB_DIALOGUE_TREE['node-start'].message,
      time: '23:40',
    },
  ]);
  const [isBobTyping, setIsBobTyping] = useState(false);

  // References to game systems
  const playerRef = useRef<PlayerController | null>(null);
  const interactionRef = useRef<InteractionManager | null>(null);
  const worldRef = useRef<WorldObjects | null>(null);
  const catRef = useRef<CharlesCat | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isDoorOpenRef = useRef(false);
  const isPhoneOpenRef = useRef(false);
  const isComputerOpenRef = useRef(false);
  const updateRendererSizeRef = useRef<(() => void) | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Toast feedback helper
  const showToast = useCallback((text: string) => {
    if (toastTimeoutRef.current !== null) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(text);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 4500);
  }, []);

  // Sync volume setting with sound module
  useEffect(() => {
    setSoundVolume(settings.masterVolume);
    apartmentAmbience.updateVolume();
  }, [settings.masterVolume]);

  // Sync sensitivity with player controller
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.settings.mouseSensitivity = settings.mouseSensitivity;
    }
  }, [settings.mouseSensitivity]);

  // Sync graphicsMode dynamically without restarting scene
  useEffect(() => {
    updateRendererSizeRef.current?.();
  }, [settings.graphicsMode]);

  // Keep refs in sync with state
  useEffect(() => {
    isPhoneOpenRef.current = isPhoneOpen;
    if (playerRef.current) {
      playerRef.current.isMenuOpen = isPhoneOpen || isComputerOpen;
      if (isPhoneOpen) {
        playerRef.current.resetKeys();
      }
    }
    if (interactionRef.current) {
      interactionRef.current.state.isPhoneOpen = isPhoneOpen;
    }
  }, [isPhoneOpen, isComputerOpen]);

  useEffect(() => {
    isComputerOpenRef.current = isComputerOpen;
    if (playerRef.current) {
      playerRef.current.isMenuOpen = isPhoneOpen || isComputerOpen;
      if (isComputerOpen) {
        playerRef.current.resetKeys();
      }
    }
    if (interactionRef.current) {
      interactionRef.current.state.isComputerOpen = isComputerOpen;
    }
  }, [isComputerOpen, isPhoneOpen]);

  // Update Settings handler
  const handleUpdateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Select Dialogue Choice handler
  const handleSelectChoice = useCallback((choice: DialogueChoice) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const playerMsg: StoryMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Player',
      text: choice.text,
      time: timeStr,
    };

    playMessageSentSound();
    setMessages((prev) => [...prev, playerMsg]);
    setIsBobTyping(true);

    // Natural brief pause before Bob responds
    setTimeout(() => {
      const nextNode = BOB_DIALOGUE_TREE[choice.nextNodeId];
      if (nextNode) {
        const bobNow = new Date();
        const bobTime = `${String(bobNow.getHours()).padStart(2, '0')}:${String(bobNow.getMinutes()).padStart(2, '0')}`;
        const bobMsg: StoryMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'Bob',
          text: nextNode.message,
          time: bobTime,
        };

        playMessageReceivedSound();
        setMessages((prev) => [...prev, bobMsg]);
        setStoryState((prev) => ({
          ...prev,
          currentBobNode: choice.nextNodeId,
        }));

        if (choice.nextNodeId === 'node-park-conclusion') {
          showToast('Bob sent location: Park down the street.');
        }
      }
      setIsBobTyping(false);
    }, 750);
  }, [showToast]);

  // Phone toggle
  const togglePhone = useCallback(() => {
    playPhoneBeep();
    setIsPhoneOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        playerRef.current?.exitPointerLock();
        if (playerRef.current) {
          playerRef.current.isMenuOpen = true;
          playerRef.current.resetKeys();
        }
      } else {
        (document.activeElement as HTMLElement)?.blur();
        window.focus();
        if (playerRef.current) {
          playerRef.current.isMenuOpen = isComputerOpenRef.current;
          playerRef.current.resetKeys();
        }
      }
      return nextState;
    });
  }, []);

  // Request pointer lock & start apartment ambience
  const handleRequestLock = useCallback(() => {
    if (isPhoneOpenRef.current || isComputerOpenRef.current) return;
    apartmentAmbience.start();
    playerRef.current?.requestPointerLock();
  }, []);

  // Setup Three.js Engine - RUNS ONCE ON MOUNT ONLY
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene & World
    const world = createApartment();
    worldRef.current = world;

    // Camera
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 50);

    // Player Controller
    const player = new PlayerController(camera, renderer.domElement, settings);
    player.onLockChange = (locked) => {
      setIsLocked(locked);
      if (locked) {
        apartmentAmbience.start();
      }
    };
    playerRef.current = player;

    // Interaction Manager
    const interaction = new InteractionManager(camera);
    interaction.doorHinge = world.doorHinge;
    interactionRef.current = interaction;

    // 1. REGISTER DOOR INTERACTION
    interaction.register({
      id: 'door',
      name: 'Door',
      mesh: world.doorMesh,
      prompt: (state) => (state.isDoorOpen ? 'Press E to close' : 'Press E to open'),
      onInteract: (state) => {
        const nextDoorState = !state.isDoorOpen;
        state.isDoorOpen = nextDoorState;
        isDoorOpenRef.current = nextDoorState;
        // Swing door 90 degrees outward
        interaction.targetDoorAngle = nextDoorState ? -Math.PI / 2 : 0;
        playDoorSound(nextDoorState);
      },
    });

    // 2. REGISTER CHAIR INTERACTION
    interaction.register({
      id: 'chair',
      name: 'Chair',
      mesh: world.chairGroup,
      prompt: (state) => (state.isSitting ? 'Press E to stand' : 'Press E to sit'),
      onInteract: (state) => {
        const nextSitState = !state.isSitting;
        state.isSitting = nextSitState;
        setIsSitting(nextSitState);
        playSitSound(nextSitState);
        if (nextSitState) {
          player.sitDown(world.chairSeatPosition);
        } else {
          player.standUp();
        }
      },
    });

    // 3. REGISTER COMPUTER INTERACTION (ONLY usable while sitting)
    interaction.register({
      id: 'computer',
      name: 'Computer',
      mesh: world.computerMesh,
      prompt: (state) => (state.isSitting ? 'Press E to use computer' : 'Sit down to use computer'),
      onInteract: (state) => {
        if (!state.isSitting) {
          return;
        }
        state.isComputerOpen = true;
        isComputerOpenRef.current = true;
        setIsComputerOpen(true);
        player.isMenuOpen = true;
        player.resetKeys();
        player.exitPointerLock();
      },
    });

    // 4. INSTANTIATE CHARLES THE CAT NPC
    const cat = new CharlesCat();
    world.scene.add(cat.group);
    catRef.current = cat;

    // 5. REGISTER CHARLES INTERACTION (Pet Charles)
    interaction.register({
      id: 'charles',
      name: 'Charles',
      mesh: cat.interactionTarget,
      maxDistance: 2.6,
      prompt: () => '[E] Pet Charles',
      onInteract: () => {
        const petRes = cat.pet();
        if (petRes.message) {
          showToast(petRes.message);
        }
        setStoryState((prev) => ({
          ...prev,
          charlesPettedCount: cat.state.pettedCount,
          lastPettedTimestamp: cat.state.lastPetTime,
        }));
      },
    });

    // Resolution sizing function based on Graphics Mode
    const updateRendererSize = () => {
      const containerWidth = container.clientWidth || window.innerWidth;
      const containerHeight = container.clientHeight || window.innerHeight;
      camera.aspect = containerWidth / containerHeight;
      camera.updateProjectionMatrix();

      let renderW = containerWidth;
      let renderH = containerHeight;

      // Access latest settings
      const currentSettings = playerRef.current?.settings || settings;
      if (currentSettings.graphicsMode === 'retro-low') {
        const targetH = 240;
        const targetW = Math.round(targetH * camera.aspect);
        renderW = targetW;
        renderH = targetH;
      } else if (currentSettings.graphicsMode === 'retro-med') {
        const targetH = 480;
        const targetW = Math.round(targetH * camera.aspect);
        renderW = targetW;
        renderH = targetH;
      }

      renderer.setSize(renderW, renderH, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.imageRendering =
        currentSettings.graphicsMode === 'native' ? 'auto' : 'pixelated';
    };

    updateRendererSizeRef.current = updateRendererSize;
    updateRendererSize();
    window.addEventListener('resize', updateRendererSize);

    // Global Key Listener for Phone toggle (Key P) and OS key interception
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Intercept Windows / Meta keys to prevent Windows Start menu
      if (e.code === 'MetaLeft' || e.code === 'MetaRight' || e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        return;
      }

      // Intercept Alt alone to prevent browser/OS system menu bar activation
      if ((e.code === 'AltLeft' || e.code === 'AltRight' || e.key === 'Alt') && !e.ctrlKey) {
        e.preventDefault();
        return;
      }

      // Do not toggle phone if retro computer is currently open
      if (isComputerOpenRef.current) {
        return;
      }

      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      // Toggle phone when P is pressed without modifier keys
      if (e.code === 'KeyP' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        togglePhone();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);

    // Main Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    // Door closed collision bounding box
    const doorClosedBox = new THREE.Box3(
      new THREE.Vector3(0.5, 0, -4.55),
      new THREE.Vector3(1.6, 2.2, -4.42)
    );

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Keep interaction & player flags in sync with current modal state
      const menuOpen = isPhoneOpenRef.current || isComputerOpenRef.current;
      interaction.state.isPhoneOpen = isPhoneOpenRef.current;
      interaction.state.isComputerOpen = isComputerOpenRef.current;
      player.isMenuOpen = menuOpen;

      // Update player movement & collision
      const activeDoorBox = isDoorOpenRef.current ? undefined : doorClosedBox;
      player.update(delta, world.collisionBoxes, activeDoorBox);

      // Update Charles the Cat NPC
      cat.update(delta, camera.position);

      // Update interaction raycast
      const { prompt } = interaction.update(delta);
      setInteractionPrompt(prompt);

      // Render 3D scene
      renderer.render(world.scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanup on unmount only
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateRendererSize);
      window.removeEventListener('keydown', handleGlobalKey);
      apartmentAmbience.stop();
      player.destroy();
      interaction.destroy();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // Run ONCE on mount

  // Determine current available choices for Bob
  const currentNode = BOB_DIALOGUE_TREE[storyState.currentBobNode];
  const availableChoices = isBobTyping ? [] : (currentNode?.choices || []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Three.js Canvas Container */}
      <div
        id="game-canvas-container"
        ref={containerRef}
        onClick={handleRequestLock}
        className="w-full h-full cursor-crosshair"
      />

      {/* Optional CRT Scanline Screen Overlay */}
      {settings.crtFilter && (
        <div
          id="crt-scanlines-layer"
          className="pointer-events-none fixed inset-0 z-15 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-75"
        />
      )}

      {/* Crosshair & Interaction Prompt */}
      <Crosshair
        prompt={interactionPrompt}
        showCrosshair={!isPhoneOpen && !isComputerOpen}
      />

      {/* Game HUD (Controls info, sitting badge, click-to-play, toast) */}
      <GameHUD
        isLocked={isLocked}
        isSitting={isSitting}
        isPhoneOpen={isPhoneOpen}
        isComputerOpen={isComputerOpen}
        hasUnreadMessage={availableChoices.length > 0}
        toastMessage={toastMessage}
        onTogglePhone={togglePhone}
        onRequestLock={handleRequestLock}
      />

      {/* Phone Overlay */}
      <Phone
        isOpen={isPhoneOpen}
        onClose={() => {
          setIsPhoneOpen(false);
          isPhoneOpenRef.current = false;
          (document.activeElement as HTMLElement)?.blur();
          window.focus();
          if (playerRef.current) {
            playerRef.current.isMenuOpen = isComputerOpenRef.current;
            playerRef.current.resetKeys();
          }
          if (interactionRef.current) {
            interactionRef.current.state.isPhoneOpen = false;
          }
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        messages={messages}
        availableChoices={availableChoices}
        isBobTyping={isBobTyping}
        onSelectChoice={handleSelectChoice}
      />

      {/* Computer Screen Overlay */}
      <ComputerScreen
        isOpen={isComputerOpen}
        onClose={() => {
          setIsComputerOpen(false);
          isComputerOpenRef.current = false;
          (document.activeElement as HTMLElement)?.blur();
          window.focus();
          if (playerRef.current) {
            playerRef.current.isMenuOpen = isPhoneOpenRef.current;
            playerRef.current.resetKeys();
          }
          if (interactionRef.current) {
            interactionRef.current.state.isComputerOpen = false;
          }
        }}
      />
    </div>
  );
}

