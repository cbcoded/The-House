/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { SmartObject, Character } from './simulation';

export type WallCutawayMode = 'CUTAWAY' | 'WALLS_UP' | 'WALLS_DOWN';

export interface SceneHandles {
  scene: THREE.Scene;
  lotGroup: THREE.Group;
  wallsGroup: THREE.Group;
  objectsGroup: THREE.Group;
  charactersGroup: THREE.Group;
  gridHelper: THREE.GridHelper;
  characterMeshes: Map<string, THREE.Group>;
  plumbobMeshes: Map<string, THREE.Mesh>;
  updateCutaways: (mode: WallCutawayMode, cameraPos: THREE.Vector3) => void;
  updateCharacters: (characters: Character[], delta: number) => void;
  toggleGrid: (visible: boolean) => void;
  poolWaterMaterial: THREE.MeshStandardMaterial;
}

/**
 * Creates procedural pencil-grain canvas texture for sketch/graphite shading
 */
function createPencilTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f5f4ef';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle graphite noise / cross-hatching
  ctx.strokeStyle = 'rgba(70, 70, 75, 0.08)';
  ctx.lineWidth = 1;
  for (let i = -512; i < 1024; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 512, 512);
    ctx.stroke();
  }
  for (let i = -512; i < 1024; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i + 512, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
  }

  // Faint speckles
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(40,40,45,0.06)' : 'rgba(255,255,255,0.4)';
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Builds the complete 3D environment: floating lot diorama, rooms, furniture, and character rigs
 */
