

import type { WorldRegion } from '@/lib/mock-data'; // Import necessary types

export type { WorldRegion }; // Re-export WorldRegion for convenience

export interface Listing {
  id: string;
  name: string;
  category: string; // Corresponds to category id
  price: number;
  dateAdded: Date;
  imageUrl: string;
  description?: string; // Optional description
  relevance: number;
}

export interface Category {
  id: string;
  name: string;
}

// Represents a single game server (previously Marketplace)
export interface Server {
  id: string; // Unique ID across all games/worlds, e.g., 'throne-and-liberty-na-liberty'
  name: string; // Display name, e.g., 'Liberty'
  categories: Category[];
  listings: Listing[];
}

// --- Define structure for world data ---
export interface WorldData {
  region: WorldRegion;
  servers: Server[];
}

// --- Define structure for game data ---
export interface GameData {
  gameName: string;
  worlds: WorldData[];
}

// --- Available Games ---
export const availableGames = ['Throne and Liberty', 'MIR5'];

// --- World Regions (Shared across games but each game defines its servers) ---
export type WorldRegion = 'SA' | 'NA' | 'EUW';
export const serverRegions: WorldRegion[] = ['SA', 'NA', 'EUW'];

// --- Common Categories (Can be shared or customized per game/server) ---
const commonCategories: Category[] = [
  { id: 'all', name: 'All Items' },
  { id: 'weapons', name: 'Weapons' },
  { id: 'armor', name: 'Armor' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'consumables', name: 'Consumables' },
  { id: 'materials', name: 'Crafting Materials' },
  { id: 'spellbooks', name: 'Spellbooks & Tomes' },
];

