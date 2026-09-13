import * as THREE from 'three';
import { playCatMeowSound } from './sound';

export interface CatState {
  health: number;
  condition: 'weak' | 'tired' | 'stable';
  treatmentStatus: 'pending' | 'administered';
  pettedCount: number;
  lastPetTime: number;
}

export class CharlesCat {
  public group: THREE.Group;
  public interactionTarget: THREE.Object3D;
  private bodyMesh: THREE.Mesh;
  private headGroup: THREE.Group;
  private tailGroup: THREE.Group;
  private legFL: THREE.Mesh;
  private legFR: THREE.Mesh;
  private legBL: THREE.Mesh;
  private legBR: THREE.Mesh;

  // Cat State
  public state: CatState = {
    health: 62,
    condition: 'weak',
    treatmentStatus: 'pending',
    pettedCount: 0,
    lastPetTime: 0,
  };

  // AI & Waypoints
  private waypoints: THREE.Vector3[] = [
    new THREE.Vector3(-1.8, 0, -0.8), // Cozy spot between couch & table
    new THREE.Vector3(0.0, 0, 1.2),   // Center floor
    new THREE.Vector3(-1.6, 0, 2.2),  // Foot of bed
    new THREE.Vector3(1.2, 0, -1.6),  // Corner near kitchen/entry
  ];
  private currentWaypointIndex = 0;
  private aiState: 'idle_resting' | 'idle_sitting' | 'walking' | 'weak_cough' | 'petted' = 'idle_resting';
  private stateTimer = 8.0;
  private walkSpeed = 0.45; // Slower than normal cats due to sickness

  // Animation variables
  private animTime = 0;
  private coughTimer = 45.0; // Weak cough periodically
  private petReactionTimer = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CharlesCat';

    // Materials - Warm retro ginger/orange tabby with cream accents
    const gingerFurMat = new THREE.MeshLambertMaterial({ color: '#c46835' });
    const creamFurMat = new THREE.MeshLambertMaterial({ color: '#f0dfc8' });
    const darkTabbyMat = new THREE.MeshLambertMaterial({ color: '#873e1c' });
    const noseMat = new THREE.MeshLambertMaterial({ color: '#e89b97' });
    const eyeMat = new THREE.MeshBasicMaterial({ color: '#247a3e' }); // Soft green eyes

    // 1. Cat Body (Low poly segmented torso)
    const bodyGeo = new THREE.BoxGeometry(0.24, 0.22, 0.44);
    this.bodyMesh = new THREE.Mesh(bodyGeo, gingerFurMat);
    this.bodyMesh.position.set(0, 0.22, 0);
    this.group.add(this.bodyMesh);

    // Cream chest patch
    const chestGeo = new THREE.BoxGeometry(0.18, 0.16, 0.05);
    const chest = new THREE.Mesh(chestGeo, creamFurMat);
    chest.position.set(0, -0.01, -0.2);
    this.bodyMesh.add(chest);