export function buildHouseEnvironment(
  smartObjects: SmartObject[],
  characters: Character[],
  isDarkMode: boolean
): SceneHandles {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(isDarkMode ? 0x0f1117 : 0xe0e7ff);
  scene.fog = new THREE.Fog(isDarkMode ? 0x0f1117 : 0xe0e7ff, 45, 110);

  const pencilTex = createPencilTexture();

  // Root Groups
  const lotGroup = new THREE.Group();
  const wallsGroup = new THREE.Group();
  const objectsGroup = new THREE.Group();
  const charactersGroup = new THREE.Group();

  scene.add(lotGroup);
  scene.add(wallsGroup);
  scene.add(objectsGroup);
  scene.add(charactersGroup);

  // ----------------------------------------------------
  // 1. FLOATING LOT DIORAMA & EARTH CROSS-SECTION SKIRT
  // ----------------------------------------------------
  // Top Yard Grass (40 x 40m lot)
  const grassMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0x223826 : 0x5a8c3e,
    roughness: 0.85,
    metalness: 0.05,
    map: pencilTex,
  });
  const grassMesh = new THREE.Mesh(new THREE.BoxGeometry(36, 0.6, 36), grassMat);
  grassMesh.position.y = -0.3;
  grassMesh.receiveShadow = true;
  lotGroup.add(grassMesh);

  // Earth / Bedrock Skirt underneath (Cross-Section)
  const earthMat = new THREE.MeshStandardMaterial({
    color: isDarkMode ? 0x201a18 : 0x4a3b32,
    roughness: 0.95,
    metalness: 0.05,
  });
  const earthSkirt = new THREE.Mesh(new THREE.BoxGeometry(36, 6.0, 36), earthMat);
  earthSkirt.position.y = -3.6;
  lotGroup.add(earthSkirt);

  // 64x64 Grid Overlay over the yard (matching user reference photos)
  const gridHelper = new THREE.GridHelper(36, 36, 0xffffff, 0xffffff);
  gridHelper.position.y = 0.03;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.28;
  gridHelper.userData.defaultOpacity = 0.28;
  lotGroup.add(gridHelper);

  // Front Sidewalk & Driveway leading to Grid Boundary Portal
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.7,
    map: pencilTex,
  });
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(36, 0.04, 3.5), concreteMat);
  sidewalk.position.set(0, 0.02, 16.0);
  sidewalk.receiveShadow = true;
  lotGroup.add(sidewalk);

  // Sidewalk Grid Boundary Pillars (Visual portal marker at lot edge)
  const portalPostMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
  const postLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8), portalPostMat);
  postLeft.position.set(-17.5, 0.9, 16.0);
  lotGroup.add(postLeft);

  const postRight = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.8), portalPostMat);
  postRight.position.set(17.5, 0.9, 16.0);
  lotGroup.add(postRight);

  // Swimming Pool in Yard (North lawn)
  const poolBorderMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.5 });
  const poolBorder = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 7), poolBorderMat);
  poolBorder.position.set(0, 0.05, -14.5);
  lotGroup.add(poolBorder);

  const poolWaterMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.15,
    metalness: 0.2,
    transparent: true,
    opacity: 0.75,
  });
  const poolWater = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.1, 5.6), poolWaterMat);
  poolWater.position.set(0, 0.08, -14.5);
  lotGroup.add(poolWater);

  // Trees in Yard (Sims 3 Cedar / Cypress style trees matching image)
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.9 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const treePositions = [
    [-14, 0, -14],
    [-14, 0, -8],
    [-14, 0, -2],
    [14, 0, -14],
    [14, 0, -8],
    [14, 0, -2],
    [-13, 0, 10],
    [13, 0, 10],
  ];

  treePositions.forEach(([tx, ty, tz]) => {
    const treeGroup = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5), trunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Layered foliage cones
    for (let c = 0; c < 3; c++) {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(1.4 - c * 0.3, 2.0 - c * 0.3, 8),
        foliageMat
      );
      cone.position.y = 2.6 + c * 1.2;
      cone.castShadow = true;
      treeGroup.add(cone);
    }
    treeGroup.position.set(tx, ty, tz);
    lotGroup.add(treeGroup);
  });

  // ----------------------------------------------------
  // 2. HOUSE INTERIOR FLOOR TILES (Sims Style Tiled Rooms)
  // ----------------------------------------------------
  // Living Room Tile (Wood floor)
  const woodFloorMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6, map: pencilTex });
  const livingFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.04, 8), woodFloorMat);
  livingFloor.position.set(5.5, 0.03, -3.5);
  livingFloor.receiveShadow = true;
  lotGroup.add(livingFloor);

  // Kitchen Tile (Ceramic check)
  const tileFloorMat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.4, map: pencilTex });
  const kitchenFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.04, 8), tileFloorMat);
  kitchenFloor.position.set(-5.5, 0.03, -3.5);
  kitchenFloor.receiveShadow = true;
  lotGroup.add(kitchenFloor);

  // Bedroom Floor (Carpet)
  const carpetFloorMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.9 });
  const bedroomFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.04, 8), carpetFloorMat);
  bedroomFloor.position.set(5.5, 0.03, 5.0);
  bedroomFloor.receiveShadow = true;
  lotGroup.add(bedroomFloor);

  // Study & Bathroom Floor
  const studyFloor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.04, 8), woodFloorMat);
  studyFloor.position.set(-7.5, 0.03, 5.0);
  studyFloor.receiveShadow = true;
  lotGroup.add(studyFloor);

  const bathFloor = new THREE.Mesh(new THREE.BoxGeometry(4, 0.04, 8), tileFloorMat);
  bathFloor.position.set(-2.5, 0.03, 5.0);
  bathFloor.receiveShadow = true;
  lotGroup.add(bathFloor);

  // Subterranean Basement / Dungeon Floor (Underground at Y = -4)
  if (isDarkMode) {
    const dungeonFloorMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.95 });
    const dungeonFloor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.04, 12), dungeonFloorMat);
    dungeonFloor.position.set(0, -3.98, 0);
    dungeonFloor.receiveShadow = true;
    lotGroup.add(dungeonFloor);

    // Basement Ceiling / Earth cross-section hollow
    const dungeonWallMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
    const dNorth = new THREE.Mesh(new THREE.BoxGeometry(12, 3.5, 0.4), dungeonWallMat);
    dNorth.position.set(0, -2.2, -6);
    lotGroup.add(dNorth);
    const dSouth = new THREE.Mesh(new THREE.BoxGeometry(12, 3.5, 0.4), dungeonWallMat);
    dSouth.position.set(0, -2.2, 6);
    lotGroup.add(dSouth);
  }

  // ----------------------------------------------------
  // 3. WALLS & CUTAWAY SYSTEM
  // ----------------------------------------------------
  interface WallDef {
    size: [number, number, number];
    pos: [number, number, number];
    isExteriorSouthFacing?: boolean;
  }

  const wallDefs: WallDef[] = [
    // Exterior Perimeter
    { size: [22, 2.8, 0.3], pos: [0, 1.4, -7.5] }, // North wall
    { size: [0.3, 2.8, 17], pos: [-10.5, 1.4, 1.0] }, // West wall
    { size: [0.3, 2.8, 17], pos: [10.5, 1.4, 1.0] }, // East wall
    { size: [22, 2.8, 0.3], pos: [0, 1.4, 9.0], isExteriorSouthFacing: true }, // South wall (faces default camera)

    // Interior Partition Walls
    { size: [0.3, 2.8, 16], pos: [0.5, 1.4, 0.5] }, // Dividing East & West wings
    { size: [10.5, 2.8, 0.3], pos: [5.5, 1.4, 0.5], isExteriorSouthFacing: true }, // Dividing Living & Bedroom
    { size: [10.5, 2.8, 0.3], pos: [-5.5, 1.4, 0.5], isExteriorSouthFacing: true }, // Dividing Kitchen & Study/Bath
    { size: [0.3, 2.8, 8], pos: [-4.5, 1.4, 5.0] }, // Dividing Study & Bathroom
  ];

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6,
    roughness: 0.75,
    metalness: 0.05,
    map: pencilTex,
  });

  const wallMeshes: { mesh: THREE.Mesh; originalHeight: number; originalPosY: number; isSouth: boolean }[] = [];

  wallDefs.forEach((w) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w.size[0], w.size[1], w.size[2]), wallMat);
    mesh.position.set(w.pos[0], w.pos[1], w.pos[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wallsGroup.add(mesh);
    wallMeshes.push({
      mesh,
      originalHeight: w.size[1],
      originalPosY: w.pos[1],
      isSouth: !!w.isExteriorSouthFacing,
    });
  });

  const updateCutaways = (mode: WallCutawayMode, _cameraPos: THREE.Vector3) => {
    wallMeshes.forEach(({ mesh, originalHeight, originalPosY, isSouth }) => {
      if (mode === 'WALLS_UP') {
        mesh.scale.y = 1.0;
        mesh.position.y = originalPosY;
      } else if (mode === 'WALLS_DOWN') {
        // Drop all walls to 25cm base trim (like Sims walls down)
        mesh.scale.y = 0.15;
        mesh.position.y = 0.2;
      } else {
        // CUTAWAY (Default): Walls facing camera drop down, north/back walls remain standing
        if (isSouth) {
          mesh.scale.y = 0.15;
          mesh.position.y = 0.2;
        } else {
          mesh.scale.y = 1.0;
          mesh.position.y = originalPosY;
        }
      }
    });
  };

  // ----------------------------------------------------
  // 4. SMART OBJECTS (Composite 3-12 Part Procedural Models)
  // ----------------------------------------------------
  smartObjects.forEach((obj) => {
    if (obj.maturity === 'DARK_ONLY' && !isDarkMode) return;
    const group = createSmartObjectMesh(obj, pencilTex);
    group.position.set(obj.gridPos.x, obj.gridPos.y, obj.gridPos.z);
    objectsGroup.add(group);
  });

  // ----------------------------------------------------
  // 5. CHARACTERS & ANIMATED PLUMBOB RIGS
  // ----------------------------------------------------
  const characterMeshes = new Map<string, THREE.Group>();
  const plumbobMeshes = new Map<string, THREE.Mesh>();

  characters.forEach((char) => {
    const rig = createCharacterRig(char);
    rig.position.set(char.pos.x, char.pos.y, char.pos.z);
    charactersGroup.add(rig);
    characterMeshes.set(char.id, rig);

    const plumbob = rig.getObjectByName('Plumbob') as THREE.Mesh;
    if (plumbob) {
      plumbobMeshes.set(char.id, plumbob);
    }
  });

  const updateCharacters = (updatedChars: Character[], delta: number) => {
    updatedChars.forEach((char) => {
      const rig = characterMeshes.get(char.id);
      if (!rig) return;

      rig.visible = char.onGrid;
      if (!char.onGrid) return;

      // Smooth navigation dampening
      const targetVec = new THREE.Vector3(char.pos.x, char.pos.y, char.pos.z);
      rig.position.lerp(targetVec, Math.min(1.0, delta * 3.5));

      // Animated Plumbob rotation and pulse
      const plumbob = plumbobMeshes.get(char.id);
      if (plumbob) {
        plumbob.rotation.y += delta * 2.5;
        plumbob.position.y = 2.4 + Math.sin(Date.now() * 0.004) * 0.08;

        // Plumbob color changes based on Sanity & Mood
        const mat = plumbob.material as THREE.MeshStandardMaterial;
        if (char.motives.sanity < 30) {
          mat.color.setHex(0x7e22ce); // Purple unhinged
          mat.emissive.setHex(0x3b0764);
        } else if (char.motives.hunger < 25 || char.motives.energy < 25) {
          mat.color.setHex(0xef4444); // Red distress
          mat.emissive.setHex(0x991b1b);
        } else if (char.motives.fun > 60) {
          mat.color.setHex(0x22c55e); // Green happy
          mat.emissive.setHex(0x15803d);
        } else {
          mat.color.setHex(0xeab308); // Yellow neutral
          mat.emissive.setHex(0x854d0e);
        }
      }

      // Action Posture Adjustment
      const bodyGroup = rig.getObjectByName('BodyGroup');
      if (bodyGroup) {
        if (char.currentAction.toLowerCase().includes('sleep')) {
          bodyGroup.rotation.x = -Math.PI / 2;
          bodyGroup.position.y = 0.5;
        } else if (char.currentAction.toLowerCase().includes('lounging') || char.currentAction.toLowerCase().includes('watching')) {
          bodyGroup.rotation.x = -0.3;
          bodyGroup.position.y = 0.6;
        } else {
          bodyGroup.rotation.x = 0;
          bodyGroup.position.y = 0;
          // Walking bounce
          const isMoving = rig.position.distanceTo(targetVec) > 0.05;
          if (isMoving) {
            bodyGroup.position.y = Math.abs(Math.sin(Date.now() * 0.012)) * 0.12;
            rig.lookAt(targetVec.x, rig.position.y, targetVec.z);
          }
        }
      }
    });
  };

  const toggleGrid = (visible: boolean) => {
    gridHelper.visible = visible;
  };

  return {
    scene,
    lotGroup,
    wallsGroup,
    objectsGroup,
    charactersGroup,
    gridHelper,
    characterMeshes,
    plumbobMeshes,
    updateCutaways,
    updateCharacters,
    toggleGrid,
    poolWaterMaterial: poolWaterMat,
  };
}

