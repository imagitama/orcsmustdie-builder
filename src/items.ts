export const itemType = {
  Trap: "Trap",
  Weapon: "Weapon",
  Trinket: "Trinket",
};

export const upgradeType = {
  Tier: "Tier",
  Unique: "Unique",
  Special: "Special",
};

export const placements = {
  Floor: "Floor",
  Wall: "Wall",
  Ceiling: "Ceiling",
  Guardian: "Guardian",
};

export const characters = {
  Sorceress: "Sorceress",
  WarMage: "War Mage",
};

interface RawUpgrade {
  type: string;
  unlockCost: number;
  description: string;
  changes?: {
    range?: number;
  };
}

export interface Upgrade extends RawUpgrade {
  name: string;
}

interface RawItem {
  name: string;
  type: string;
  unlockCost: number;
  upgrades: RawUpgrade[];
  shortDescription?: string;
  longDescription?: string;
  character?: string;
  // traps
  placement: string;
  buildCost: number;
  range?: number; // tile count
  size?: string; // floors only - dimensions as 3x3x3
  // trinkets
  passive?: string;
  active?: string;
  // weapons
  primary?: string;
  secondary?: string;
}

export interface Item extends RawItem {
  imageUrl: string;
  upgrades: Upgrade[];
}

const itemsWithoutImages: RawItem[] = require("./items.json");

const getNameForUpgrade = (
  item: RawItem,
  upgrade: RawUpgrade,
  index: number
): string => `${item.name}_${upgrade.type}_${index}`;

const getFilenameFromName = (name: string): string => name.replaceAll(" ", "-");

const items: Item[] = itemsWithoutImages.map((item) => ({
  ...item,
  imageUrl: require(`./assets/images/traps/${getFilenameFromName(
    item.name
  )}.jpg`),
  upgrades: item.upgrades.map((upgrade, index) => ({
    ...upgrade,
    name: getNameForUpgrade(item, upgrade, index),
  })),
}));

export const getItemByName = (name: string): Item => {
  const result = items.find((item) => item.name === name);
  if (!result) {
    throw new Error("Bad");
  }
  return result;
};

export const getUpgradeByName = (name: string): Upgrade => {
  for (const item of items) {
    const result = item.upgrades.find((upgrade) => upgrade.name === name);
    if (result) {
      return result;
    }
  }

  throw new Error("Bad");
};

export const getItemsByType = (type: string): Item[] =>
  items.filter((item) => item.type === type);

export default items;
