const htmlparser2 = require("htmlparser2");
const fs = require("fs");

const fixNames = (originalName) => {
  switch (originalName) {
    case "Spore Mushroom":
      return "Spore Mushrooms";
    case "Sceptre":
      return "Sceptre of Domination";
    case "Vampiric Guantlets":
      return "Vampiric Gauntlets";
    default:
      return originalName;
  }
};

const cleanupDesc = (text) => text.replace("\r\n", "");

const getItemDataFromCell = (cell, type) => {
  const anchor = cell.children.find((child) => child.name === "a");
  const heading =
    anchor.children.find((child) => child.name === "h6") ||
    anchor.children.find((child) => child.name === "h4");

  const anchorTextChild = heading.children.find(
    (child) => child.type === "text"
  );
  const anchorText = anchorTextChild.data;

  let unlockCost = 0;

  // different pages have different formatting
  if (anchorText.includes("(Cost:")) {
    const unlockCostChunks = anchorText.split("Cost: ");
    unlockCost =
      unlockCostChunks.length > 1
        ? parseInt(unlockCostChunks[1].split("):")[0])
        : 0;
  } else {
    if (anchorText.includes("skulls")) {
      const unlockCostChunks = anchorText.split("Cost: ");
      unlockCost = parseInt(unlockCostChunks[1].split(" skulls")[0]);
    }
  }

  const name = anchor.attribs.name
    .replaceAll("-", " ")
    .split(" ")
    .map((word) =>
      word !== "of"
        ? `${word.substr(0, 1).toUpperCase()}${word.substr(1)}`
        : word
    )
    .join(" ");

  let upgrades = [];

  const firstBoldChild = cell.children.find((child) => child.name === "strong");
  const firstBoldChildText = firstBoldChild.children[0].data;

  const placement = firstBoldChildText.includes("Trap")
    ? firstBoldChildText.replace(" Trap", "")
    : null;

  let shortDescription;
  let passive;
  let active;
  let primary;
  let secondary;

  if (firstBoldChildText.includes("Passive")) {
    const passiveHeadingIdx = cell.children.findIndex(
      (child) =>
        child.name === "strong" && child.children[0].data.includes("Passive:")
    );
    passive = cell.children[passiveHeadingIdx + 1].data.trim();

    const activeHeadingIdx = cell.children.findIndex(
      (child) =>
        child.name === "strong" && child.children[0].data.includes("Active:")
    );
    active = cell.children[activeHeadingIdx + 1].data.trim();
  } else if (firstBoldChildText.includes("Primary")) {
    const primaryHeadingIdx = cell.children.findIndex(
      (child) =>
        child.name === "strong" && child.children[0].data.includes("Primary:")
    );
    primary = cell.children[primaryHeadingIdx + 1].data.trim();

    const secondaryHeadingIdx = cell.children.findIndex(
      (child) =>
        child.name === "strong" && child.children[0].data.includes("Secondary:")
    );
    secondary = cell.children[secondaryHeadingIdx + 1].data.trim();
  } else {
    const firstTextChild = cell.children.find((child) => child.type === "text");
    shortDescription = cleanupDesc(firstTextChild.data);
  }

  const boldsExcludingFirst = cell.children
    .map((child, idx) => ({
      child,
      idx,
    }))
    .filter(({ child }) => child.name === "strong")
    .slice(1);

  for (const { child, idx } of boldsExcludingFirst) {
    const upgradeName = child.children[0].data;
    const descChild = cell.children[idx + 1];
    const descText = descChild.data;

    if (!descText) {
      continue;
    }

    let trueDesc = "";
    let costs = [];

    // different pages have different formatting
    if (descText.includes(" - ")) {
      trueDesc = descText.split(") - ")[1];
      costs = descText.split(") - ")[0].split("(")[1].split(", ");
    } else if (descText.includes("):")) {
      trueDesc = descText.split("): ")[1];
      costs = descText.split("):")[0].split("(")[1].split(", ");
    }

    for (let i = 0; i < costs.length; i++) {
      let cost = parseInt(costs[i]);

      upgrades.push({
        type: upgradeName.includes("Upgrade")
          ? "Tier"
          : upgradeName.includes("Unique")
          ? "Unique"
          : upgradeName.includes("Special")
          ? "Special"
          : "",
        description: trueDesc,
        unlockCost: cost,
      });
    }
  }

  const isSorcerer = cell.children.find(
    (child) => child.type === "text" && child.data.includes("Sorceress Only")
  );
  const isWarMage = cell.children.find(
    (child) => child.type === "text" && child.data.includes("War Mage Only")
  );
  const character = isSorcerer ? "Sorceress" : isWarMage ? "War Mage" : null;

  return {
    name: fixNames(name),
    shortDescription,
    type,
    unlockCost,
    upgrades,
    // traps
    placement,
    character,
    // weapons
    primary,
    secondary,
    // trinkets
    passive,
    active,
  };
};

const processHtml = (html, type) => {
  const root = htmlparser2.parseDocument(html);
  const table = root.firstChild;
  const tbody = table.children.find((child) => child.name === "tbody");
  const rows = tbody.children;

  const items = rows.reduce((finalItems, row) => {
    const cells = row.children
      ? row.children.filter((child) => child.name === "td")
      : [];

    let newItems = [...finalItems];

    cells.forEach((cell, idx) => {
      if (idx === 1 || (idx === 3 && cell.children.length > 2)) {
        newItems = newItems.concat([getItemDataFromCell(cell, type)]);
      }
    });

    return newItems;
  }, []);

  return items;
};

const trapsHtmlBuffer = fs.readFileSync(__dirname + "/traps.html");
const traps = processHtml(trapsHtmlBuffer.toString(), "Trap");

const weaponsHtmlBuffer = fs.readFileSync(__dirname + "/weapons.html");
const weapons = processHtml(weaponsHtmlBuffer.toString(), "Weapon");

const trinketsHtmlBuffer = fs.readFileSync(__dirname + "/trinkets.html");
const trinkets = processHtml(trinketsHtmlBuffer.toString(), "Trinket");

const items = [...traps, ...weapons, ...trinkets];

const json = JSON.stringify(items, null, "  ");
fs.writeFileSync(__dirname + "/../../src/items.json", json);