/**
 * Procedural composite Smart Object meshes (3-12 parts)
 */
function createSmartObjectMesh(obj: SmartObject, pencilTex: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  group.name = obj.id;

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6, map: pencilTex });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const fabricMat = new THREE.MeshStandardMaterial({ color: 0x4338ca, roughness: 0.85, map: pencilTex });

  if (obj.id.includes('fridge')) {
    // 1. Fridge Cabinet Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.1), whiteMat);
    body.position.y = 1.1;
    group.add(body);
    // 2. Freezer handle
    const h1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4), metalMat);
    h1.position.set(0.5, 1.8, 0.6);
    group.add(h1);
    // 3. Lower door handle
    const h2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6), metalMat);
    h2.position.set(0.5, 0.9, 0.6);
    group.add(h2);
  } else if (obj.id.includes('stove')) {
    // 1. Stove body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 1.1), metalMat);
    body.position.y = 0.55;
    group.add(body);
    // 2. Burners
    for (let bx = -0.3; bx <= 0.3; bx += 0.6) {
      for (let bz = -0.3; bz <= 0.3; bz += 0.6) {
        const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        burner.position.set(bx, 1.12, bz);
        group.add(burner);
      }
    }
  } else if (obj.id.includes('tv')) {
    // 1. Credenza stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 0.8), woodMat);
    stand.position.y = 0.3;
    group.add(stand);
    // 2. TV Screen Box
    const screenBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.2), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 }));
    screenBox.position.set(0, 1.15, 0);
    group.add(screenBox);
    // 3. Screen Bezel & Glass
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    glass.position.set(0, 1.15, 0.11);
    group.add(glass);
  } else if (obj.id.includes('sofa')) {
    // 1. Sofa base
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.0), fabricMat);
    base.position.y = 0.35;
    group.add(base);
    // 2. Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 0.3), fabricMat);
    back.position.set(0, 0.75, -0.35);
    group.add(back);
    // 3. Armrests
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.0), fabricMat);
    armL.position.set(-1.05, 0.6, 0);
    group.add(armL);
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.0), fabricMat);
    armR.position.set(1.05, 0.6, 0);
    group.add(armR);
  } else if (obj.id.includes('bed')) {
    // 1. Bed Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 2.6), woodMat);
    frame.position.y = 0.2;
    group.add(frame);
    // 2. Mattress
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
    mattress.position.y = 0.5;
    group.add(mattress);
    // 3. Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 0.2), woodMat);
    headboard.position.set(0, 0.8, 1.2);
    group.add(headboard);
    // 4. Pillows
    const pillow1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.5), whiteMat);
    pillow1.position.set(-0.5, 0.75, 0.8);
    group.add(pillow1);
    const pillow2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.5), whiteMat);
    pillow2.position.set(0.5, 0.75, 0.8);
    group.add(pillow2);
  } else if (obj.id.includes('bathtub')) {
    // 1. Clawfoot Tub
    const tub = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.7, 1.0), whiteMat);
    tub.position.y = 0.45;
    group.add(tub);
    // 2. Brass Feet
    for (let fx = -0.8; fx <= 0.8; fx += 1.6) {
      for (let fz = -0.35; fz <= 0.35; fz += 0.7) {
        const foot = new THREE.Mesh(new THREE.SphereGeometry(0.08), metalMat);
        foot.position.set(fx, 0.08, fz);
        group.add(foot);
      }
    }
  } else if (obj.id.includes('toilet')) {
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.5), whiteMat);
    bowl.position.y = 0.25;
    group.add(bowl);
    const tank = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.28), whiteMat);
    tank.position.set(0, 0.65, 0.25);
    group.add(tank);
  } else if (obj.id.includes('easel')) {
    // Tripod legs
    const tripod = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8), woodMat);
    tripod.position.set(0, 0.9, 0);
    group.add(tripod);
    // Canvas with painted sunset
    const canvas = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.04), new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.9 }));
    canvas.position.set(0, 1.1, 0.1);
    canvas.rotation.x = -0.15;
    group.add(canvas);
  } else if (obj.id.includes('dungeon')) {
    // Dark mode restraint chair
    const ironSeat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 }));
    ironSeat.position.y = 0.5;
    group.add(ironSeat);
    const ironBack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 }));
    ironBack.position.set(0, 0.95, -0.35);
    group.add(ironBack);
  } else {
    // Default furniture box
    const def = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.2), woodMat);
    def.position.y = 0.45;
    group.add(def);
  }

  return group;
}

