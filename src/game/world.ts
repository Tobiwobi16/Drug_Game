import * as THREE from 'three';
import {
  createFloorTexture,
  createWallTexture,
  createCeilingTexture,
  createDoorTexture,
  createFabricTexture,
  createCrtScreenTexture,
} from './textures';

export interface WorldObjects {
  scene: THREE.Scene;
  doorHinge: THREE.Group;
  doorMesh: THREE.Mesh;
  chairGroup: THREE.Group;
  chairSeatPosition: THREE.Vector3;
  computerMesh: THREE.Object3D;
  collisionBoxes: THREE.Box3[];
}

/**
 * Builds the small retro 3D apartment environment.
 * Coordinates:
 * - Room dimension: Width = 8m (X: -4 to +4), Length = 9m (Z: -4.5 to +4.5), Height = 2.8m (Y: 0 to 2.8)
 * - Door is at Z = -4.5, X = 1.0 (on the north wall), hinged on its left side.
 * - Desk is against the east wall (X = 3.2, Z = 0).
 * - Chair is at (X = 2.4, Z = 0), facing desk (+X direction).
 * - Bed is in the southwest corner (X = -2.8, Z = 2.8).
 * - Couch is in the northwest corner (X = -2.8, Z = -2.0).
 * - Small table is in front of couch (X = -1.6, Z = -2.0).
 */
