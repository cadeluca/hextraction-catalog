import fs from "fs";
import sqlite3 from "sqlite3";
import path from "path";

const db = new sqlite3.Database("./src/data/data.db");

async function fetchAndGenerateMdx() {
  const tilesDir = path.join("./src/pages/tiles");
  fs.rmSync(tilesDir, { recursive: true, force: true });
  // should always be true
  if (!fs.existsSync(tilesDir)) {
    fs.mkdirSync(tilesDir, { recursive: true });
  }

  db.all("SELECT * FROM tiles", (error, rows) => {
    if (error) {
      console.error(`Error fetching tiles: ${error.message}`);
      return;
    }

    rows.forEach((row) => {
      const content = generateContent(row);
      const cleansedFileName = row.name.replace(/[\/\\:*?"',!.<>| ]/g, "_");
      const filePath = path.join(tilesDir, `${cleansedFileName}.mdx`);

      fs.writeFile(filePath, content, (err) => {
        if (err) {
          console.error(
            `Error writing file ${cleansedFileName}.mdx: ${err.message}`
          );
        }
      });
    });
  });
}

function renderKeyName(key) {
  switch (key) {
    case "on_play_setup":
      return "On Play/Setup"; // adding the slash rather than a space to match
    case "alters_tiles":
    case "alters_balls":
    case "alters_hands":
    case "alters_turns":
      return (
        key
          .slice(0, -1)
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ") + "(s)"
      );
    case "is_unique":
      return "Unique"; // had to rename due to unique being reserved keyword
    default:
      return key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
}

function renderValueCheck(value, style) {
  // maybe we want some emoji or something instead?
  if (style === "table") {
    return `<ul><li><input disabled ${
      value ? "checked" : ""
    } type="checkbox" /></li></ul>`;
  }
  return value ? "✓" : "";
}

function formatData(tile) {
  const tableRows = [];
  const checkRows = [];
  const keySets = {
    mechanics: {
      generic: "",
      combo: "",
      dispenser: "",
      hole: "",
      jump: "",
      layer: "",
      mechanical: "",
      no_path: "",
      secret: "",
      trap: "",
    },
    cause: {
      on_play_setup: "",
      trigger: "",
      on_destroy: "",
      ongoing: "",
    },
    action: {
      alters_tiles: "",
      alters_balls: "",
      alters_hands: "",
      alters_turns: "",
    },
    special: {
      forbidden: "",
      novelty: "",
      premium: "",
      is_unique: "",
      virtual: "",
    },
    components: {
      board: "",
      accessory: "",
    },
  };

  const mechanicsKeys = Object.keys(keySets.mechanics);
  const causeKeys = Object.keys(keySets.cause);
  const actionKeys = Object.keys(keySets.action);
  const specialKeys = Object.keys(keySets.special);
  const componentsKeys = Object.keys(keySets.components);

  for (const [key, value] of Object.entries(tile)) {
    // skip name, url, upload, creator, and image
    if (
      !["id", "name", "url", "upload_date", "creator", "image"].includes(key)
    ) {
      tableRows.push(
        `| ${renderKeyName(key)} | ${renderValueCheck(value, "table")}|`
      );
      checkRows.push(`"${renderKeyName(key)} ${renderValueCheck(value)}"`);
    }

    // ideally pivot to this? though currently super inefficient
    const val = renderValueCheck(value);
    if (mechanicsKeys.includes(key)) {
      keySets.mechanics[key] = val;
    }
    if (causeKeys.includes(key)) {
      keySets.cause[key] = val;
    }
    if (actionKeys.includes(key)) {
      keySets.action[key] = val;
    }
    if (specialKeys.includes(key)) {
      keySets.special[key] = val;
    }
    if (componentsKeys.includes(key)) {
      keySets.components[key] = val;
    }
  }

  return { tableRows, checkRows, keySets };
}

function generateContent(tile) {
  const escapedName = tile.name;
  const { tableRows, checkRows, keySets } = formatData(tile);

  return `---
title: "${escapedName}"
---

import { Cards } from "nextra/components";
import { BoxIcon, AccountIcon } from "../../components/icons";
import HorizontalGrid from '../../components/HorizontalGrid';
import HorizontalGrid2 from '../../components/HorizontalGrid2';
import CardBox from '../../components/CardBox';


# ${tile.name}

<Cards>
  <Cards.Card
    icon={<BoxIcon />}
    title="Model Page"
    href="${tile.url}"
  />
  <Cards.Card
    icon={<AccountIcon />}
    title="Author"
    href="${tile.creator}"
  />
</Cards>

## Visual Example 1 (checked feels a bit hard to read)

| Key | Value |
|-----|-------|
${tableRows.join("\n")}

## Visual Example 2 (just info dumped in a grid layout)

<HorizontalGrid items={[${checkRows}]} />

## Visual Example 3 (separate my higher level tag)

### Mechanics
<HorizontalGrid2 data={${JSON.stringify(keySets.mechanics, null, 2)}} />

### Cause
<HorizontalGrid2 data={${JSON.stringify(keySets.cause, null, 2)}} />

### Action
<HorizontalGrid2 data={${JSON.stringify(keySets.action, null, 2)}} />

### Special
<HorizontalGrid2 data={${JSON.stringify(keySets.special, null, 2)}} />

### Components
<HorizontalGrid2 data={${JSON.stringify(keySets.components, null, 2)}} />
---

## Visual Example 4 (Card style)
<CardBox data={${JSON.stringify(keySets.special, null, 2)}} />

Pictures (for thangs.com models) will be scraped.
`;
}

fetchAndGenerateMdx();
