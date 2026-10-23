/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  FastForward,
  Grid,
  Eye,
  UserPlus,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  Tv,
  Smartphone,
  BookOpen,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { WallCutawayMode } from '../game/sceneBuilder';

interface BottomDockProps {
  timeStr: string;
  day: number;
  timeScale: number;
  onSetTimeScale: (scale: number) => void;
  cutawayMode: WallCutawayMode;
  onSetCutawayMode: (mode: WallCutawayMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isScreensaverMode: boolean;
  onToggleScreensaver: () => void;
  isMobileSimMode: boolean;
  onToggleMobileSim: () => void;
  onOpenCAS: () => void;
  onOpenChatbot: () => void;
  onOpenAssetStudio: () => void;
  onOpenScenarios: () => void;
  isDarkMode: boolean;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  timeStr,
  day,
  timeScale,
  onSetTimeScale,
  cutawayMode,
  onSetCutawayMode,
  showGrid,
  onToggleGrid,
  isMuted,
  onToggleMute,
  isScreensaverMode,
  onToggleScreensaver,
  isMobileSimMode,
  onToggleMobileSim,
  onOpenCAS,
  onOpenChatbot,
  onOpenAssetStudio,
  onOpenScenarios,
  isDarkMode,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto max-w-[96vw]">
      {/* Collapse / Expand Toggle Tab */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="px-3 py-1 bg-gray-900/90 hover:bg-gray-800 text-gray-200 text-xs font-medium rounded-t-lg border-t border-x border-gray-700/80 shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
        aria-label="Toggle Controls Dock"
      >
        {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{isCollapsed ? 'Show Controls (H)' : 'Hide Controls'}</span>
      </button>

      {/* Main Unified Dock */}
      {!isCollapsed && (
        <div
          className={`px-4 py-2.5 rounded-2xl border shadow-2xl flex flex-wrap items-center gap-3 sm:gap-4 transition-all duration-200 backdrop-blur-none ${
            isDarkMode
              ? 'bg-gray-950/95 text-gray-100 border-purple-900/80'
              : 'bg-white/95 text-gray-800 border-gray-200/90'
          }`}
          style={{ maxWidth: 'min(980px, 94vw)' }}
        >
          {/* Clock & Speed Section */}
          <div className="flex items-center gap-2 pr-3 border-r border-gray-300 dark:border-gray-800">
            <div className="text-left leading-tight">
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-indigo-500 dark:text-indigo-400">
                Day {day}
              </span>
              <span className="font-mono font-bold text-sm tabular-nums">{timeStr}</span>
            </div>

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => onSetTimeScale(0)}
                className={`p-1.5 rounded-md transition-colors ${
                  timeScale === 0
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Pause"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSetTimeScale(1)}
                className={`p-1.5 rounded-md transition-colors ${
                  timeScale === 1
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="1x Real Pacing"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onSetTimeScale(3)}
                className={`px-1.5 py-1 rounded-md text-xs font-bold transition-colors ${
                  timeScale === 3
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="3x Time Scale (The House Standard: 20m = 1hr)"
              >
                3x
              </button>
              <button
                onClick={() => onSetTimeScale(5)}
                className={`p-1.5 rounded-md transition-colors ${
                  timeScale === 5
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="5x Fast Forward"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Wall Cutaway Mode Pills */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onSetCutawayMode('CUTAWAY')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                cutawayMode === 'CUTAWAY'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Cutaway
            </button>
            <button
              onClick={() => onSetCutawayMode('WALLS_UP')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                cutawayMode === 'WALLS_UP'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Walls Up
            </button>
            <button
              onClick={() => onSetCutawayMode('WALLS_DOWN')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                cutawayMode === 'WALLS_DOWN'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Walls Down
            </button>
          </div>

          {/* View Toggles: Grid, Wallpaper, Sound */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleGrid}
              className={`p-2 rounded-lg border transition-colors ${
                showGrid
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-600 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Toggle Lot Grid Lines"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleScreensaver}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isScreensaverMode
                  ? 'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-200'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Screensaver / Live Wallpaper Mode (Cinematic Auto-Director)"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{isScreensaverMode ? 'Screensaver ON' : 'Wallpaper Mode'}</span>
            </button>

            <button
              onClick={onToggleMobileSim}
              className={`p-2 rounded-lg border transition-colors ${
                isMobileSimMode
                  ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950 dark:border-blue-600 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              title="Toggle Android Smartphone Remote Simulator View"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Subsystems Modals Launchers */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-300 dark:border-gray-800">
            <button
              onClick={onOpenChatbot}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>The House</span>
            </button>

            <button
              onClick={onOpenCAS}
              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CAS</span>
            </button>

            <button
              onClick={onOpenAssetStudio}
              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Asset Studio</span>
            </button>

            <button
              onClick={onOpenScenarios}
              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scenarios</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
