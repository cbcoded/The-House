/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Viewport3D } from './components/Viewport3D';
import { BottomDock } from './components/BottomDock';
import { CharacterInspector } from './components/CharacterInspector';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { HouseChatbotModal } from './components/HouseChatbotModal';
import { AssetStudioModal } from './components/AssetStudioModal';
import { ScenarioModal } from './components/ScenarioModal';
import { MobileSimulatorView } from './components/MobileSimulatorView';
import {
  Character,
  SmartObject,
  Scenario,
  MaturityRating,
  PRESET_SCENARIOS,
  DEFAULT_SMART_OBJECTS,
  calculateGameTime,
  formatGameTime,
  simulateOfflineHistory,
  canPerceiveEvent,
} from './game/simulation';
import { WallCutawayMode } from './game/sceneBuilder';
import { sound } from './game/soundSynth';

export default function App() {
  // World Maturity Setting
  const [maturity, setMaturity] = useState<MaturityRating>('FAMILY_FRIENDLY');
  const isDarkMode = maturity === 'DARK_MODE';

  // Game Clock (3x ratio: 20 real minutes = 1 in-game hour)
  const [gameSeconds, setGameSeconds] = useState<number>(8 * 3600); // 08:00 AM Day 1
  const [timeScale, setTimeScale] = useState<number>(3.0); // 3x standard

  // Smart Objects & Characters State
  const [smartObjects, setSmartObjects] = useState<SmartObject[]>(DEFAULT_SMART_OBJECTS);
  const [characters, setCharacters] = useState<Character[]>(() => {
    return PRESET_SCENARIOS[0].characters.map((c) => ({
      ...c,
      actionTimer: 4,
      currentAction: 'Settling into lot',
      selfTalk: 'The house seems peaceful today.',
    }));
  });

  // The House Agent's Omniscient Black-Box Wall Log
  const [wallLogs, setWallLogs] = useState<string[]>([
    '[08:00 AM | The House] Lot diorama initialized at 64x64 grid coordinates.',
  ]);

  // Viewport & UI Mode Settings
  const [cutawayMode, setCutawayMode] = useState<WallCutawayMode>('CUTAWAY');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isScreensaverMode, setIsScreensaverMode] = useState<boolean>(false);
  const [isMobileSimMode, setIsMobileSimMode] = useState<boolean>(false);

  // Active Modals & Selection
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [showCASModal, setShowCASModal] = useState<boolean>(false);
  const [showChatbotModal, setShowChatbotModal] = useState<boolean>(false);
  const [showAssetStudioModal, setShowAssetStudioModal] = useState<boolean>(false);
  const [showScenarioModal, setShowScenarioModal] = useState<boolean>(false);

  // Offline History Sync on Mount
  useEffect(() => {
    const lastTimestampStr = localStorage.getItem('the_house_last_real_timestamp');
    const now = Date.now() / 1000;

    if (lastTimestampStr) {
      const lastTime = parseFloat(lastTimestampStr);
      const realSecondsPassed = Math.max(0, now - lastTime);

      if (realSecondsPassed > 20) {
        const offlineResult = simulateOfflineHistory(realSecondsPassed, characters, maturity);
        setCharacters(offlineResult.updatedCharacters);
        setGameSeconds((prev) => prev + calculateGameTime(realSecondsPassed, 3.0));
        setWallLogs((prev) => [...prev, ...offlineResult.logs]);
      }
    }

    // Save timestamp periodically and on unload
    const saveInterval = setInterval(() => {
      localStorage.setItem('the_house_last_real_timestamp', (Date.now() / 1000).toString());
    }, 15000);

    return () => clearInterval(saveInterval);
  }, []);

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        const next = !isMuted;
        setIsMuted(next);
        sound.setMuted(next);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted]);

  // Autonomous Multi-Agent Simulation Tick (Runs every 1 real second)
  useEffect(() => {
    if (timeScale === 0) return;

    const interval = setInterval(() => {
      // 1. Advance Game Clock
      const deltaGameSec = timeScale * 1.0;
      setGameSeconds((prev) => prev + deltaGameSec);

      // 2. Multi-Agent Decision & Motives Decay Loop
      setCharacters((prevChars) => {
        return prevChars.map((char) => {
          const updated = {
            ...char,
            motives: { ...char.motives },
            privateMemory: [...char.privateMemory],
          };

          // Gradual Motive Decay
          updated.motives.hunger = Math.max(0, updated.motives.hunger - 0.08 * timeScale);
          updated.motives.energy = Math.max(0, updated.motives.energy - 0.05 * timeScale);
          updated.motives.bladder = Math.max(0, updated.motives.bladder - 0.07 * timeScale);
          updated.motives.hygiene = Math.max(0, updated.motives.hygiene - 0.04 * timeScale);

          // Dark Mode Sanity Decay & Epistemic Hallucinations
          if (isDarkMode) {
            if (char.motives.energy < 20 || char.motives.hunger < 20) {
              updated.motives.sanity = Math.max(0, updated.motives.sanity - 0.15 * timeScale);
            }
            if (updated.motives.sanity < 35 && Math.random() < 0.03) {
              const hallucination = `[HALLUCINATION] I hear whispers whispering through the floorboards...`;
              updated.privateMemory.push(hallucination);
              updated.selfTalk = 'Someone is watching from behind the walls...';
              sound.playMurmur(0.8, true);
            }
          }

          // Off-Grid return logic (Tier 4 Outside World Agent)
          if (!updated.onGrid) {
            updated.actionTimer -= 1;
            if (updated.actionTimer <= 0) {
              // Return across grid sidewalk portal
              updated.onGrid = true;
              updated.pos = { x: 14, y: 0, z: 16 };
              updated.room = 'Yard';
              updated.currentAction = 'Returned from Town';
              updated.selfTalk = 'Back home on the lot. Needed that fresh air.';
              updated.motives.fun = Math.min(100, updated.motives.fun + 25);
              const returnMsg = `${char.name} stepped back onto the grid sidewalk.`;
              setWallLogs((l) => [...l, `[${formatGameTime(gameSeconds).timeStr}] ${returnMsg}`]);
              sound.playChime(true);
            }
            return updated;
          }

          // On-Grid Action Execution
          updated.actionTimer -= 1;
          if (updated.actionTimer <= 0) {
            // Autonomous Smart Object Choice
            const availableObjects = smartObjects.filter(
              (o) => o.maturity === 'ALL' || (o.maturity === 'DARK_ONLY' && isDarkMode)
            );

            // Determine highest physiological urgency
            let chosenObject: SmartObject | null = null;
            if (updated.motives.hunger < 35) {
              chosenObject = availableObjects.find((o) => o.id.includes('fridge') || o.id.includes('stove')) || null;
            } else if (updated.motives.energy < 30) {
              chosenObject = availableObjects.find((o) => o.id.includes('bed')) || null;
            } else if (updated.motives.bladder < 25) {
              chosenObject = availableObjects.find((o) => o.id.includes('toilet')) || null;
            } else if (updated.motives.hygiene < 30) {
              chosenObject = availableObjects.find((o) => o.id.includes('bathtub')) || null;
            } else {
              // Leisure or off-grid walk
              if (Math.random() < 0.15) {
                // Walk to sidewalk edge portal to leave the grid
                updated.pos = { x: 17.5, y: 0, z: 16 };
                updated.onGrid = false;
                updated.actionTimer = 25; // 25 seconds off-grid
                updated.currentAction = 'Left Grid to Town';
                updated.selfTalk = 'Heading out to run errands in town.';
                setWallLogs((l) => [
                  ...l,
                  `[${formatGameTime(gameSeconds).timeStr}] ${char.name} walked off the sidewalk portal.`,
                ]);
                return updated;
              }
              // Random recreational object
              const recreational = availableObjects.filter((o) =>
                o.id.includes('tv') || o.id.includes('sofa') || o.id.includes('easel') || o.id.includes('pool')
              );
              chosenObject = recreational[Math.floor(Math.random() * recreational.length)] || availableObjects[0];
            }

            if (chosenObject) {
              updated.room = chosenObject.room;
              updated.pos = { ...chosenObject.gridPos };
              updated.currentAction = chosenObject.actionLabel;
              updated.actionTimer = chosenObject.durationSeconds;

              // Apply motive effects
              Object.entries(chosenObject.effects).forEach(([stat, val]) => {
                const key = stat as keyof typeof updated.motives;
                if (typeof val === 'number') {
                  updated.motives[key] = Math.max(0, Math.min(100, updated.motives[key] + val));
                }
              });

              // Spontaneous self-talk generation
              const thoughtOptions = [
                `Making good use of the ${chosenObject.name.toLowerCase()}.`,
                `This is exactly what I needed right now.`,
                `Could use a bit more quiet around here.`,
                `Just taking things one task at a time.`,
              ];
              updated.selfTalk = thoughtOptions[Math.floor(Math.random() * thoughtOptions.length)];

              // Epistemic isolation: only record in observer memory if in perception range
              const logEntry = `[${formatGameTime(gameSeconds).timeStr} | ${chosenObject.room}] ${char.name} is ${chosenObject.actionLabel.toLowerCase()}.`;
              setWallLogs((l) => [...l, logEntry]);
              updated.privateMemory.push(logEntry);
              if (updated.privateMemory.length > 25) updated.privateMemory.shift();

              // Audio murmur
              sound.playMurmur(char.genderFrame === 'Feminine' ? 1.3 : 0.95, isDarkMode && updated.motives.sanity < 40);
            }
          }

          return updated;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeScale, smartObjects, isDarkMode, gameSeconds]);

  // Handlers for user interactions
  const handleSelectCharacter = (id: string) => {
    setSelectedCharId(id);
    sound.playClick(600);
  };

  const handleCommandAction = (charId: string, objectId: string) => {
    const targetObj = smartObjects.find((o) => o.id === objectId);
    if (!targetObj) return;

    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const updated = {
          ...c,
          room: targetObj.room,
          pos: { ...targetObj.gridPos },
          currentAction: targetObj.actionLabel,
          actionTimer: targetObj.durationSeconds,
          selfTalk: `Direct command: ${targetObj.actionLabel}.`,
        };
        sound.playChime(true);
        return updated;
      })
    );
  };

  const handleSendOffGrid = (charId: string) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const willBeOnGrid = !c.onGrid;
        return {
          ...c,
          onGrid: willBeOnGrid,
          pos: willBeOnGrid ? { x: 0, y: 0, z: 0 } : { x: 17.5, y: 0, z: 16 },
          currentAction: willBeOnGrid ? 'Returned to Lot' : 'Left Grid to Town',
          selfTalk: willBeOnGrid ? 'Returned home!' : 'Stepping beyond the sidewalk perimeter.',
        };
      })
    );
    sound.playClick(500);
  };

  const handleAddSmartObject = (newObj: SmartObject) => {
    setSmartObjects((prev) => [...prev, newObj]);
    setWallLogs((prev) => [
      ...prev,
      `[${formatGameTime(gameSeconds).timeStr}] New Smart Object '${newObj.name}' materialized in the ${newObj.room}.`,
    ]);
    sound.playChime(true);
  };

  const handleSaveCustomCharacter = (newChar: Character) => {
    setCharacters((prev) => [...prev, newChar]);
    setWallLogs((prev) => [
      ...prev,
      `[${formatGameTime(gameSeconds).timeStr}] ${newChar.name} moved into The House diorama lot!`,
    ]);
    sound.playChime(true);
  };

  const handleStartScenario = (scenario: Scenario, chosenMaturity: MaturityRating) => {
    setMaturity(chosenMaturity);
    setGameSeconds(8 * 3600);
    const newChars: Character[] = scenario.characters.map((c) => ({
      ...c,
      actionTimer: 5,
      currentAction: 'Settling into lot',
      selfTalk: `Ready for ${scenario.title}.`,
      privateMemory: [...c.privateMemory, ...(scenario.initialSecrets[c.id] || [])],
    }));
    setCharacters(newChars);
    setSelectedCharId(newChars[0]?.id || null);
    setWallLogs([
      `[08:00 AM | The House] Initialized scenario '${scenario.title}' (Mode: ${chosenMaturity}).`,
    ]);
    sound.playChime(true);
  };

  const handleStartRandomGame = (chosenMaturity: MaturityRating) => {
    setMaturity(chosenMaturity);
    setGameSeconds(8 * 3600);
    const randomTraits = ['Ambitious', 'Creative', 'Neat', 'Lazy', 'Foodie', 'Bookworm', 'Snob'];
    if (chosenMaturity === 'DARK_MODE') randomTraits.push('Paranoid', 'Secretive', 'Guilt-Ridden');

    const names = ['Evelyn Cross', 'Dante Vance', 'Liam Harper'];
    const colors = ['#4f46e5', '#059669', '#d97706'];

    const newChars: Character[] = names.map((name, i) => {
      const chosenT = [
        randomTraits[i % randomTraits.length],
        randomTraits[(i + 2) % randomTraits.length],
      ];
      return {
        id: `char_rand_${i}`,
        name,
        ageStage: 'Adult',
        traits: chosenT,
        lifeGoal: 'Make a lasting mark on the world',
        room: i === 0 ? 'LivingRoom' : i === 1 ? 'Kitchen' : 'Bedroom',
        pos: { x: (i - 1) * 5, y: 0, z: (i - 1) * 3 },
        onGrid: true,
        currentAction: 'Arrived on Lot',
        actionTimer: 4,
        selfTalk: 'Curious what this house has in store for me.',
        motives: { hunger: 80, energy: 85, bladder: 80, hygiene: 85, social: 70, fun: 70, sanity: 90 },
        privateMemory: [`Moved in with ${chosenT.join(' and ')} tendencies.`],
        color: colors[i],
        genderFrame: i % 2 === 0 ? 'Feminine' : 'Masculine',
        hairStyle: 'Cropped Bob',
        facialHair: 'None',
        clothingTop: 'Everyday Tee',
        clothingBottom: 'Denim Jeans',
      };
    });

    setCharacters(newChars);
    setSelectedCharId(newChars[0].id);
    setWallLogs([
      `[08:00 AM | The House] Procedural Random Start generated with 3 unique occupants.`,
    ]);
    sound.playChime(true);
  };

  const handleWhisperToCharacter = (charId: string, whisperText: string) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        return {
          ...c,
          selfTalk: `(Inner Voice): ${whisperText}`,
          privateMemory: [...c.privateMemory, `[INNER WHISPER] ${whisperText}`],
        };
      })
    );
    setWallLogs((l) => [
      ...l,
      `[${formatGameTime(gameSeconds).timeStr}] Subconscious whisper planted into character thoughts.`,
    ]);
  };

  const formattedTime = formatGameTime(gameSeconds);
  const selectedCharacter = characters.find((c) => c.id === selectedCharId);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 font-sans select-none">
      {/* 1. Main 3D Viewport: Floating Diorama Lot Grid */}
      <Viewport3D
        characters={characters}
        smartObjects={smartObjects}
        isDarkMode={isDarkMode}
        cutawayMode={cutawayMode}
        showGrid={showGrid}
        selectedCharacterId={selectedCharId}
        onSelectCharacter={handleSelectCharacter}
        isScreensaverMode={isScreensaverMode}
      />

      {/* 2. Top Header HUD Badge */}
      <header className="absolute top-4 left-4 z-20 pointer-events-auto flex items-center gap-3">
        <div className="px-3.5 py-2 rounded-2xl bg-gray-900/85 text-white border border-gray-700/80 shadow-xl backdrop-blur-none flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-xs font-bold tracking-tight flex items-center gap-1.5">
              <span>The House</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-normal bg-indigo-900 text-indigo-300">
                {isDarkMode ? 'Dark Mode' : 'Family Friendly'}
              </span>
            </h1>
            <p className="text-[10px] text-gray-400">
              3D Autonomous Life Diorama • {characters.filter((c) => c.onGrid).length} Occupants on Grid
            </p>
          </div>
        </div>
      </header>

      {/* 3. Character Inspector Panel (when a character is clicked) */}
      {selectedCharacter && (
        <CharacterInspector
          character={selectedCharacter}
          onClose={() => setSelectedCharId(null)}
          smartObjects={smartObjects}
          onCommandAction={handleCommandAction}
          onSendOffGrid={handleSendOffGrid}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 4. Collapsible Bottom Control Dock */}
      <BottomDock
        timeStr={formattedTime.timeStr}
        day={formattedTime.day}
        timeScale={timeScale}
        onSetTimeScale={setTimeScale}
        cutawayMode={cutawayMode}
        onSetCutawayMode={setCutawayMode}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          setIsMuted(next);
          sound.setMuted(next);
        }}
        isScreensaverMode={isScreensaverMode}
        onToggleScreensaver={() => setIsScreensaverMode(!isScreensaverMode)}
        isMobileSimMode={isMobileSimMode}
        onToggleMobileSim={() => setIsMobileSimMode(!isMobileSimMode)}
        onOpenCAS={() => setShowCASModal(true)}
        onOpenChatbot={() => setShowChatbotModal(true)}
        onOpenAssetStudio={() => setShowAssetStudioModal(true)}
        onOpenScenarios={() => setShowScenarioModal(true)}
        isDarkMode={isDarkMode}
      />

      {/* 5. Modals */}
      {showCASModal && (
        <CharacterCreatorModal
          onClose={() => setShowCASModal(false)}
          onSaveCharacter={handleSaveCustomCharacter}
          isDarkMode={isDarkMode}
        />
      )}

      {showChatbotModal && (
        <HouseChatbotModal
          onClose={() => setShowChatbotModal(false)}
          characters={characters}
          wallLogs={wallLogs}
          isDarkMode={isDarkMode}
          onWhisperToCharacter={handleWhisperToCharacter}
        />
      )}

      {showAssetStudioModal && (
        <AssetStudioModal
          onClose={() => setShowAssetStudioModal(false)}
          onAddSmartObject={handleAddSmartObject}
          isDarkMode={isDarkMode}
        />
      )}

      {showScenarioModal && (
        <ScenarioModal
          onClose={() => setShowScenarioModal(false)}
          onStartScenario={handleStartScenario}
          onStartRandomGame={handleStartRandomGame}
          currentMaturity={maturity}
        />
      )}

      {isMobileSimMode && (
        <MobileSimulatorView
          onClose={() => setIsMobileSimMode(false)}
          characters={characters}
          smartObjects={smartObjects}
          timeStr={formattedTime.timeStr}
          day={formattedTime.day}
          onSelectCharacter={handleSelectCharacter}
          onOpenChatbot={() => setShowChatbotModal(true)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
