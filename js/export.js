/*
 * Construit un objet "Actor" compatible avec l'import Foundry VTT pour le
 * système cats-la-mascarade, à partir de l'état du générateur.
 *
 * Le format (clés, imbrication, champs _stats/ownership/prototypeToken) est
 * calqué sur un export réel fourni par l'utilisateur, pour maximiser les
 * chances d'un import propre. Les valeurs de version système ci-dessous
 * doivent être ajustées si votre monde Foundry utilise une autre version.
 */

const SYSTEM_STATS = {
  systemId: "cats-la-mascarade",
  systemVersion: "1.14.0",
  coreVersion: "14.365",
};

function randomId(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function baseStats(now) {
  return {
    coreVersion: SYSTEM_STATS.coreVersion,
    systemId: SYSTEM_STATS.systemId,
    systemVersion: SYSTEM_STATS.systemVersion,
    createdTime: now,
    modifiedTime: now,
    lastModifiedBy: null,
    compendiumSource: null,
    duplicateSource: null,
    exportSource: null,
  };
}

function skillFormula(skillDef) {
  if (skillDef.attrs.length === 1) return skillDef.attrs[0];
  return `(${skillDef.attrs.join(" + ")})/2`;
}

function buildSkillItem(skillDef, rank, now) {
  return {
    _id: randomId(),
    name: skillDef.name,
    type: "skill",
    sort: 100001,
    flags: {},
    img: "icons/svg/upgrade.svg",
    effects: [],
    _stats: baseStats(now),
    ownership: { default: 0 },
    system: {
      usable_by: skillDef.usableBy,
      book_reference: "Core Rulebook",
      description: "",
      omega: !!skillDef.omega,
      formula: skillFormula(skillDef),
      formula_valid: true,
      base: 1,
      rank: rank,
      modifier: skillDef.modifier || "",
    },
    folder: null,
  };
}

function buildCustomSkillItem(custom, now) {
  const attrs = custom.secondAttr ? [custom.attr, custom.secondAttr] : [custom.attr];
  return {
    _id: randomId(),
    name: custom.name,
    type: "skill",
    sort: 100001,
    flags: {},
    img: "icons/svg/upgrade.svg",
    effects: [],
    _stats: baseStats(now),
    ownership: { default: 0 },
    system: {
      usable_by: custom.usableBy || "CBH",
      book_reference: "Custom",
      description: custom.specialty || "",
      omega: !!custom.omega,
      formula: attrs.length === 1 ? attrs[0] : `(${attrs.join(" + ")})/2`,
      formula_valid: true,
      base: 1,
      rank: custom.rank || 0,
      modifier: "",
    },
    folder: null,
  };
}

function buildTalentItem(talentDef, rank, specieKey, now) {
  return {
    _id: randomId(),
    name: talentDef.name,
    type: "talent",
    sort: 100001,
    flags: {},
    img: "icons/svg/aura.svg",
    effects: [],
    _stats: baseStats(now),
    ownership: { default: 0 },
    system: {
      usable_by: "CBH",
      book_reference: "Core Rulebook",
      description: `<p>${talentDef.note} Détails complets dans le livre.</p>`,
      rank: rank,
      max_rank: talentDef.maxRank,
    },
    folder: null,
  };
}

function buildAdvantageItem(traitDef, kind, now) {
  const item = {
    _id: randomId(),
    name: traitDef.name,
    type: "advantage",
    sort: 100001,
    flags: {},
    img: kind === "advantage" ? "icons/svg/upgrade.svg" : "icons/svg/downgrade.svg",
    effects: [],
    _stats: baseStats(now),
    ownership: { default: 0 },
    system: {
      usable_by: "CBH",
      book_reference: traitDef.custom ? "Custom" : "Core Rulebook",
      description: traitDef.freeTextValue ? `<p>${traitDef.freeTextValue}</p>` : (traitDef.note ? `<p>${traitDef.note}</p>` : ""),
      advantage_type: kind,
      modifier: {
        formula: traitDef.modifierFormula || "",
        skill: traitDef.cost,
      },
    },
    folder: null,
  };
  return item;
}

function buildFactionItem(factionName, now) {
  return {
    _id: randomId(),
    name: factionName,
    type: "faction",
    sort: 100001,
    flags: {},
    img: "icons/svg/village.svg",
    effects: [],
    _stats: baseStats(now),
    ownership: { default: 0 },
    system: {
      usable_by: "CBH",
      book_reference: "Core Rulebook",
      description: "",
      advantage_type: "[TYPE]",
    },
    folder: null,
  };
}

function buildClawItem(now) {
  return {
    _id: randomId(),
    name: "Fists, Cat claws",
    type: "item",
    sort: 100001,
    flags: {},
    img: "icons/svg/claw.svg",
    effects: [],
    _stats: baseStats(now),
    ownership: { default: 0 },
    system: {
      usable_by: "CBH",
      book_reference: "Core Rulebook",
      description: "",
      quantity: 1,
      injury_levels: "0",
      range: "0",
      splash: "0",
    },
    folder: null,
  };
}

/**
 * @param {object} state état complet du générateur (voir app.js)
 * @returns {object} Actor Foundry VTT prêt à être sérialisé en JSON
 */
function buildFoundryActor(state) {
  const now = Date.now();
  const items = [];
  const speciesLetter = speciesLetterFor(state.identity.type);

  SKILLS.forEach((skillDef) => {
    if (!skillDef.usableBy.includes(speciesLetter)) return;
    const rank = state.skills[skillDef.key] || 0;
    items.push(buildSkillItem(skillDef, rank, now));
  });

  (state.customSkills || []).forEach((custom) => items.push(buildCustomSkillItem(custom, now)));

  TALENTS.forEach((talentDef) => {
    const rank = state.talents[talentDef.key] || 0;
    if (rank > 0) items.push(buildTalentItem(talentDef, rank, state.identity.type, now));
  });

  state.chosenQualities.forEach((q) => items.push(buildAdvantageItem(q, "advantage", now)));
  state.chosenDefects.forEach((d) => items.push(buildAdvantageItem(d, "disadvantage", now)));

  if (state.identity.faction && state.identity.faction !== "Sans faction") {
    items.push(buildFactionItem(state.identity.faction, now));
  }

  if (state.identity.type === "cat") {
    items.push(buildClawItem(now));
  }

  const whiskersFinal = finalAttribute(state, "whiskers");
  const talentBudget = talentBudgetFromWhiskers(whiskersFinal);

  const notesParts = [];
  if (state.identity.personality) notesParts.push(`<p><strong>Personnalité / concept :</strong> ${state.identity.personality}</p>`);
  if (state.identity.equipment) notesParts.push(`<p><strong>Équipement :</strong> ${state.identity.equipment}</p>`);
  if (state.identity.notes) notesParts.push(`<p>${state.identity.notes}</p>`);

  const actor = {
    name: state.identity.name || "Sans nom",
    type: "character",
    img: "icons/svg/cowled.svg",
    items: items,
    prototypeToken: {
      actorLink: true,
      disposition: 0,
      bar1: { attribute: "gauges.injury_level" },
      bar2: { attribute: "gauges.talent_levels_used" },
      name: state.identity.name || "Sans nom",
      displayName: 50,
      width: 1,
      height: 1,
      texture: { src: "icons/svg/cowled.svg" },
      lockRotation: true,
      rotation: 0,
      alpha: 1,
      displayBars: 0,
      sight: { enabled: true, range: 0, angle: 360 },
      flags: {},
    },
    system: {
      soft_locked: false,
      specie: state.identity.type,
      identity: {
        age: state.identity.age || 0,
        breed: effectiveBreed(state) || "",
        lineage: state.identity.lineage || "",
        reputation: state.identity.reputation || 0,
        faction: state.identity.faction && state.identity.faction !== "Sans faction" ? state.identity.faction : "",
      },
      attributes: {
        luck: finalAttribute(state, "luck"),
        claw: finalAttribute(state, "claw"),
        hair: finalAttribute(state, "hair"),
        eye: finalAttribute(state, "eye"),
        tail: finalAttribute(state, "tail"),
        caress: finalAttribute(state, "caress"),
        purring: finalAttribute(state, "purring"),
        pad: finalAttribute(state, "pad"),
        whiskers: whiskersFinal,
      },
      gauges: {
        nine_lives: { value: 9, max: 9 },
        injury_level: { value: 0, max: 0 },
        talent_levels_used: { value: 0, max: talentBudget },
        experience: { successes: 0, failures: 0, total: { earn: 0, spent: 0 }, logs: "" },
      },
      description: state.identity.physicalDescription || "",
      notes: notesParts.join("\n"),
    },
    effects: [],
    folder: null,
    ownership: { default: 0 },
    flags: {},
    _stats: {
      ...baseStats(now),
      duplicateSource: null,
      exportSource: {
        worldId: "cats-generator-export",
        uuid: null,
        coreVersion: SYSTEM_STATS.coreVersion,
        systemId: SYSTEM_STATS.systemId,
        systemVersion: SYSTEM_STATS.systemVersion,
      },
    },
  };

  return actor;
}

function downloadFoundryJSON(state) {
  const actor = buildFoundryActor(state);
  const blob = new Blob([JSON.stringify(actor, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (state.identity.name || "personnage").replace(/[^a-z0-9_-]+/gi, "_");
  a.href = url;
  a.download = `fvtt-Actor-${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
