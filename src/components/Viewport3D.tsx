/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Character, SmartObject } from '../game/simulation';
import { buildHouseEnvironment, SceneHandles, WallCutawayMode } from '../game/sceneBuilder';

interface Viewport3DProps {
  characters: Character[];
  smartObjects: SmartObject[];
  isDarkMode: boolean;
  cutawayMode: WallCutawayMode;
  showGrid: boolean;
  selectedCharacterId: string | null;
  onSelectCharacter: (id: string) => void;
  isScreensaverMode: boolean;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  characters,
  smartObjects,
  isDarkMode,
  cutawayMode,
  showGrid,
  selectedCharacterId,
  onSelectCharacter,
  isScreensaverMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const handlesRef = useRef<SceneHandles | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Store props in refs for lossless 60fps render loop
  const charsRef = useRef(characters);
  charsRef.current = characters;

  const cutawayRef = useRef(cutawayMode);
  cutawayRef.current = cutawayMode;

  const selectedCharIdRef = useRef(selectedCharacterId);
  selectedCharIdRef.current = selectedCharacterId;

  const isScreensaverRef = useRef(isScreensaverMode);
  isScreensaverRef.current = isScreensaverMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Camera setup (Classic Sims Isometric / Angled Perspective)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.5, 250);
    camera.position.set(24, 28, 34);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 3. Environment & Studio Lighting (Studio PBR per Three.js guidelines)
    const handles = buildHouseEnvironment(smartObjects, characters, isDarkMode);
    handlesRef.current = handles;
    const scene = handles.scene;

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Warm Sun Key Light
    const sunLight = new THREE.DirectionalLight(0xfffbeb, isDarkMode ? 0.8 : 2.2);
    sunLight.position.set(20, 35, 18);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Cool Sky Fill Light
    const hemiLight = new THREE.HemisphereLight(
      isDarkMode ? 0x312e81 : 0xdbeafe,
      isDarkMode ? 0x111827 : 0x4b5563,
      isDarkMode ? 0.6 : 1.2
    );
    scene.add(hemiLight);

    // 4. Interactive Orbit & Pan Controls (Mouse & Touch)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = {
      radius: 46,
      theta: Math.PI / 4,
      phi: Math.PI / 3.4,
    };
    let cameraTarget = new THREE.Vector3(0, 1.5, 0);

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0 || e.pointerType === 'touch') {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= dx * 0.008;
      spherical.phi = Math.max(0.25, Math.min(Math.PI / 2.1, spherical.phi - dy * 0.008));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(16, Math.min(85, spherical.radius + e.deltaY * 0.035));
    };

    // Raycasting for Character Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(handles.charactersGroup.children, true);
      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && parent.parent !== handles.charactersGroup) {
          parent = parent.parent;
        }
        if (parent && parent.name) {
          onSelectCharacter(parent.name);
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', onClick);

    // 5. Lossless 60fps Animation Loop with Screensaver Auto-Director
    let animId: number;
    let clock = new THREE.Clock();

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const delta = Math.min(clock.getDelta(), 0.1);

      // Screensaver / Auto-Director camera glide
      if (isScreensaverRef.current && !isDragging) {
        spherical.theta += delta * 0.12; // Gentle slow rotation
        // Follow selected or first active on-grid character
        const activeChar = charsRef.current.find((c) => c.onGrid);
        if (activeChar) {
          cameraTarget.lerp(new THREE.Vector3(activeChar.pos.x, 1.5, activeChar.pos.z), delta * 1.5);
        }
      } else {
        // Normal center target
        cameraTarget.lerp(new THREE.Vector3(0, 1.2, 0), delta * 2.5);
      }

      // Convert spherical coordinates to Cartesian camera position
      const sinPhiRadius = spherical.radius * Math.sin(spherical.phi);
      camera.position.x = cameraTarget.x + sinPhiRadius * Math.sin(spherical.theta);
      camera.position.y = cameraTarget.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = cameraTarget.z + sinPhiRadius * Math.cos(spherical.theta);
      camera.lookAt(cameraTarget);

      // Update cutaways and character animations
      handles.updateCutaways(cutawayRef.current, camera.position);
      handles.updateCharacters(charsRef.current, delta);

      renderer.render(scene, camera);
    };

    tick();

    // 6. Resize listener
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', onClick);
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [isDarkMode]);

  // Sync cutaways and grid toggle directly on handles
  useEffect(() => {
    if (handlesRef.current && cameraRef.current) {
      handlesRef.current.updateCutaways(cutawayMode, cameraRef.current.position);
      handlesRef.current.toggleGrid(showGrid);
    }
  }, [cutawayMode, showGrid]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none" data-testid="viewport-3d">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 2D Speech Bubbles over characters in 3D scene */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {characters.map((char) => {
          if (!char.onGrid || !char.selfTalk) return null;
          return (
            <div
              key={char.id}
              className={`absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-full ${
                char.id === selectedCharacterId ? 'z-20' : 'z-10'
              }`}
              style={{
                // Approximate screen projection point for character position
                left: `${50 + char.pos.x * 2.2 - char.pos.z * 0.9}%`,
                top: `${48 - char.pos.y * 3.5 + char.pos.z * 1.4}%`,
              }}
            >
              <div
                className={`max-w-xs px-3 py-1.5 rounded-2xl shadow-lg border text-xs backdrop-blur-none ${
                  char.motives.sanity < 35
                    ? 'bg-purple-950 text-purple-200 border-purple-500 font-mono animate-pulse'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1 font-semibold text-[10px] text-indigo-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: char.color }} />
                  {char.name}
                  <span className="text-gray-400 font-normal">({char.currentAction})</span>
                </div>
                <p className="mt-0.5 leading-snug italic">"{char.selfTalk}"</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
