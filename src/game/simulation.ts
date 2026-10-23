/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Motives {
  hunger: number;
  energy: number;
  bladder: number;
  hygiene: number;
  social: number;
  fun: number;
  sanity: number;
}

export type MaturityRating = 'FAMILY_FRIENDLY' | 'DARK_MODE';

export interface SmartObject {
  id: string;
  name: string;
  room: string;
  category: 'kitchen' | 'living' | 'bedroom' | 'bathroom' | 'study' | 'outdoor' | 'basement';
  gridPos: { x: number; y: number; z: number };
  state: 'Clean' | 'Dirty' | 'Broken' | 'InUse' | 'Bloodstained';
  maturity: 'ALL' | 'DARK_ONLY';
  effects: Partial<Motives>;
  actionLabel: string;
  durationSeconds: number;
}

export interface Character {
  id: string;
  name: string;
  ageStage: 'Young Adult' | 'Adult' | 'Elder';
  traits: string[];
  lifeGoal: string;
  room: string;
  pos: { x: number; y: number; z: number };
  onGrid: boolean;
  currentAction: string;
  actionTimer: number;
  selfTalk: string;
  motives: Motives;
  privateMemory: string[];
  color: string;
  genderFrame: 'Masculine' | 'Feminine' | 'Unisex';
  hairStyle: string;
  facialHair: string;
  clothingTop: string;
  clothingBottom: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  maturity: MaturityRating;
  startingTimeStr: string;
  characters: Omit<Character, 'actionTimer' | 'currentAction' | 'selfTalk'>[];
  initialSecrets: Record<string, string[]>;
}

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'inherited_fixer_upper',
    title: 'The Inherited Fixer-Upper',
    description: 'Three distant relatives inherit a charming vintage estate, but half the appliances are broken and funds are tight.',
    maturity: 'FAMILY_FRIENDLY',
    startingTimeStr: '08:00 AM',
    characters: [
      {
        id: 'char_elena',
        name: 'Elena Vance',
        ageStage: 'Adult',
        traits: ['Ambitious', 'Neat', 'Perfectionist'],
        lifeGoal: 'Master Architect & Renovation Icon',
        room: 'Kitchen',
        pos: { x: -6, y: 0, z: -4 },
        onGrid: true,
        motives: { hunger: 75, energy: 80, bladder: 85, hygiene: 70, social: 60, fun: 50, sanity: 95 },
        privateMemory: ['Arrived at the inherited estate. The plumbing needs urgent work.'],
        color: '#4f46e5',
        genderFrame: 'Feminine',
        hairStyle: 'Messy Bun',
        facialHair: 'None',
        clothingTop: 'Cardigan',
        clothingBottom: 'Denim Jeans',
      },
      {
        id: 'char_marcus',
        name: 'Marcus Cole',
        ageStage: 'Young Adult',
        traits: ['Creative', 'Artistic', 'Lazy'],
        lifeGoal: 'Renowned Canvas Painter',
        room: 'Study',
        pos: { x: -6, y: 0, z: 6 },
        onGrid: true,
        motives: { hunger: 60, energy: 65, bladder: 90, hygiene: 80, social: 70, fun: 75, sanity: 90 },
        privateMemory: ['Found an easel in the study. Hoping I can paint rather than clean.'],
        color: '#059669',
        genderFrame: 'Masculine',
        hairStyle: 'Shoulder Wavy',
        facialHair: 'Short Stubble',
        clothingTop: 'Everyday Tee',
        clothingBottom: 'Lounge Shorts',
      },
      {
        id: 'char_sophia',
        name: 'Sophia Reed',
        ageStage: 'Young Adult',
        traits: ['Outgoing', 'Foodie', 'Bookworm'],
        lifeGoal: 'Celebrity Chef & Author',
        room: 'LivingRoom',
        pos: { x: 6, y: 0, z: -4 },
        onGrid: true,
        motives: { hunger: 85, energy: 90, bladder: 80, hygiene: 90, social: 85, fun: 80, sanity: 100 },
        privateMemory: ['The garden has rich soil. Planning a vegetable patch.'],
        color: '#d97706',
        genderFrame: 'Feminine',
        hairStyle: 'Cropped Bob',
        facialHair: 'None',
        clothingTop: 'Hoodie',
        clothingBottom: 'Denim Jeans',
      },
    ],
    initialSecrets: {
      char_elena: ['Elena secretly plans to flip the house as soon as repairs conclude.'],
      char_marcus: ['Marcus hid his last $500 beneath the living room rug for canvas supplies.'],
    },
  },
  {
    id: 'sitcom_roommates',
    title: 'Double-Booked Roommates',
    description: 'A mix-up with the lease leaves two ambitious strangers sharing a single compact suburban home.',
    maturity: 'FAMILY_FRIENDLY',
    startingTimeStr: '09:30 AM',
    characters: [
      {
        id: 'char_oliver',
        name: 'Oliver Thorne',
        ageStage: 'Adult',
        traits: ['Workaholic', 'Genius', 'Snob'],
        lifeGoal: 'Tech Mogul & Investor',
        room: 'LivingRoom',
        pos: { x: 4, y: 0, z: -2 },
        onGrid: true,
        motives: { hunger: 70, energy: 60, bladder: 80, hygiene: 85, social: 40, fun: 45, sanity: 90 },
        privateMemory: ['I booked this lot six months in advance. Who is this other person?'],
        color: '#2563eb',
        genderFrame: 'Masculine',
        hairStyle: 'Neat Side Part',
        facialHair: 'Boxed Beard',
        clothingTop: 'Cardigan',
        clothingBottom: 'Denim Jeans',
      },
      {
        id: 'char_chloe',
        name: 'Chloe Bennett',
        ageStage: 'Young Adult',
        traits: ['Free Spirit', 'Music Lover', 'Clumsy'],
        lifeGoal: 'Chart-Topping Singer-Songwriter',
        room: 'Bedroom',
        pos: { x: 6, y: 0, z: 6 },
        onGrid: true,
        motives: { hunger: 80, energy: 85, bladder: 90, hygiene: 90, social: 75, fun: 90, sanity: 95 },
        privateMemory: ['The acoustics here are magical, even if my roommate is uptight.'],
        color: '#db2777',
        genderFrame: 'Feminine',
        hairStyle: 'Long Wavy',
        facialHair: 'None',
        clothingTop: 'Everyday Tee',
        clothingBottom: 'Lounge Shorts',
      },
    ],
    initialSecrets: {
      char_oliver: ['Oliver needs total quiet between 2 PM and 5 PM for international calls.'],
      char_chloe: ['Chloe accidentally cracked the patio flower pot and blamed the wind.'],
    },
  },
  {
    id: 'beneath_floorboards',
    title: 'Beneath the Floorboards',
    description: 'A seemingly quiet home on the surface, but a soundproofed subterranean room holds dark secrets and fraying sanity.',
    maturity: 'DARK_MODE',
    startingTimeStr: '01:00 AM',
    characters: [
      {
        id: 'char_arthur',
        name: 'Arthur Blackwood',
        ageStage: 'Adult',
        traits: ['Secretive', 'Paranoid', 'NightOwl', 'Guilt-Ridden'],
        lifeGoal: 'Conceal the Truth at All Costs',
        room: 'Basement',
        pos: { x: 0, y: -4, z: 0 },
        onGrid: true,
        motives: { hunger: 50, energy: 40, bladder: 70, hygiene: 60, social: 25, fun: 20, sanity: 38 },
        privateMemory: [
          '[CONFIDENTIAL] I built the reinforced cellar below the earth skirt. No one above must ever find the heavy lock.',
        ],
        color: '#dc2626',
        genderFrame: 'Masculine',
        hairStyle: 'Disheveled Bedhead',
        facialHair: 'Overgrown Beard',
        clothingTop: 'Hoodie',
        clothingBottom: 'Denim Jeans',
      },
      {
        id: 'char_clara',
        name: 'Clara Blackwood',
        ageStage: 'Adult',
        traits: ['Observant', 'Neat', 'Anxious'],
        lifeGoal: 'Uncover Household Mysteries',
        room: 'Bedroom',
        pos: { x: 6, y: 0, z: 6 },
        onGrid: true,
        motives: { hunger: 70, energy: 75, bladder: 80, hygiene: 85, social: 50, fun: 40, sanity: 75 },
        privateMemory: [
          'Arthur was awake past midnight again. I hear strange pipes vibrating through the floorboards.',
        ],
        color: '#9333ea',
        genderFrame: 'Feminine',
        hairStyle: 'Shoulder Wavy',
        facialHair: 'None',
        clothingTop: 'Everyday Tee',
        clothingBottom: 'Lounge Shorts',
      },
    ],
    initialSecrets: {
      char_arthur: ['Arthur keeps the reinforced cellar key inside his coat pocket.'],
      char_clara: ['Clara noticed mud tracks leading toward the basement door yesterday.'],
    },
  },
];

