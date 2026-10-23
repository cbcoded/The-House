/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, Box, Sliders, ShieldAlert } from 'lucide-react';
import { SmartObject } from '../game/simulation';

interface AssetStudioModalProps {
  onClose: () => void;
  onAddSmartObject: (object: SmartObject) => void;
  isDarkMode: boolean;
}

export const AssetStudioModal: React.FC<AssetStudioModalProps> = ({
  onClose,
  onAddSmartObject,
  isDarkMode,
}) => {
  const [prompt, setPrompt] = useState('Vintage Espresso Maker');
  const [room, setRoom] = useState<'Kitchen' | 'LivingRoom' | 'Bedroom' | 'Bathroom' | 'Study' | 'Yard' | 'Basement'>('Kitchen');
  const [maturity, setMaturity] = useState<'ALL' | 'DARK_ONLY'>('ALL');
  const [actionLabel, setActionLabel] = useState('Brewing fresh espresso');
  const [energyBonus, setEnergyBonus] = useState(30);
  const [funBonus, setFunBonus] = useState(15);
  const [sanityBonus, setSanityBonus] = useState(5);
  const [duration, setDuration] = useState(8);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Determine grid coordinates based on room
    let basePos = { x: 0, y: 0, z: 0 };
    if (room === 'Kitchen') basePos = { x: -3, y: 0, z: -3 };
    else if (room === 'LivingRoom') basePos = { x: 3, y: 0, z: -3 };
    else if (room === 'Bedroom') basePos = { x: 3, y: 0, z: 3 };
    else if (room === 'Study') basePos = { x: -6, y: 0, z: 2 };
    else if (room === 'Bathroom') basePos = { x: -2, y: 0, z: 5 };
    else if (room === 'Yard') basePos = { x: 6, y: 0, z: -12 };
    else if (room === 'Basement') basePos = { x: 2, y: -4, z: 2 };

    const newObj: SmartObject = {
      id: `gen_obj_${Date.now()}`,
      name: prompt.trim(),
      room,
      category: room.toLowerCase() as SmartObject['category'],
      gridPos: basePos,
      state: 'Clean',
      maturity,
      effects: {
        energy: energyBonus,
        fun: funBonus,
        sanity: sanityBonus,
      },
      actionLabel,
      durationSeconds: duration,
    };

    onAddSmartObject(newObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 overflow-hidden max-h-[92vh] flex flex-col ${
          isDarkMode
            ? 'bg-gray-950 text-gray-100 border-purple-900/80'
            : 'bg-white text-gray-900 border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Generative 3D Asset Studio</h2>
              <p className="text-xs text-gray-500">
                AI Smart Object Generator with Parameter Binding & Motive Advertisements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="overflow-y-auto pr-1 flex-1 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Asset Concept & Prompt
            </label>
            <input
              type="text"
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Antique Gramophone, Luxury Hot Tub, Iron Wall Cage"
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Target Room
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value as typeof room)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="LivingRoom">Living Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Study">Study</option>
                <option value="Yard">Yard / Lawn</option>
                {isDarkMode && <option value="Basement">Sub-Basement Dungeon</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Maturity Rating
              </label>
              <select
                value={maturity}
                onChange={(e) => setMaturity(e.target.value as typeof maturity)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                <option value="ALL">Family Friendly (All)</option>
                <option value="DARK_ONLY">Dark Mode Only (Psych / Dungeon)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Action Status Label
            </label>
            <input
              type="text"
              required
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              placeholder="e.g. Admiring vintage music"
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
            />
          </div>

          {/* Parameter Sliders */}
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              Smart Object Parameter Binding (Motive Impact)
            </h3>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Energy Boost</span>
                <span className="font-mono font-bold">+{energyBonus}</span>
              </div>
              <input
                type="range"
                min={-30}
                max={60}
                value={energyBonus}
                onChange={(e) => setEnergyBonus(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Fun / Recreation Boost</span>
                <span className="font-mono font-bold">+{funBonus}</span>
              </div>
              <input
                type="range"
                min={-20}
                max={60}
                value={funBonus}
                onChange={(e) => setFunBonus(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Sanity Impact</span>
                <span className="font-mono font-bold">{sanityBonus >= 0 ? `+${sanityBonus}` : sanityBonus}</span>
              </div>
              <input
                type="range"
                min={-50}
                max={30}
                value={sanityBonus}
                onChange={(e) => setSanityBonus(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Box className="w-3.5 h-3.5" />
              Bind Parameters & Place on Lot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