/**
 * Creates character rig (Sims 3 proportions, pencil sketch skin & clothes, Plumbob)
 */
function createCharacterRig(char: Character): THREE.Group {
  const rig = new THREE.Group();
  rig.name = char.id;

  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'BodyGroup';
  rig.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xfbcfe8,
    roughness: 0.75,
    metalness: 0.0,
  });

  const clothesMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(char.color),
    roughness: 0.85,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.9,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: char.hairStyle.includes('Bedhead') ? 0x27272a : 0x78350f,
    roughness: 0.8,
  });

  // 1. Torso / Shirt
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.4), clothesMat);
  torso.position.y = 1.2;
  torso.castShadow = true;
  bodyGroup.add(torso);

  // 2. Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), skinMat);
  head.position.y = 1.8;
  head.castShadow = true;
  bodyGroup.add(head);

  // 3. Hair Crown
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.27, 8, 8), hairMat);
  hair.position.set(0, 1.88, -0.04);
  bodyGroup.add(hair);

  // 4. Legs / Pants
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8), pantsMat);
  legL.position.set(-0.18, 0.45, 0);
  legL.castShadow = true;
  bodyGroup.add(legL);

  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.8), pantsMat);
  legR.position.set(0.18, 0.45, 0);
  legR.castShadow = true;
  bodyGroup.add(legR);

  // 5. Arms
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65), clothesMat);
  armL.position.set(-0.42, 1.15, 0);
  bodyGroup.add(armL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.65), clothesMat);
  armR.position.set(0.42, 1.15, 0);
  bodyGroup.add(armR);

  // 6. Iconic Sims Plumbob Diamond (Floating above head)
  // Double-cone octagonal diamond
  const plumbobGeo = new THREE.OctahedronGeometry(0.18, 0);
  plumbobGeo.scale(0.8, 1.8, 0.8);
  const plumbobMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x15803d,
    roughness: 0.2,
    metalness: 0.1,
  });
  const plumbob = new THREE.Mesh(plumbobGeo, plumbobMat);
  plumbob.name = 'Plumbob';
  plumbob.position.y = 2.4;
  rig.add(plumbob);

  return rig;
}
