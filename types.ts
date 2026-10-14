
export interface MoodRecipe {
  name: string;
  description: string;
  colorHex: string;
  visualStyle: 'clear' | 'creamy' | 'sparkling' | 'gradient' | 'layered';
  layers: {
    emotion: { name: string; description: string; alcoholType: string }; // Layer 1: Base Spirit
    luck: { level: string; description: string; ingredient: string };   // Layer 2: Liqueur/Modifier
    event: { name: string; description: string; ingredient: string };   // Layer 3: Mixer/Juice
    taste: { profile: string; notes: string; ingredient: string };      // Layer 4: Bitters/Syrup
    color: { name: string; meaning: string; ingredient: string };       // Layer 5: Colorant/Garnish
    zodiac: { sign: string; prediction: string; ingredient: string };   // Layer 6: Special Garnish
    week: { day: string; vibe: string; ingredient: string };            // Layer 7: Glassware/Ice
  };
  stats: {
    intensity: number; // 0-100
    abvDisplay: string; // e.g., "10.6%"
  };
}

export interface TarotCard {
    id: number;
    name: string; // English
    nameCN: string; // Chinese
    symbol: string; // Icon identifier
    meaning: string; // Short keyword
    reversed?: boolean; // For future use
}

export enum AppState {
  IDLE = 'IDLE',
  INPUT = 'INPUT',
  TAROT = 'TAROT', // Tarot card drawing phase
  TUNE = 'TUNE', // 调节界面 - Mixology Calibration & Tuning phase
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
}