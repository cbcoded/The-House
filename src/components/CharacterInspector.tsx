/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Character, SmartObject } from '../game/simulation';
import { sound } from '../game/soundSynth';
import {
  X,
  Volume2,
  Brain,
  Sparkles,
  MapPin,
  Heart,
  Zap,
  Smile,
  ShieldAlert,
  Compass,
} from 'lucide-react';

interface CharacterInspectorProps {
  character: Character;
  onClose: () => void;
  smartObjects: SmartObject[];
  onCommandAction: (charId: string, objectId: string) => void;
  onSendOffGrid: (charId: string) => void;
  isDarkMode: boolean;
}

export const CharacterInspector: React.FC<CharacterInspectorProps> = ({
  character,
  onClose,
  smartObjects,
  onCommandAction,
  onSendOffGrid,
  isDarkMode,
}) => {
  const getSanityStatus = (val: number) => {
    if (val >= 75) return { label: 'Sound Mind', color: 'text-emerald-500' };
    if (val >= 45) return { label: 'Neurotic Tension', color: 'text-amber-500' };
    if (val >= 20) return { label: 'Delusional Paranoia', color: 'text-purple-400' };
    return { label: 'Psychotic Break', color: 'text-red-500 animate-pulse' };
  };

  const sanityInfo = getSanityStatus(character.motives.sanity);

  const handleSpeak = () => {
    if (character.selfTalk) {
      sound.speakEnglish(character.selfTalk, character.genderFrame === 'Feminine' ? 1.2 : 0.9);
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-40 w-80 sm:w-88 rounded-2xl border shadow-2xl p-4 transition-all duration-200 backdrop-blur-none max-h-[88vh] overflow-y-auto ${
        isDarkMode
          ? 'bg-gray-950/95 text-gray-100 border-purple-900/80'
          : 'bg-white/95 text-gray-900 border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-inner"
            style={{ backgroundColor: character.color }}
          >
            {character.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">{character.name}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span>{character.ageStage}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" />
                {character.onGrid ? character.room : 'Off-Grid (Downtown)'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Spontaneous Self-Talk Bubble */}
      <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
        <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Vocalized Self-Talk
          </span>
          <button
            onClick={handleSpeak}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-gray-900 text-indigo-600 hover:bg-indigo-100 transition-colors text-[10px] cursor-pointer"
          >
            <Volume2 className="w-3 h-3" />
            Listen
          </button>
        </div>
        <p className="text-xs italic text-gray-700 dark:text-gray-300 leading-relaxed">
          "{character.selfTalk || 'Just taking in the day...'}"
        </p>
      </div>

      {/* Sanity Bar */}
      <div className="mt-3.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-semibold flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            Sanity
          </span>
          <span className={`font-mono text-xs font-bold ${sanityInfo.color}`}>
            {Math.round(character.motives.sanity)}% ({sanityInfo.label})
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              character.motives.sanity < 30
                ? 'bg-purple-600'
                : character.motives.sanity < 60
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${character.motives.sanity}%` }}
          />
        </div>
      </div>

      {/* 6 Motives Matrix */}
      <div className="mt-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Needs & Motives</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Hunger', val: character.motives.hunger, icon: Heart, color: 'bg-orange-500' },
            { label: 'Energy', val: character.motives.energy, icon: Zap, color: 'bg-blue-500' },
            { label: 'Bladder', val: character.motives.bladder, icon: Compass, color: 'bg-cyan-500' },
            { label: 'Hygiene', val: character.motives.hygiene, icon: Sparkles, color: 'bg-teal-500' },
            { label: 'Social', val: character.motives.social, icon: Smile, color: 'bg-pink-500' },
            { label: 'Fun', val: character.motives.fun, icon: Sparkles, color: 'bg-yellow-500' },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  {label}
                </span>
                <span className="font-mono text-[10px] font-bold">{Math.round(val)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    val < 30 ? 'bg-red-500' : val < 60 ? 'bg-amber-500' : color
                  }`}
                  style={{ width: `${val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traits & Aspiration */}
      <div className="mt-3.5 pt-3 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs mb-1 text-gray-500">
          <span className="font-bold text-gray-700 dark:text-gray-300">Life Goal: </span>
          {character.lifeGoal}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {character.traits.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Epistemically Isolated Memory Stream */}
      <div className="mt-3.5 pt-3 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
          Private Knowledge Stream
        </h3>
        <p className="text-[10px] text-gray-400 mb-2">
          Strictly epistemically isolated — {character.name} only knows what they personally saw or heard.
        </p>
        <div className="space-y-1.5 max-h-28 overflow-y-auto font-mono text-[11px] text-gray-700 dark:text-gray-300">
          {character.privateMemory.slice(-4).map((mem, i) => (
            <div key={i} className="p-1.5 rounded bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/60 leading-tight">
              • {mem}
            </div>
          ))}
        </div>
      </div>

      {/* Command Directives */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
        <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Direct Command</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {smartObjects
            .filter((o) => o.maturity === 'ALL' || isDarkMode)
            .slice(0, 4)
            .map((obj) => (
              <button
                key={obj.id}
                onClick={() => onCommandAction(character.id, obj.id)}
                className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-gray-100 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-950 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors text-left truncate cursor-pointer"
              >
                Use {obj.name.split(' ')[0]}
              </button>
            ))}
          <button
            onClick={() => onSendOffGrid(character.id)}
            className="col-span-2 px-2 py-1.5 text-[11px] font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 transition-colors text-center cursor-pointer"
          >
            {character.onGrid ? 'Walk Off-Grid to Town Portal' : 'Return to Lot'}
          </button>
        </div>
      </div>
    </div>
  );
};