export function createApartment(): WorldObjects {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0d0f12'); // Dark void outside door/window
  scene.fog = new THREE.FogExp2('#14181f', 0.05);

  const collisionBoxes: THREE.Box3[] = [];

  // Helper to add collision box
  function addCollisionBox(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number) {
    collisionBoxes.push(new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ)));
  }

  // Textures
  const floorTex = createFloorTexture();
  floorTex.repeat.set(4, 5);
  const wallTex = createWallTexture();
  wallTex.repeat.set(4, 2);
  const ceilingTex = createCeilingTexture();
  ceilingTex.repeat.set(4, 5);
  const doorTex = createDoorTexture();
  const couchFabricTex = createFabricTexture('#324452');
  const bedFabricTex = createFabricTexture('#5c3e3e');
  const blanketTex = createFabricTexture('#27384a');
  const crtScreenTex = createCrtScreenTexture();

  // Materials (Retro MeshLambertMaterial or MeshStandardMaterial with low roughness)
  const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
  const wallMat = new THREE.MeshLambertMaterial({ map: wallTex });
  const ceilingMat = new THREE.MeshLambertMaterial({ map: ceilingTex });
  const woodMat = new THREE.MeshLambertMaterial({ color: '#543d2b' });
  const darkWoodMat = new THREE.MeshLambertMaterial({ color: '#362417' });
  const metalMat = new THREE.MeshLambertMaterial({ color: '#686b73' });
  const beigePcMat = new THREE.MeshLambertMaterial({ color: '#cfcaa5' }); // 90s vintage beige computer plastic
  const darkPlasticMat = new THREE.MeshLambertMaterial({ color: '#222326' });
  const couchFabricMat = new THREE.MeshLambertMaterial({ map: couchFabricTex });
  const bedFabricMat = new THREE.MeshLambertMaterial({ map: bedFabricTex });
  const blanketMat = new THREE.MeshLambertMaterial({ map: blanketTex });

  // 1. LIGHTING
  // Muted ambient light for retro atmosphere
  const ambientLight = new THREE.AmbientLight('#ffeacc', 0.55);
  scene.add(ambientLight);

  // Ceiling point light (hanging bulb in center of apartment)
  const ceilingLight = new THREE.PointLight('#ffe1b3', 1.1, 14, 1.2);
  ceilingLight.position.set(0, 2.5, 0);
  scene.add(ceilingLight);

  // Computer screen glow (cyan/teal CRT glow)
  const crtGlow = new THREE.PointLight('#5de6d6', 0.45, 3.5, 1.5);
  crtGlow.position.set(3.1, 1.2, 0);
  scene.add(crtGlow);

  // Hanging bulb wire and bulb fixture
  const wireGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.35, 6);
  const wireMesh = new THREE.Mesh(wireGeo, darkPlasticMat);
  wireMesh.position.set(0, 2.65, 0);
  scene.add(wireMesh);

  const bulbGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const bulbMat = new THREE.MeshBasicMaterial({ color: '#fffae6' });
  const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
  bulbMesh.position.set(0, 2.45, 0);
  scene.add(bulbMesh);

  // 2. FLOOR & CEILING
  const floorGeo = new THREE.PlaneGeometry(8, 9);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, 0);
  scene.add(floor);

  const ceilingGeo = new THREE.PlaneGeometry(8, 9);
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 2.8, 0);
  scene.add(ceiling);

  // 3. WALLS WITH COLLISION
  // East wall (X = 4)
  const eastWall = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.8), wallMat);
  eastWall.rotation.y = -Math.PI / 2;
  eastWall.position.set(4, 1.4, 0);
  scene.add(eastWall);
  addCollisionBox(3.9, 0, -4.5, 4.2, 2.8, 4.5);

  // West wall (X = -4)
  const westWall = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.8), wallMat);
  westWall.rotation.y = Math.PI / 2;
  westWall.position.set(-4, 1.4, 0);
  scene.add(westWall);
  addCollisionBox(-4.2, 0, -4.5, -3.9, 2.8, 4.5);

  // South wall (Z = 4.5)
  const southWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.8), wallMat);
  southWall.rotation.y = Math.PI;
  southWall.position.set(0, 1.4, 4.5);
  scene.add(southWall);
  addCollisionBox(-4, 0, 4.4, 4, 2.8, 4.7);

  // North wall with Doorway Cutout (Z = -4.5)
  // Doorway opening is from X = 0.5 to X = 1.6, Height = 2.15m
  // Left section (X = -4 to 0.5) => Width = 4.5
  const northWallLeft = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.8), wallMat);
  northWallLeft.position.set(-1.75, 1.4, -4.5);
  scene.add(northWallLeft);
  addCollisionBox(-4.0, 0, -4.7, 0.5, 2.8, -4.4);

  // Right section (X = 1.6 to 4.0) => Width = 2.4
  const northWallRight = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.8), wallMat);
  northWallRight.position.set(2.8, 1.4, -4.5);
  scene.add(northWallRight);
  addCollisionBox(1.6, 0, -4.7, 4.0, 2.8, -4.4);

  // Lintel above door (X = 0.5 to 1.6, Y = 2.15 to 2.8) => Width = 1.1, Height = 0.65
  const northWallTop = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.65), wallMat);
  northWallTop.position.set(1.05, 2.475, -4.5);
  scene.add(northWallTop);

  // Door Frame Trim
  const frameMat = darkWoodMat;
  const leftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.18, 0.12), frameMat);
  leftTrim.position.set(0.5, 1.09, -4.5);
  scene.add(leftTrim);

  const rightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.18, 0.12), frameMat);
  rightTrim.position.set(1.6, 1.09, -4.5);
  scene.add(rightTrim);

  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 0.12), frameMat);
  topTrim.position.set(1.05, 2.18, -4.5);
  scene.add(topTrim);

  // 4. WORKING DOOR WITH HINGE PIVOT
  // Hinge is positioned on the left door jamb at X = 0.54, Z = -4.48
  const doorHinge = new THREE.Group();
  doorHinge.position.set(0.54, 0, -4.48);
  scene.add(doorHinge);

  const doorWidth = 1.02;
  const doorHeight = 2.12;
  const doorThickness = 0.06;
  const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);

  // Custom multi-material for door so front/back use door texture
  const doorMat = new THREE.MeshLambertMaterial({ map: doorTex });
  const doorSideMat = darkWoodMat;
  const doorMaterials = [
    doorSideMat, doorSideMat, // sides
    doorSideMat, doorSideMat, // top/bottom
    doorMat, doorMat          // front/back
  ];
  const doorMesh = new THREE.Mesh(doorGeo, doorMaterials);
  // Center of door is offset by width/2 from hinge pivot so it swings like a real door
  doorMesh.position.set(doorWidth / 2, doorHeight / 2, 0);
  doorMesh.castShadow = true;
  doorHinge.add(doorMesh);

  // Door Knob
  const knobGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
  const knobMat = new THREE.MeshLambertMaterial({ color: '#c49a45' });
  const knob = new THREE.Mesh(knobGeo, knobMat);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(doorWidth - 0.12, 1.0, 0.05);
  doorHinge.add(knob);

  // Outside corridor / blank landing pad
  const outsideFloorGeo = new THREE.PlaneGeometry(2.5, 2.5);
  const outsideFloorMat = new THREE.MeshLambertMaterial({ color: '#16191f' });
  const outsideFloor = new THREE.Mesh(outsideFloorGeo, outsideFloorMat);
  outsideFloor.rotation.x = -Math.PI / 2;
  outsideFloor.position.set(1.05, -0.01, -5.75);
  scene.add(outsideFloor);

  // Corridor perimeter collision so player doesn't fall off into void
  addCollisionBox(0.2, 0, -7.0, 0.48, 2.8, -4.5); // corridor west edge
  addCollisionBox(1.62, 0, -7.0, 1.9, 2.8, -4.5); // corridor east edge
  addCollisionBox(0.2, 0, -7.0, 1.9, 2.8, -6.8); // corridor north edge

  // 5. COMPUTER DESK (Against East Wall)
  const deskGroup = new THREE.Group();
  deskGroup.position.set(3.4, 0, 0);

  // Desktop surface (W: 1.0m along X, L: 1.8m along Z, H: 0.75m)
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 1.7), woodMat);
  deskTop.position.set(0, 0.73, 0);
  deskGroup.add(deskTop);

  // Desk legs
  const legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.06);
  const leg1 = new THREE.Mesh(legGeo, darkPlasticMat);
  leg1.position.set(-0.38, 0.36, -0.78);
  const leg2 = new THREE.Mesh(legGeo, darkPlasticMat);
  leg2.position.set(0.38, 0.36, -0.78);
  const leg3 = new THREE.Mesh(legGeo, darkPlasticMat);
  leg3.position.set(-0.38, 0.36, 0.78);
  const leg4 = new THREE.Mesh(legGeo, darkPlasticMat);
  leg4.position.set(0.38, 0.36, 0.78);
  deskGroup.add(leg1, leg2, leg3, leg4);

  // Under-desk side drawer unit
  const drawerUnit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.45), darkWoodMat);
  drawerUnit.position.set(0.05, 0.35, 0.55);
  deskGroup.add(drawerUnit);

  scene.add(deskGroup);
  // Desk collision
  addCollisionBox(2.9, 0, -0.9, 3.9, 0.8, 0.9);

  // 6. COMPUTER SETUP ON DESK
  // CRT Monitor
  const monitorGroup = new THREE.Group();
  monitorGroup.position.set(3.4, 0.76, 0);

  // Monitor base/stand
  const monitorStand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.24), beigePcMat);
  monitorStand.position.set(0, 0.02, 0);
  const monitorNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 8), beigePcMat);
  monitorNeck.position.set(0, 0.06, 0);
  monitorGroup.add(monitorStand, monitorNeck);

  // Monitor Housing (bulky 90s CRT back)
  const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.42), beigePcMat);
  monitorBody.position.set(0.05, 0.25, 0);
  monitorGroup.add(monitorBody);

  // CRT Screen Face (faces -X towards chair)
  const screenGeo = new THREE.PlaneGeometry(0.32, 0.28);
  const screenMat = new THREE.MeshBasicMaterial({ map: crtScreenTex });
  const computerScreenMesh = new THREE.Mesh(screenGeo, screenMat);
  computerScreenMesh.rotation.y = -Math.PI / 2;
  computerScreenMesh.position.set(-0.132, 0.25, 0);
  monitorGroup.add(computerScreenMesh);

  // Vintage Beige PC Tower
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 0.2), beigePcMat);
  tower.position.set(0, 0.22, 0.65);
  // Floppy drive / CD-ROM slot lines
  const cdDrive = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.16), darkPlasticMat);
  cdDrive.position.set(-0.21, 0.35, 0.65);
  const floppyDrive = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.12), darkPlasticMat);
  floppyDrive.position.set(-0.21, 0.27, 0.65);
  monitorGroup.add(tower, cdDrive, floppyDrive);

  // Keyboard
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.46), beigePcMat);
  keyboard.position.set(-0.22, 0.01, 0);
  monitorGroup.add(keyboard);

  // Mouse & mousepad
  const mousePad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.005, 0.2), darkPlasticMat);
  mousePad.position.set(-0.2, 0.003, -0.36);
  const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.06), beigePcMat);
  mouse.position.set(-0.2, 0.02, -0.36);
  monitorGroup.add(mousePad, mouse);

  scene.add(monitorGroup);

  // 7. WORKING COMPUTER CHAIR
  // Placed in front of desk at X = 2.45, Z = 0
  const chairGroup = new THREE.Group();
  chairGroup.position.set(2.45, 0, 0);

  // Star base with castors
  const baseLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.08), darkPlasticMat);
  baseLeg1.position.set(0, 0.06, 0);
  const baseLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.5), darkPlasticMat);
  baseLeg2.position.set(0, 0.06, 0);
  chairGroup.add(baseLeg1, baseLeg2);

  // Gas cylinder stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.36, 8), metalMat);
  stem.position.set(0, 0.25, 0);
  chairGroup.add(stem);

  // Seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.48), couchFabricMat);
  seat.position.set(0, 0.46, 0);
  chairGroup.add(seat);

  // Chair Backrest
  const backPost = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.08), darkPlasticMat);
  backPost.position.set(-0.22, 0.65, 0);
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.44), couchFabricMat);
  backrest.position.set(-0.22, 0.78, 0);
  chairGroup.add(backPost, backrest);

  // Armrests
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.06), darkPlasticMat);
  armL.position.set(0, 0.62, 0.22);
  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.06), darkPlasticMat);
  armR.position.set(0, 0.62, -0.22);
  chairGroup.add(armL, armR);

  scene.add(chairGroup);
  // Sitting position vector (where the player camera will sit smoothly)
  const chairSeatPosition = new THREE.Vector3(2.45, 1.05, 0);
  // Chair collision box
  addCollisionBox(2.2, 0, -0.3, 2.7, 0.9, 0.3);

  // 8. BED (Southwest corner, X = -2.7, Z = 2.8)
  const bedGroup = new THREE.Group();
  bedGroup.position.set(-2.7, 0, 2.8);

  // Bed frame
  const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.26, 1.5), darkWoodMat);
  bedFrame.position.set(0, 0.13, 0);
  bedGroup.add(bedFrame);

  // Headboard (against west wall)
  const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 1.5), darkWoodMat);
  headboard.position.set(-0.95, 0.5, 0);
  bedGroup.add(headboard);

  // Mattress
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.24, 1.4), bedFabricMat);
  mattress.position.set(0.02, 0.35, 0);
  bedGroup.add(mattress);

  // Blanket (covering bottom 60% of mattress)
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.26, 1.42), blanketMat);
  blanket.position.set(0.35, 0.36, 0);
  bedGroup.add(blanket);

  // Pillow
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.1, 0.85), new THREE.MeshLambertMaterial({ color: '#e8e5dc' }));
  pillow.position.set(-0.65, 0.5, 0);
  bedGroup.add(pillow);

  scene.add(bedGroup);
  // Bed collision
  addCollisionBox(-3.8, 0, 1.9, -1.6, 0.6, 3.7);

  // 9. COUCH (Northwest corner, X = -2.8, Z = -2.0)
  const couchGroup = new THREE.Group();
  couchGroup.position.set(-2.8, 0, -2.0);

  // Couch base & seat
  const couchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.42, 2.2), couchFabricMat);
  couchSeat.position.set(0, 0.21, 0);
  couchGroup.add(couchSeat);

  // Backrest (against west wall)
  const couchBack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 2.2), couchFabricMat);
  couchBack.position.set(-0.4, 0.6, 0);
  couchGroup.add(couchBack);

  // Armrests
  const armrest1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.2), couchFabricMat);
  armrest1.position.set(-0.05, 0.5, 1.0);
  const armrest2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.2), couchFabricMat);
  armrest2.position.set(-0.05, 0.5, -1.0);
  couchGroup.add(armrest1, armrest2);

  scene.add(couchGroup);
  // Couch collision
  addCollisionBox(-3.8, 0, -3.2, -2.1, 0.8, -0.8);

  // 10. SMALL COFFEE TABLE (In front of couch, X = -1.6, Z = -2.0)
  const tableGroup = new THREE.Group();
  tableGroup.position.set(-1.6, 0, -2.0);

  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.05, 1.1), woodMat);
  tableTop.position.set(0, 0.42, 0);
  tableGroup.add(tableTop);

  const tLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6);
  const tLeg1 = new THREE.Mesh(tLegGeo, darkPlasticMat);
  tLeg1.position.set(-0.25, 0.2, -0.45);
  const tLeg2 = new THREE.Mesh(tLegGeo, darkPlasticMat);
  tLeg2.position.set(0.25, 0.2, -0.45);
  const tLeg3 = new THREE.Mesh(tLegGeo, darkPlasticMat);
  tLeg3.position.set(-0.25, 0.2, 0.45);
  const tLeg4 = new THREE.Mesh(tLegGeo, darkPlasticMat);
  tLeg4.position.set(0.25, 0.2, 0.45);
  tableGroup.add(tLeg1, tLeg2, tLeg3, tLeg4);

  // Ceramic mug on table
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.09, 8), new THREE.MeshLambertMaterial({ color: '#cf4e38' }));
  mug.position.set(0.05, 0.49, -0.15);
  tableGroup.add(mug);

  scene.add(tableGroup);
  // Table collision
  addCollisionBox(-2.0, 0, -2.6, -1.2, 0.5, -1.4);

  // 11. SIDE CABINET / BOOKSHELF (Along South Wall, X = 1.8, Z = 4.1)
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.4), darkWoodMat);
  shelf.position.set(1.8, 0.6, 4.15);
  scene.add(shelf);
  addCollisionBox(0.9, 0, 3.85, 2.7, 1.2, 4.45);

  // Trash bin near desk
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.32, 8), metalMat);
  bin.position.set(3.4, 0.16, -1.1);
  scene.add(bin);

  return {
    scene,
    doorHinge,
    doorMesh,
    chairGroup,
    chairSeatPosition,
    computerMesh: monitorGroup,
    collisionBoxes,
  };
}