    // Subtle tabby stripes on back
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.04), darkTabbyMat);
    stripe1.position.set(0, 0.11, -0.05);
    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.04), darkTabbyMat);
    stripe2.position.set(0, 0.11, 0.08);
    this.bodyMesh.add(stripe1, stripe2);

    // 2. Head Group
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.12, -0.24);
    this.bodyMesh.add(this.headGroup);

    const headGeo = new THREE.BoxGeometry(0.19, 0.17, 0.18);
    const headMesh = new THREE.Mesh(headGeo, gingerFurMat);
    this.headGroup.add(headMesh);

    // Muzzle / Snout
    const snoutGeo = new THREE.BoxGeometry(0.11, 0.07, 0.08);
    const snout = new THREE.Mesh(snoutGeo, creamFurMat);
    snout.position.set(0, -0.035, -0.11);
    this.headGroup.add(snout);

    // Nose
    const noseGeo = new THREE.BoxGeometry(0.03, 0.02, 0.02);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.015, -0.155);
    this.headGroup.add(nose);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.035, 0.035, 0.01);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.055, 0.02, -0.092);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.055, 0.02, -0.092);
    this.headGroup.add(leftEye, rightEye);

    // Pointed Ears
    const earGeo = new THREE.ConeGeometry(0.04, 0.07, 4);
    const leftEar = new THREE.Mesh(earGeo, gingerFurMat);
    leftEar.position.set(-0.065, 0.11, 0.01);
    leftEar.rotation.z = 0.2;
    const rightEar = new THREE.Mesh(earGeo, gingerFurMat);
    rightEar.position.set(0.065, 0.11, 0.01);
    rightEar.rotation.z = -0.2;
    this.headGroup.add(leftEar, rightEar);

    // 3. Legs (4 little low-poly paws)
    const legGeo = new THREE.BoxGeometry(0.065, 0.16, 0.065);
    const pawMat = creamFurMat;

    this.legFL = new THREE.Mesh(legGeo, gingerFurMat);
    this.legFL.position.set(-0.085, 0.08, -0.14);
    const pawFL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.08), pawMat);
    pawFL.position.set(0, -0.06, -0.01);
    this.legFL.add(pawFL);

    this.legFR = new THREE.Mesh(legGeo, gingerFurMat);
    this.legFR.position.set(0.085, 0.08, -0.14);
    const pawFR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.08), pawMat);
    pawFR.position.set(0, -0.06, -0.01);
    this.legFR.add(pawFR);

    this.legBL = new THREE.Mesh(legGeo, gingerFurMat);
    this.legBL.position.set(-0.085, 0.08, 0.14);
    const pawBL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.08), pawMat);
    pawBL.position.set(0, -0.06, -0.01);
    this.legBL.add(pawBL);

    this.legBR = new THREE.Mesh(legGeo, gingerFurMat);
    this.legBR.position.set(0.085, 0.08, 0.14);
    const pawBR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.08), pawMat);
    pawBR.position.set(0, -0.06, -0.01);
    this.legBR.add(pawBR);

    this.group.add(this.legFL, this.legFR, this.legBL, this.legBR);

    // 4. Tail Group
    this.tailGroup = new THREE.Group();
    this.tailGroup.position.set(0, 0.08, 0.22);
    this.bodyMesh.add(this.tailGroup);

    const tailPart1 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.14), gingerFurMat);
    tailPart1.position.set(0, 0.04, 0.07);
    tailPart1.rotation.x = -0.6;
    this.tailGroup.add(tailPart1);

    const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.12), creamFurMat);
    tailTip.position.set(0, 0.1, 0.15);
    tailTip.rotation.x = -0.3;
    this.tailGroup.add(tailTip);

    // Invisible larger hit box for comfortable raycast interaction
    const hitBoxGeo = new THREE.BoxGeometry(0.7, 0.6, 0.8);
    const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
    this.interactionTarget = new THREE.Mesh(hitBoxGeo, hitBoxMat);
    this.interactionTarget.position.set(0, 0.25, 0);
    this.group.add(this.interactionTarget);

    // Initial position on cozy floor spot
    this.group.position.copy(this.waypoints[0]);
    this.group.rotation.y = Math.PI * 0.4;

    // Add a small cat food & water dish near his starting area
    this.createCatDishes();
  }

  private createCatDishes() {
    const dishGroup = new THREE.Group();
    dishGroup.position.set(-1.9, 0, -0.2);

    // Food bowl
    const bowlGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.05, 12);
    const bowlMat = new THREE.MeshLambertMaterial({ color: '#3873a3' });
    const foodBowl = new THREE.Mesh(bowlGeo, bowlMat);
    foodBowl.position.set(-0.12, 0.025, 0);

    const kibbleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8);
    const kibbleMat = new THREE.MeshLambertMaterial({ color: '#593922' });
    const kibble = new THREE.Mesh(kibbleGeo, kibbleMat);
    kibble.position.set(0, 0.02, 0);
    foodBowl.add(kibble);
    dishGroup.add(foodBowl);

    // Water bowl
    const waterBowl = new THREE.Mesh(bowlGeo, bowlMat);
    waterBowl.position.set(0.12, 0.025, 0);

    const waterGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.01, 8);
    const waterMat = new THREE.MeshBasicMaterial({ color: '#4da6ff', transparent: true, opacity: 0.7 });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 0.02, 0);
    waterBowl.add(water);
    dishGroup.add(waterBowl);

    // Small woven placemat under bowls
    const matGeo = new THREE.PlaneGeometry(0.44, 0.26);
    const matMat = new THREE.MeshLambertMaterial({ color: '#bfb59b' });
    const placemat = new THREE.Mesh(matGeo, matMat);
    placemat.rotation.x = -Math.PI / 2;
    placemat.position.set(0, 0.002, 0);
    dishGroup.add(placemat);

    this.group.parent?.add(dishGroup);
  }

  /**
   * Called when player interacts with Charles by pressing E
   */
  public pet(): { success: boolean; message: string } {
    const now = performance.now();
    // 3.5 second cooldown between pets
    if (now - this.state.lastPetTime < 3500) {
      return {
        success: false,
        message: 'Charles is resting peacefully.',
      };
    }

    this.state.lastPetTime = now;
    this.state.pettedCount += 1;
    this.aiState = 'petted';
    this.petReactionTimer = 3.2;

    // Purr audio
    playCatMeowSound('purr');
    setTimeout(() => {
      playCatMeowSound('happy');
    }, 700);

    const petMessages = [
      'Charles purrs softly and leans into your hand. He seems comforted.',
      'Charles rubs his chin gently against your palm with a quiet purr.',
      'Charles closes his tired eyes and lets out a soft, contented sigh.',
      'Charles kneads his paws gently on the rug. He looks up at you with trust.',
    ];
    const chosenMsg = petMessages[(this.state.pettedCount - 1) % petMessages.length];

    return {
      success: true,
      message: chosenMsg,
    };
  }

  /**
   * Main update loop for Charles: AI state machine, animations, walking, and sickness behavior
   */
  public update(dt: number, playerPos: THREE.Vector3) {
    this.animTime += dt;
    this.coughTimer -= dt;

    // Trigger occasional weak cough/sigh if Charles has cancer
    if (this.coughTimer <= 0 && this.aiState !== 'walking' && this.aiState !== 'petted') {
      this.aiState = 'weak_cough';
      this.stateTimer = 2.4;
      this.coughTimer = 45.0 + Math.random() * 30.0;
      playCatMeowSound('weak');
    }

    // 1. AI State Machine
    if (this.aiState === 'petted') {
      this.petReactionTimer -= dt;
      // Head tilts up toward player
      this.headGroup.rotation.x = -0.25;
      this.tailGroup.rotation.y = Math.sin(this.animTime * 4) * 0.4;
      this.tailGroup.rotation.z = Math.cos(this.animTime * 4) * 0.2;
      this.bodyMesh.position.y = 0.20 + Math.sin(this.animTime * 3) * 0.015;

      if (this.petReactionTimer <= 0) {
        this.aiState = 'idle_sitting';
        this.stateTimer = 10.0 + Math.random() * 10.0;
      }
      return;
    }

    if (this.aiState === 'weak_cough') {
      this.stateTimer -= dt;
      // Subtle cough animation: head drops low, body heaves slightly
      this.headGroup.rotation.x = 0.35 + Math.sin(this.animTime * 8) * 0.08;
      this.bodyMesh.position.y = 0.16 + Math.sin(this.animTime * 8) * 0.012;

      if (this.stateTimer <= 0) {
        this.aiState = 'idle_resting';
        this.stateTimer = 15.0 + Math.random() * 15.0;
      }
      return;
    }

    if (this.aiState === 'idle_resting' || this.aiState === 'idle_sitting') {
      this.stateTimer -= dt;

      // Resting breathing animation (slightly slower/labored)
      const breathSpeed = 1.4;
      this.bodyMesh.scale.y = 1.0 + Math.sin(this.animTime * breathSpeed) * 0.035;
      this.bodyMesh.scale.x = 1.0 - Math.sin(this.animTime * breathSpeed) * 0.015;

      // Lower body when resting/sitting
      const targetY = this.aiState === 'idle_resting' ? 0.14 : 0.20;
      this.bodyMesh.position.y = THREE.MathUtils.lerp(this.bodyMesh.position.y, targetY, dt * 2.5);

      // Slow gentle tail twitch
      this.tailGroup.rotation.y = Math.sin(this.animTime * 1.2) * 0.25;

      // If player is close, gently turn head to look at player
      const distToPlayer = this.group.position.distanceTo(playerPos);
      if (distToPlayer < 2.5) {
        const localPlayer = playerPos.clone().sub(this.group.position);
        const lookAngle = Math.atan2(localPlayer.x, localPlayer.z) - this.group.rotation.y;
        this.headGroup.rotation.y = THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(this.headGroup.rotation.y, lookAngle, dt * 2),
          -0.6,
          0.6
        );
      } else {
        this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, 0, dt * 2);
      }

      // Legs tucked when resting
      this.legFL.rotation.x = THREE.MathUtils.lerp(this.legFL.rotation.x, 0.4, dt * 3);
      this.legFR.rotation.x = THREE.MathUtils.lerp(this.legFR.rotation.x, 0.4, dt * 3);
      this.legBL.rotation.x = THREE.MathUtils.lerp(this.legBL.rotation.x, -0.4, dt * 3);
      this.legBR.rotation.x = THREE.MathUtils.lerp(this.legBR.rotation.x, -0.4, dt * 3);

      if (this.stateTimer <= 0) {
        // Pick next destination waypoint
        this.currentWaypointIndex = (this.currentWaypointIndex + 1 + Math.floor(Math.random() * (this.waypoints.length - 1))) % this.waypoints.length;
        this.aiState = 'walking';
      }
    } else if (this.aiState === 'walking') {
      const targetPos = this.waypoints[this.currentWaypointIndex];
      const dir = targetPos.clone().sub(this.group.position);
      dir.y = 0;
      const dist = dir.length();

      if (dist < 0.1) {
        // Reached destination, rest
        this.aiState = Math.random() > 0.4 ? 'idle_resting' : 'idle_sitting';
        this.stateTimer = 12.0 + Math.random() * 18.0;
        return;
      }

      dir.normalize();

      // Rotate smoothly toward target
      const targetAngle = Math.atan2(dir.x, dir.z);
      // Smallest angle interpolation
      let angleDiff = targetAngle - this.group.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      this.group.rotation.y += angleDiff * dt * 3.5;

      // Move forward at slow sickly cat pace
      this.group.position.x += dir.x * this.walkSpeed * dt;
      this.group.position.z += dir.z * this.walkSpeed * dt;

      // Walking leg animation (gentle swing)
      const walkCycle = this.animTime * 5.0;
      this.legFL.rotation.x = Math.sin(walkCycle) * 0.4;
      this.legFR.rotation.x = -Math.sin(walkCycle) * 0.4;
      this.legBL.rotation.x = -Math.sin(walkCycle) * 0.4;
      this.legBR.rotation.x = Math.sin(walkCycle) * 0.4;

      // Body bobbing
      this.bodyMesh.position.y = 0.22 + Math.abs(Math.sin(walkCycle * 2)) * 0.02;
      this.tailGroup.rotation.y = Math.sin(walkCycle) * 0.3;
      this.headGroup.rotation.y = 0;
      this.headGroup.rotation.x = 0;
    }
  }
}