export const DEFAULT_SMART_OBJECTS: SmartObject[] = [
  {
    id: 'obj_fridge',
    name: 'Retro Frost Refrigerator',
    room: 'Kitchen',
    category: 'kitchen',
    gridPos: { x: -8, y: 0, z: -7 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { hunger: 45, energy: 5 },
    actionLabel: 'Eating a quick snack',
    durationSeconds: 8,
  },
  {
    id: 'obj_stove',
    name: 'ChefMaster 4-Burner Stove',
    room: 'Kitchen',
    category: 'kitchen',
    gridPos: { x: -5, y: 0, z: -7 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { hunger: 65, fun: 10 },
    actionLabel: 'Cooking a warm meal',
    durationSeconds: 12,
  },
  {
    id: 'obj_tv',
    name: 'Vintage Console Television',
    room: 'LivingRoom',
    category: 'living',
    gridPos: { x: 7, y: 0, z: -7 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { fun: 35, social: 10, sanity: 5 },
    actionLabel: 'Watching comedy sitcom',
    durationSeconds: 10,
  },
  {
    id: 'obj_sofa',
    name: 'Tufted Velvet Sofa',
    room: 'LivingRoom',
    category: 'living',
    gridPos: { x: 6, y: 0, z: -3 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { energy: 20, fun: 15, social: 15 },
    actionLabel: 'Lounging on the sofa',
    durationSeconds: 8,
  },
  {
    id: 'obj_bed',
    name: 'Canopy Feather Double Bed',
    room: 'Bedroom',
    category: 'bedroom',
    gridPos: { x: 6, y: 0, z: 6 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { energy: 70, sanity: 15 },
    actionLabel: 'Sleeping peacefully',
    durationSeconds: 14,
  },
  {
    id: 'obj_bathtub',
    name: 'Porcelain Clawfoot Bathtub',
    room: 'Bathroom',
    category: 'bathroom',
    gridPos: { x: 1, y: 0, z: 7 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { hygiene: 75, sanity: 10 },
    actionLabel: 'Taking a relaxing warm bath',
    durationSeconds: 10,
  },
  {
    id: 'obj_toilet',
    name: 'Classic Flush Toilet',
    room: 'Bathroom',
    category: 'bathroom',
    gridPos: { x: -2, y: 0, z: 7 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { bladder: 80 },
    actionLabel: 'Using the bathroom',
    durationSeconds: 6,
  },
  {
    id: 'obj_easel',
    name: 'Oak Studio Painting Easel',
    room: 'Study',
    category: 'study',
    gridPos: { x: -6, y: 0, z: 5 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { fun: 40, sanity: 10 },
    actionLabel: 'Painting an expressive landscape',
    durationSeconds: 12,
  },
  {
    id: 'obj_bookshelf',
    name: 'Carved Mahogany Bookshelf',
    room: 'Study',
    category: 'study',
    gridPos: { x: -8, y: 0, z: 2 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { fun: 30, sanity: 8 },
    actionLabel: 'Reading an antique novel',
    durationSeconds: 9,
  },
  {
    id: 'obj_pool',
    name: 'Backyard Swimming Pool',
    room: 'Yard',
    category: 'outdoor',
    gridPos: { x: 0, y: 0, z: -16 },
    state: 'Clean',
    maturity: 'ALL',
    effects: { fun: 50, energy: -10, hygiene: 15, sanity: 15 },
    actionLabel: 'Swimming laps in the pool',
    durationSeconds: 12,
  },
  {
    id: 'obj_dungeon_restraint',
    name: 'Iron Restraint Chair',
    room: 'Basement',
    category: 'basement',
    gridPos: { x: 0, y: -4, z: 0 },
    state: 'Bloodstained',
    maturity: 'DARK_ONLY',
    effects: { sanity: -30, fun: 15 },
    actionLabel: 'Inspecting locked iron restraints',
    durationSeconds: 8,
  },
];

/**
 * Calculates time elapsed at 3x ratio: 20 real minutes = 1 in-game hour.
 * 1 real second = 3 game seconds.
 */
export function calculateGameTime(realElapsedSeconds: number, timeMultiplier: number = 3.0): number {
  return realElapsedSeconds * timeMultiplier;
}

/**
 * Formats in-game seconds into Day and HH:MM format.
 */
export function formatGameTime(totalGameSeconds: number): { day: number; timeStr: string; isNight: boolean } {
  const day = Math.floor(totalGameSeconds / 86400) + 1;
  const secondOfDay = totalGameSeconds % 86400;
  const hours = Math.floor(secondOfDay / 3600);
  const minutes = Math.floor((secondOfDay % 3600) / 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const padMin = minutes.toString().padStart(2, '0');
  const isNight = hours < 6 || hours >= 21;
  return {
    day,
    timeStr: `${displayHours}:${padMin} ${ampm}`,
    isNight,
  };
}

/**
 * Generates offline history and catches up state when returning after real-time absence.
 */
export function simulateOfflineHistory(
  realSecondsPassed: number,
  characters: Character[],
  maturity: MaturityRating
): { hoursPassed: number; logs: string[]; updatedCharacters: Character[] } {
  const gameSecondsPassed = calculateGameTime(realSecondsPassed, 3.0);
  const hoursPassed = Math.round((gameSecondsPassed / 3600) * 10) / 10;
  const logs: string[] = [];

  const updatedCharacters = characters.map((char) => {
    const updated = { ...char, motives: { ...char.motives } };
    // Motives decay over offline hours
    updated.motives.hunger = Math.max(10, Math.min(100, updated.motives.hunger - hoursPassed * 6));
    updated.motives.bladder = Math.max(10, Math.min(100, updated.motives.bladder - hoursPassed * 8));
    updated.motives.hygiene = Math.max(15, Math.min(100, updated.motives.hygiene - hoursPassed * 5));

    if (hoursPassed >= 6) {
      // Slept through part of it
      updated.motives.energy = Math.min(100, updated.motives.energy + 40);
      logs.push(`${char.name} slept for several in-game hours and replenished their energy.`);
    }

    if (maturity === 'DARK_MODE' && char.motives.sanity < 45) {
      const hallucination = `[OFFLINE RECOLLECTION] ${char.name} woke in cold sweat hearing knocking from the foundations.`;
      updated.privateMemory.push(hallucination);
      logs.push(hallucination);
    }

    return updated;
  });

  logs.push(`The House advanced ${hoursPassed} in-game hours while you were away.`);
  return { hoursPassed, logs, updatedCharacters };
}

/**
 * Checks epistemic isolation: whether a character can see/hear an event.
 */
export function canPerceiveEvent(
  observer: Character,
  eventRoom: string,
  eventPos: { x: number; y: number; z: number }
): boolean {
  if (!observer.onGrid) return false;
  // If in the same room, always perceives
  if (observer.room === eventRoom) return true;
  // If in yard or connected patio, distance threshold
  const dist = Math.hypot(observer.pos.x - eventPos.x, observer.pos.z - eventPos.z);
  return dist < 8.0 && Math.abs(observer.pos.y - eventPos.y) < 2.0;
}