// --- Mock Listings Generator (Same structure for now) ---
const generateListings = (prefix: string, gameName: string = 'Throne and Liberty'): Listing[] => {
  return [
    {
      id: `${prefix}-1`,
      name: 'Epic Sword of the Phoenix',
      category: 'weapons',
      price: 1499.00,
      dateAdded: new Date('2024-07-16T16:45:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}phoenixsword/300/200`,
      description: 'A legendary sword imbued with the power of the Phoenix. Deals bonus fire damage.',
      relevance: 98,
    },
    {
      id: `${prefix}-2`,
      name: 'Guardian Angel Plate Set',
      category: 'armor',
      price: 799.99,
      dateAdded: new Date('2024-07-20T10:00:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}angelarmor/300/200`,
      description: 'A full set of plate armor blessed by the heavens. High defense and holy resistance.',
      relevance: 95,
    },
    {
      id: `${prefix}-3`,
      name: 'Elixir of Greater Healing',
      category: 'consumables',
      price: 49.99,
      dateAdded: new Date('2024-07-23T10:00:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}healingpotion/300/200`,
      description: 'Restores a significant amount of health instantly. Brewed by master alchemists.',
      relevance: 93,
    },
    {
      id: `${prefix}-4`,
      name: 'Boots of Blinding Speed',
      category: 'armor',
      price: 120.00,
      dateAdded: new Date('2024-07-21T08:00:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}speedboots/300/200`,
      description: 'Enchanted boots that grant the wearer incredible movement speed.',
      relevance: 92,
    },
    {
      id: `${prefix}-5`,
      name: 'Shadow Walker Leather Tunic',
      category: 'armor',
      price: 299.99,
      dateAdded: new Date('2024-07-25T11:30:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}shadowtunic/300/200`,
      description: 'Lightweight leather tunic favored by rogues and assassins. Enhances stealth.',
      relevance: 91,
    },
    // Add more diverse items
    {
      id: `${prefix}-6`,
      name: 'Staff of the Archon',
      category: 'weapons',
      price: 1899.00,
      dateAdded: new Date('2024-07-26T09:00:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}archonstaff/300/200`,
      description: 'A powerful staff crackling with arcane energy.',
      relevance: 97,
    },
    {
      id: `${prefix}-7`,
      name: 'Amulet of Wisdom',
      category: 'accessories',
      price: 349.50,
      dateAdded: new Date('2024-07-27T11:15:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}wisdomamulet/300/200`,
      description: 'Increases the wearer\'s intelligence and mana regeneration.',
      relevance: 88,
    },
    {
      id: `${prefix}-8`,
      name: 'Potion of Invisibility',
      category: 'consumables',
      price: 150.00,
      dateAdded: new Date('2024-07-28T13:00:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}invispotion/300/200`,
      description: 'Grants temporary invisibility to the user.',
      relevance: 85,
    },
    {
      id: `${prefix}-9`,
      name: 'Dragon Scale',
      category: 'materials',
      price: 500.00,
      dateAdded: new Date('2024-07-29T15:30:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}dragonscale/300/200`,
      description: 'A rare and durable scale used in legendary crafting.',
      relevance: 94,
    },
    {
      id: `${prefix}-10`,
      name: 'Tome of Fireball',
      category: 'spellbooks',
      price: 250.00,
      dateAdded: new Date('2024-07-30T17:00:00Z'),
      imageUrl: `https://picsum.photos/seed/${prefix}fireballtome/300/200`,
      description: 'Teaches the powerful Fireball spell.',
      relevance: 89,
    },
  ];
};

// --- Define Servers with names based on the world and game ---
const createServers = (worldPrefix: WorldRegion, gameName: string): Server[] => {
  const serverNameMap: Record<string, Record<WorldRegion, string[]>> = {
    'Throne and Liberty': {
      SA: ['Azteca', 'Inca', 'Tupi'],
      NA: ['Liberty', 'Frontier', 'Avalon'],
      EUW: ['Camelot', 'Stormwind', 'Erebor'],
    },
    'MIR5': {
      SA: ['SAMA', 'SABO'],
      NA: ['NA-101', 'NA-102'],
      EUW: ['EUW-201', 'EUW-202', 'EUW-203'],
    },
  };

  const defaultServerNames: Record<WorldRegion, string[]> = {
      SA: ['SA-1', 'SA-2'],
      NA: ['NA-1', 'NA-2', 'NA-3'],
      EUW: ['EUW-1', 'EUW-2'],
  }

  const serverBaseNames = serverNameMap[gameName]?.[worldPrefix] ?? defaultServerNames[worldPrefix];

  return serverBaseNames.map((baseName, index) => {
    // Construct a unique ID for the server based on game, world, and base name
    const serverId = `${gameName.toLowerCase().replace(/\s+/g, '-')}-${worldPrefix.toLowerCase()}-${baseName.toLowerCase().replace(/\s+/g, '').replace(/-/g, '')}`;
    return {
      id: serverId,
      name: `${baseName}`, // Just the base name for the button
      categories: commonCategories, // Use common categories for now
      listings: generateListings(`${serverId}-${index}`, gameName),
    }
  });
};


// --- All Game Data ---
const allGamesData: GameData[] = [
  {
    gameName: 'Throne and Liberty',
    worlds: [
      { region: 'SA', servers: createServers('SA', 'Throne and Liberty') },
      { region: 'NA', servers: createServers('NA', 'Throne and Liberty') },
      { region: 'EUW', servers: createServers('EUW', 'Throne and Liberty') },
    ]
  },
  {
    gameName: 'MIR5',
    worlds: [
      { region: 'SA', servers: createServers('SA', 'MIR5') },
      { region: 'NA', servers: createServers('NA', 'MIR5') },
      { region: 'EUW', servers: createServers('EUW', 'MIR5') },
    ]
  }
];


// --- Helper Functions ---

// Get available world regions for a specific game
export const getWorldRegionsForGame = (gameName: string): WorldRegion[] => {
  const gameData = allGamesData.find(g => g.gameName === gameName);
  return gameData ? gameData.worlds.map(w => w.region) : [];
};

// Helper function to get servers for a specific game and world region
export const getServersForGameAndWorld = (gameName: string, region: WorldRegion): Server[] => {
  const gameData = allGamesData.find(g => g.gameName === gameName);
  if (!gameData) return [];
  const worldData = gameData.worlds.find(w => w.region === region);
  return worldData?.servers ?? [];
};

// Function to get the default world for a given game
export const getDefaultWorldForGame = (gameName: string): WorldRegion => {
    const gameData = allGamesData.find(g => g.gameName === gameName);
    // Return the first world region for the game, or default to 'NA' if none found
    return gameData?.worlds[0]?.region ?? 'NA';
};

// --- Clan Mock Data ---
export interface ExplorableClan {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  recruiting: boolean;
  game: string; // Game the clan belongs to
  world: WorldRegion; // World region
  server: string; // Server ID (matches the generated Server IDs)
  imageUrl: string; // Add image URL for the clan logo/emblem
}

// Update mock clans with game, world, server info, and imageUrls matching generated Server IDs
export const mockClans: ExplorableClan[] = [
  { id: 'clan1', name: "The Silver Blades", description: "Honorable warriors seeking glory.", memberCount: 25, recruiting: true, game: 'Throne and Liberty', world: 'NA', server: 'throne-and-liberty-na-liberty', imageUrl: 'https://picsum.photos/seed/silverblades/100' },
  { id: 'clan2', name: "Mystic Weavers", description: "Masters of arcane arts.", memberCount: 15, recruiting: false, game: 'Throne and Liberty', world: 'EUW', server: 'throne-and-liberty-euw-camelot', imageUrl: 'https://picsum.photos/seed/mysticweavers/100' },
  { id: 'clan3', name: "Iron Legion", description: "Unbreakable shield wall.", memberCount: 48, recruiting: true, game: 'MIR5', world: 'NA', server: 'mir5-na-na101', imageUrl: 'https://picsum.photos/seed/ironlegion/100' }, // Corrected server ID
  { id: 'clan4', name: "Shadow Syndicate", description: "Operatives working in the dark.", memberCount: 30, recruiting: false, game: 'Throne and Liberty', world: 'NA', server: 'throne-and-liberty-na-avalon', imageUrl: 'https://picsum.photos/seed/shadowsyndicate/100' },
  { id: 'clan5', name: "Crimson Vanguard", description: "Frontline assault specialists.", memberCount: 40, recruiting: true, game: 'MIR5', world: 'SA', server: 'mir5-sa-sama', imageUrl: 'https://picsum.photos/seed/crimsonvanguard/100' },
  { id: 'clan6', name: "Azure Dragons", description: "Guardians of the South.", memberCount: 32, recruiting: true, game: 'MIR5', world: 'SA', server: 'mir5-sa-sabo', imageUrl: 'https://picsum.photos/seed/azuredragons/100' },
  { id: 'clan7', name: "Winter Wolves", description: "Masters of the Northern Frost.", memberCount: 18, recruiting: false, game: 'Throne and Liberty', world: 'EUW', server: 'throne-and-liberty-euw-stormwind', imageUrl: 'https://picsum.photos/seed/winterwolves/100' },
  // Add more clans for variety
  { id: 'clan8', name: "Desert Nomads", description: "Survivors of the harsh sands.", memberCount: 22, recruiting: true, game: 'Throne and Liberty', world: 'SA', server: 'throne-and-liberty-sa-azteca', imageUrl: 'https://picsum.photos/seed/desertnomads/100' },
  { id: 'clan9', name: "Emerald Guard", description: "Protectors of the ancient forest.", memberCount: 35, recruiting: true, game: 'Throne and Liberty', world: 'EUW', server: 'throne-and-liberty-euw-erebor', imageUrl: 'https://picsum.photos/seed/emeraldguard/100' },
  { id: 'clan10', name: "Void Walkers", description: "Explorers of the unknown.", memberCount: 12, recruiting: false, game: 'MIR5', world: 'EUW', server: 'mir5-euw-euw201', imageUrl: 'https://picsum.photos/seed/voidwalkers/100' }, // Corrected server ID
  { id: 'clan11', name: "Celestial Knights", description: "Champions of light.", memberCount: 50, recruiting: true, game: 'Throne and Liberty', world: 'NA', server: 'throne-and-liberty-na-frontier', imageUrl: 'https://picsum.photos/seed/celestialknights/100' },
  { id: 'clan12', name: "Serpent Scale Clan", description: "Masters of poison and stealth.", memberCount: 28, recruiting: true, game: 'MIR5', world: 'NA', server: 'mir5-na-na102', imageUrl: 'https://picsum.photos/seed/serpentscale/100' }, // Corrected server ID
];


// --- Initial Data Calculation (Based on the *first* available game) ---
const defaultGame = availableGames[0];
export const initialWorldRegions = getWorldRegionsForGame(defaultGame);
export const initialDefaultWorld = getDefaultWorldForGame(defaultGame);
export const initialServers = getServersForGameAndWorld(defaultGame, initialDefaultWorld);
// Note: Categories and Listings are now fetched based on the *selected* server, not initial ones.
