/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, User, Palette, Award, Scissors } from 'lucide-react';
import { Character } from '../game/simulation';

interface CharacterCreatorModalProps {
  onClose: () => void;
  onSaveCharacter: (character: Character) => void;
  isDarkMode: boolean;
}

const TRAIT_OPTIONS = [
  'Ambitious',
  'Neat',
  'Lazy',
  'Creative',
  'Artistic',
  'Snob',
  'Bookworm',
  'Foodie',
  'Outgoing',
  'Clumsy',
  'Workaholic',
  'Free Spirit',
  'Secretive',
  'Paranoid',
  'NightOwl',
  'Guilt-Ridden',
];

const HAIR_OPTIONS = ['Cropped Bob', 'Shoulder Wavy', 'Messy Bun', 'Disheveled Bedhead', 'Neat Side Part'];
const BEARD_OPTIONS = ['None', '5-O-Clock Stubble', 'Boxed Beard', 'Overgrown Beard'];
const TOP_OPTIONS = ['Everyday Tee', 'Cardigan', 'Hoodie', 'Formal Shirt'];
const BOTTOM_OPTIONS = ['Denim Jeans', 'Lounge Shorts', 'Chino Trousers'];

const COLOR_SWATCHES = [
  '#4f46e5',
  '#059669',
  '#dc2626',
  '#d97706',
  '#9333ea',
  '#2563eb',
  '#db2777',
  '#0d9488',
];

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  onClose,
  onSaveCharacter,
  isDarkMode,
}) => {
  const [name, setName] = useState('');
  const [ageStage, setAgeStage] = useState<'Young Adult' | 'Adult' | 'Elder'>('Adult');
  const [genderFrame, setGenderFrame] = useState<'Masculine' | 'Feminine' | 'Unisex'>('Unisex');
  const [hairStyle, setHairStyle] = useState('Cropped Bob');
  const [facialHair, setFacialHair] = useState('None');
  const [clothingTop, setClothingTop] = useState('Everyday Tee');
  const [clothingBottom, setClothingBottom] = useState('Denim Jeans');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Creative', 'Ambitious']);
  const [lifeGoal, setLifeGoal] = useState('Renaissance Innovator');
  const [color, setColor] = useState('#4f46e5');

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      if (selectedTraits.length < 3) {
        setSelectedTraits([...selectedTraits, trait]);
      }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newChar: Character = {
      id: `char_custom_${Date.now()}`,
      name: name.trim(),
      ageStage,
      traits: selectedTraits,
      lifeGoal,
      room: 'LivingRoom',
      pos: { x: (Math.random() - 0.5) * 8, y: 0, z: (Math.random() - 0.5) * 6 },
      onGrid: true,
      currentAction: 'Just moved in',
      actionTimer: 0,
      selfTalk: `Fresh start in The House. Let's see what happens here.`,
      motives: {
        hunger: 80,
        energy: 85,
        bladder: 85,
        hygiene: 90,
        social: 75,
        fun: 70,
        sanity: 95,
      },
      privateMemory: [`Moved into The House as ${ageStage} with the aspiration of ${lifeGoal}.`],
      color,
      genderFrame,
      hairStyle,
      facialHair,
      clothingTop,
      clothingBottom,
    };

    onSaveCharacter(newChar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 overflow-hidden max-h-[92vh] flex flex-col ${
          isDarkMode
            ? 'bg-gray-950 text-gray-100 border-purple-900/80'
            : 'bg-white text-gray-900 border-gray-200'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Create-A-Sim (CAS)</h2>
              <p className="text-xs text-gray-500">
                Low-Poly Sims 3 Base + Realistic Graphite/Pencil Outline Aesthetic
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

        {/* Modal Body Form */}
        <form onSubmit={handleCreate} className="overflow-y-auto pr-1 flex-1 py-4 space-y-5">
          {/* Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Character Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Julian Brooks"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Life Stage
              </label>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden text-xs">
                {(['Young Adult', 'Adult', 'Elder'] as const).map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setAgeStage(stage)}
                    className={`flex-1 py-2 font-medium transition-colors ${
                      ageStage === stage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Physical Frame & Decoupled Gender Fit */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Physical Rig Frame (Decoupled Tagging)
            </label>
            <div className="flex gap-2 text-xs">
              {(['Unisex', 'Feminine', 'Masculine'] as const).map((frame) => (
                <button
                  key={frame}
                  type="button"
                  onClick={() => setGenderFrame(frame)}
                  className={`flex-1 py-1.5 rounded-lg border font-medium transition-colors ${
                    genderFrame === frame
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {frame}
                </button>
              ))}
            </div>
          </div>

          {/* Hair & Grooming */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5" /> Hair Style
              </label>
              <select
                value={hairStyle}
                onChange={(e) => setHairStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                {HAIR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Facial Hair / Beard Growth
              </label>
              <select
                value={facialHair}
                onChange={(e) => setFacialHair(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                {BEARD_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wardrobe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Top Outfit
              </label>
              <select
                value={clothingTop}
                onChange={(e) => setClothingTop(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                {TOP_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Bottom Outfit
              </label>
              <select
                value={clothingBottom}
                onChange={(e) => setClothingBottom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
              >
                {BOTTOM_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Swatch & Plumbob Accent */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> Favorite Color & Clothes Tone
            </label>
            <div className="flex gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === swatch ? 'scale-125 border-gray-900 dark:border-white shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          {/* Traits (Up to 3) */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>Personal Traits (Select up to 3)</span>
              <span className="text-[11px] text-indigo-500 font-normal">{selectedTraits.length}/3 selected</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TRAIT_OPTIONS.map((trait) => {
                const isSelected = selectedTraits.includes(trait);
                return (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {trait}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Life Goal / Aspiration */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Life Goal / Lifetime Wish
            </label>
            <input
              type="text"
              required
              value={lifeGoal}
              onChange={(e) => setLifeGoal(e.target.value)}
              placeholder="e.g. Master of the Arts, World Renowned Surgeon"
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Spawn Character to Lot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
