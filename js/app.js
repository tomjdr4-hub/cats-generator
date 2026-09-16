"use strict";

const STORAGE_KEY = "cats-generator-draft-v1";

const STEP_LABELS = [
  "Type et identité",
  "Race du Chat",
  "Caractéristiques",
  "Qualités et défauts",
  "Compétences",
  "Talents psychiques",
  "Vérification",
  "Fiche finale",
];

function speciesLetterFor(typeKey) {
  return SPECIES.find((s) => s.key === typeKey).letter;
}

function defaultState() {
  const attrs = {};
  ATTRIBUTES.forEach((a) => (attrs[a.key] = 1));
  const skills = {};
  SKILLS.forEach((s) => (skills[s.key] = 0));
  const talents = {};
  TALENTS.forEach((t) => (talents[t.key] = 0));
  return {
    currentStep: 0,
    identity: {
      type: "cat",
      name: "",
      age: "",
      reputation: 0,
      catName: "",
      humanName: "",
      lineage: "",
      faction: "Sans faction",
      physicalDescription: "",
      personality: "",
      equipment: "",
      notes: "",
    },
    breed: "",
    attributes: attrs,
    chosenQualities: [],
    chosenDefects: [],
    skills: skills,
    customSkills: [],
    talents: talents,
  };
}

let state = defaultState();

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* stockage indisponible : le brouillon ne sera pas sauvegardé, pas bloquant */
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    state = { ...defaultState(), ...parsed };
    return true;
  } catch (e) {
    return false;
  }
}

// ---------- Calculs de règles ----------

function attributeLabel(key) {
  return ATTRIBUTES.find((a) => a.key === key).label;
}

function attributePermanentBonus(attrKey) {
  const label = attributeLabel(attrKey);
  let bonus = 0;
  [...state.chosenQualities, ...state.chosenDefects].forEach((t) => {
    if (t.modifierFormula) {
      const m = t.modifierFormula.match(/^(\w+)([+-]\d+)$/);
      if (m && m[1] === attrKey) bonus += parseInt(m[2], 10);
    }
    if (t.note) {
      const m2 = t.note.match(/\+1\s+(\S+)\s+permanent/i);
      if (m2 && m2[1].toLowerCase() === label.toLowerCase()) bonus += 1;
    }
  });
  return bonus;
}

function finalAttribute(st, key) {
  return (st.attributes[key] || 0) + attributePermanentBonus(key);
}

function attrBudgetTotal() {
  return ATTRIBUTE_BUDGET[state.identity.type];
}
function attrSpentTotal() {
  return ATTRIBUTES.reduce((sum, a) => sum + state.attributes[a.key], 0);
}

function skillBudgetTotal() {
  let total = SKILL_BASE_BUDGET;
  state.chosenQualities.forEach((q) => (total += q.cost));
  state.chosenDefects.forEach((d) => (total += d.cost));
  return total;
}
function skillsSpentTotal() {
  let total = 0;
  SKILLS.forEach((s) => (total += skillCost(state.skills[s.key] || 0)));
  state.customSkills.forEach((c) => (total += skillCost(c.rank || 0)));
  return total;
}

function talentBudgetTotal() {
  return talentBudgetFromWhiskers(finalAttribute(state, "whiskers"));
}
function talentsSpentTotal() {
  return TALENTS.reduce((sum, t) => sum + talentCost(state.talents[t.key] || 0), 0);
}

function usableSkills() {
  const letter = speciesLetterFor(state.identity.type);
  return SKILLS.filter((s) => s.usableBy.includes(letter));
}

function validate() {
  const errors = [];
  const infos = [];

  if (!state.identity.name.trim()) errors.push("Le nom principal est obligatoire.");
  if (!state.breed.trim()) {
    const label = SPECIES.find((s) => s.key === state.identity.type).label;
    errors.push(`La race du ${label} est obligatoire.`);
  }

  const attrBudget = attrBudgetTotal();
  const attrSpent = attrSpentTotal();
  if (attrSpent !== attrBudget) {
    errors.push(`Les caractéristiques doivent dépenser exactement ${attrBudget} points (actuellement ${attrSpent}).`);
  }

  const skillBudget = skillBudgetTotal();
  const skillSpent = skillsSpentTotal();
  if (skillSpent !== skillBudget) {
    errors.push(`Il reste des points de compétences à dépenser (${skillSpent}/${skillBudget}).`);
  }

  const talentBudget = talentBudgetTotal();
  const talentSpent = talentsSpentTotal();
  if (talentSpent !== talentBudget) {
    errors.push(`Il reste des points de Talents à dépenser (${talentSpent}/${talentBudget}).`);
  }

  usableSkills().forEach((s) => {
    if (s.omega && (state.skills[s.key] || 0) === 0) {
      infos.push(`${s.name} : Non acquise - rang 1 minimum.`);
    }
  });
  infos.push("Neuf vies : 9.");

  return { errors, infos, isValid: errors.length === 0 };
}

// ---------- Rendu ----------

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function renderTabs() {
  const nav = document.getElementById("tabs");
  nav.innerHTML = "";
  STEP_LABELS.forEach((label, i) => {
    const btn = el(`<button class="tab ${i === state.currentStep ? "active" : ""}" data-step="${i}">${i + 1}. ${label}</button>`);
    nav.appendChild(btn);
  });
}

function renderStatusBar() {
  const bar = document.getElementById("status-bar");
  const attrBudget = attrBudgetTotal();
  const attrSpent = attrSpentTotal();
  const skillBudget = skillBudgetTotal();
  const skillSpent = skillsSpentTotal();
  const talentBudget = talentBudgetTotal();
  const talentSpent = talentsSpentTotal();
  bar.innerHTML = `
    <div class="status-title">
      <span>Statut de création</span>
      <span class="lives">Neuf vies : 9</span>
    </div>
    <div class="status-chips">
      <div class="chip">Caractéristiques : ${attrSpent} / ${attrBudget} — il reste ${Math.max(attrBudget - attrSpent, 0)} points à dépenser.</div>
      <div class="chip">Compétences : ${skillSpent} / ${skillBudget} — il reste ${Math.max(skillBudget - skillSpent, 0)} points à dépenser.</div>
      <div class="chip">Talents : ${talentSpent} / ${talentBudget} — il reste ${Math.max(talentBudget - talentSpent, 0)} points à dépenser.</div>
    </div>
  `;
}

function renderStep1() {
  const i = state.identity;
  return `
    <section class="card">
      <h2>Type et identité</h2>
      <p class="hint">Les champs s'adaptent automatiquement au type de personnage choisi.</p>
      <div class="grid-2">
        <label class="field">
          <span>Type</span>
          <select data-bind="identity.type">
            ${SPECIES.map((s) => `<option value="${s.key}" ${i.type === s.key ? "selected" : ""}>${s.label}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Nom principal *</span>
          <input type="text" data-bind="identity.name" value="${escapeAttr(i.name)}" />
        </label>
        <label class="field">
          <span>Âge</span>
          <input type="number" min="0" data-bind="identity.age" value="${escapeAttr(i.age)}" />
        </label>
        <label class="field">
          <span>Réputation</span>
          <input type="number" data-bind="identity.reputation" value="${escapeAttr(i.reputation)}" />
        </label>
        <label class="field">
          <span>Nom félin</span>
          <input type="text" data-bind="identity.catName" value="${escapeAttr(i.catName)}" />
        </label>
        <label class="field">
          <span>Nom donné par les humains (facultatif)</span>
          <input type="text" data-bind="identity.humanName" value="${escapeAttr(i.humanName)}" />
        </label>
        <label class="field">
          <span>Lignée</span>
          <input type="text" data-bind="identity.lineage" value="${escapeAttr(i.lineage)}" />
        </label>
        <label class="field">
          <span>Faction</span>
          <select data-bind="identity.faction">
            ${FACTIONS.map((f) => `<option value="${f}" ${i.faction === f ? "selected" : ""}>${f}</option>`).join("")}
          </select>
        </label>
        <label class="field wide">
          <span>Description physique</span>
          <textarea data-bind="identity.physicalDescription">${escapeHtml(i.physicalDescription)}</textarea>
        </label>
        <label class="field wide">
          <span>Personnalité / concept</span>
          <textarea data-bind="identity.personality">${escapeHtml(i.personality)}</textarea>
        </label>
        <label class="field wide">
          <span>Équipement</span>
          <textarea data-bind="identity.equipment">${escapeHtml(i.equipment)}</textarea>
        </label>
        <label class="field wide">
          <span>Notes libres</span>
          <textarea data-bind="identity.notes">${escapeHtml(i.notes)}</textarea>
        </label>
      </div>
    </section>
  `;
}

function renderStep2() {
  const label = SPECIES.find((s) => s.key === state.identity.type).label;
  const list = BREEDS[state.identity.type] || [];
  const control =
    list.length > 0
      ? `<select data-bind="breed">
          <option value="">Choisir une race</option>
          ${list.map((b) => `<option value="${b}" ${state.breed === b ? "selected" : ""}>${b}</option>`).join("")}
        </select>`
      : `<input type="text" placeholder="Race (liste non renseignée — voir README)" data-bind="breed" value="${escapeAttr(state.breed)}" />`;
  return `
    <section class="card">
      <h2>Race du ${label}</h2>
      <label class="field">
        <span>Race officielle *</span>
        ${control}
      </label>
      <p class="hint">Éléments obligatoires : Aucun</p>
      ${list.length === 0 ? `<p class="warn">La liste officielle des races n'est pas fournie dans ce dépôt : saisissez-la librement, ou complétez <code>js/data.js</code> (BREEDS) depuis le livre de base.</p>` : ""}
    </section>
  `;
}

function renderStep3() {
  const cards = ATTRIBUTES.map((a) => {
    const value = state.attributes[a.key];
    const final = finalAttribute(state, a.key);
    return `
      <div class="attr-card">
        <div class="attr-head">
          <strong>${a.label}</strong> <span class="abbr">${a.abbr}</span>
          <span class="cap">Plafond ${a.cap}</span>
        </div>
        <div class="stepper">
          <button type="button" data-action="attr-dec" data-key="${a.key}" ${value <= 1 ? "disabled" : ""}>-</button>
          <span class="value">${value}</span>
          <button type="button" data-action="attr-inc" data-key="${a.key}" ${value >= a.cap ? "disabled" : ""}>+</button>
        </div>
        <div class="attr-final">Finale : ${final}</div>
        ${a.noModifiers ? `<p class="hint small">Chance ne reçoit aucun bonus ni malus.</p>` : ""}
      </div>
    `;
  }).join("");
  return `
    <section class="card">
      <h2>Caractéristiques</h2>
      <p class="hint">Les valeurs achetées doivent correspondre exactement au capital du type. Les bonus permanents s'appliquent ensuite.</p>
      <div class="attr-grid">${cards}</div>
    </section>
  `;
}

function traitCard(def, kind) {
  const chosenList = kind === "quality" ? state.chosenQualities : state.chosenDefects;
  const isChosen = chosenList.some((c) => c.key === def.key);
  const costLabel = kind === "quality" ? `${def.cost} compétences` : `+${def.cost} compétences`;
  return `
    <div class="trait-card">
      <div class="trait-head">
        <strong>${def.name}</strong>
        <span class="cost">${costLabel}</span>
      </div>
      ${def.note ? `<p class="hint small">${def.note}</p>` : ""}
      <button type="button" class="btn btn-small" data-action="${isChosen ? "remove-trait" : "add-trait"}" data-kind="${kind}" data-key="${def.key}">
        ${isChosen ? "Retirer" : "Ajouter"}
      </button>
    </div>
  `;
}

function renderStep4() {
  return `
    <section class="card">
      <h2>Qualités et défauts</h2>
      <p class="hint">Qualités et défauts modifient votre budget de points de Compétences.</p>
      <div class="grid-2">
        <div>
          <h3>Qualités</h3>
          ${QUALITIES.map((q) => traitCard(q, "quality")).join("")}
        </div>
        <div>
          <h3>Défauts</h3>
          ${DEFECTS.map((d) => traitCard(d, "defect")).join("")}
        </div>
      </div>
      <h3>Qualité ou défaut personnalisé</h3>
      <form id="custom-trait-form" class="custom-form">
        <select name="kind">
          <option value="quality">Qualité</option>
          <option value="defect">Défaut</option>
        </select>
        <input name="name" type="text" placeholder="Nom" required />
        <input name="cost" type="number" placeholder="Coût (négatif pour qualité, positif pour défaut)" required />
        <input name="note" type="text" placeholder="Effet (facultatif)" />
        <button type="submit" class="btn btn-small">Ajouter l'élément personnalisé</button>
      </form>
    </section>
  `;
}

function skillCard(def) {
  const rank = state.skills[def.key] || 0;
  const cost = skillCost(rank);
  const final = 1 + rank;
  return `
    <div class="skill-card">
      <div class="skill-head">
        <strong>${def.name}</strong> ${def.omega ? '<span class="omega" title="Inutilisable au rang 0">Ω</span>' : ""}
      </div>
      <div class="skill-meta">Base 1 · Rang ${rank} · Coût total ${cost} · Score final ${final}</div>
      <div class="skill-meta small">Formule : ${skillFormula(def)}</div>
      <div class="stepper">
        <button type="button" data-action="skill-dec" data-key="${def.key}" ${rank <= 0 ? "disabled" : ""}>-</button>
        <span class="value">${rank}</span>
        <button type="button" data-action="skill-inc" data-key="${def.key}">+</button>
      </div>
      ${def.omega && rank === 0 ? `<p class="warn small">Non acquise - rang 1 minimum</p>` : ""}
    </div>
  `;
}

function renderStep5() {
  const skills = usableSkills();
  return `
    <section class="card">
      <h2>Compétences</h2>
      <p class="hint">Ω : une compétence au rang 0 est inutilisable.</p>
      <div class="skill-grid">${skills.map(skillCard).join("")}</div>
      <h3>Compétence personnalisée</h3>
      <form id="custom-skill-form" class="custom-form">
        <input name="name" type="text" placeholder="Nom" required />
        <select name="attr">
          ${ATTRIBUTES.map((a) => `<option value="${a.key}">${a.label}</option>`).join("")}
        </select>
        <select name="secondAttr">
          <option value="">Pas de seconde caractéristique</option>
          ${ATTRIBUTES.map((a) => `<option value="${a.key}">${a.label}</option>`).join("")}
        </select>
        <label><input type="checkbox" name="omega" /> Ω (rang 0 = inutilisable)</label>
        <input name="specialty" type="text" placeholder="Spécialité facultative" />
        <button type="submit" class="btn btn-small">Ajouter la compétence</button>
      </form>
    </section>
  `;
}

function talentCard(def) {
  const rank = state.talents[def.key] || 0;
  const max = def.maxRank[state.identity.type] || 5;
  const cost = talentCost(rank);
  return `
    <div class="skill-card">
      <div class="skill-head">
        <strong>${def.name}</strong> <span class="cap">Max. ${max}</span>
      </div>
      <p class="hint small">${def.note} Détails complets dans le livre.</p>
      <div class="stepper">
        <button type="button" data-action="talent-dec" data-key="${def.key}" ${rank <= 0 ? "disabled" : ""}>-</button>
        <span class="value">${rank}</span>
        <button type="button" data-action="talent-inc" data-key="${def.key}" ${rank >= max ? "disabled" : ""}>+</button>
      </div>
      <div class="skill-meta small">Coût : ${cost}</div>
    </div>
  `;
}

function renderStep6() {
  return `
    <section class="card">
      <h2>Talents psychiques</h2>
      <p class="hint">Le capital dépend de la Vibrisse finale. Liste non exhaustive — voir README.</p>
      <div class="skill-grid">${TALENTS.map(talentCard).join("")}</div>
    </section>
  `;
}

function renderStep7() {
  const { errors, infos } = validate();
  return `
    <section class="card">
      <h2>Vérification</h2>
      ${errors.map((e) => `<div class="verif-line error">✕ ${e}</div>`).join("")}
      ${infos.map((i) => `<div class="verif-line info">ⓘ ${i}</div>`).join("")}
      <div class="actions">
        <button type="button" class="btn" data-action="goto-step" data-step="6">Revérifier ma fiche</button>
        <button type="button" class="btn btn-primary" data-action="goto-step" data-step="7" ${errors.length ? "disabled" : ""}>Générer ma fiche</button>
      </div>
    </section>
  `;
}

function renderStep8() {
  const { isValid, errors } = validate();
  if (!isValid) {
    return `
      <section class="card">
        <h2>Fiche finale imprimable</h2>
        <p class="warn">Votre fiche n'est pas encore valide. Retournez à l'étape Vérification.</p>
        <button type="button" class="btn" data-action="goto-step" data-step="6">Retour à la vérification</button>
      </section>
    `;
  }
  const i = state.identity;
  return `
    <section class="card" id="print-sheet">
      <h2>${i.name} — ${SPECIES.find((s) => s.key === i.type).label}</h2>
      <p>Race : ${state.breed} · Âge : ${i.age || "?"} · Réputation : ${i.reputation} · Faction : ${i.faction}</p>
      <h3>Caractéristiques</h3>
      <ul class="print-attrs">
        ${ATTRIBUTES.map((a) => `<li>${a.label} : ${finalAttribute(state, a.key)}</li>`).join("")}
      </ul>
      <h3>Compétences</h3>
      <ul class="print-skills">
        ${usableSkills()
          .filter((s) => (state.skills[s.key] || 0) > 0)
          .map((s) => `<li>${s.name} : rang ${state.skills[s.key]}</li>`)
          .join("") || "<li>Aucune</li>"}
      </ul>
      <h3>Talents</h3>
      <ul class="print-skills">
        ${TALENTS.filter((t) => (state.talents[t.key] || 0) > 0)
          .map((t) => `<li>${t.name} : rang ${state.talents[t.key]}</li>`)
          .join("") || "<li>Aucun</li>"}
      </ul>
      <h3>Qualités / Défauts</h3>
      <ul class="print-skills">
        ${[...state.chosenQualities, ...state.chosenDefects].map((t) => `<li>${t.name}</li>`).join("") || "<li>Aucun</li>"}
      </ul>
    </section>
    <div class="actions">
      <button type="button" class="btn" id="btn-print">Imprimer / PDF</button>
      <button type="button" class="btn btn-primary" id="btn-export-json">Exporter en JSON Foundry VTT</button>
    </div>
  `;
}

const STEP_RENDERERS = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8];

function render() {
  renderTabs();
  renderStatusBar();
  document.getElementById("step-content").innerHTML = STEP_RENDERERS[state.currentStep]();
  bindDynamicInputs();
  saveDraft();
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}

function setByPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
}

function bindDynamicInputs() {
  document.querySelectorAll("[data-bind]").forEach((elm) => {
    elm.addEventListener("input", () => {
      const path = elm.getAttribute("data-bind");
      let value = elm.value;
      if (elm.type === "number") value = value === "" ? "" : Number(value);
      setByPath(state, path, value);
      saveDraft();
      // Re-render status bar + tab without losing focus on the whole form.
      renderStatusBar();
      renderTabs();
      if (path === "identity.type") render();
    });
  });

  const customTraitForm = document.getElementById("custom-trait-form");
  if (customTraitForm) {
    customTraitForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(customTraitForm);
      const kind = fd.get("kind");
      const trait = {
        key: "custom_" + Date.now(),
        name: fd.get("name"),
        cost: Number(fd.get("cost")) || 0,
        note: fd.get("note") || "",
        custom: true,
      };
      if (kind === "quality") state.chosenQualities.push(trait);
      else state.chosenDefects.push(trait);
      render();
    });
  }

  const customSkillForm = document.getElementById("custom-skill-form");
  if (customSkillForm) {
    customSkillForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(customSkillForm);
      state.customSkills.push({
        name: fd.get("name"),
        attr: fd.get("attr"),
        secondAttr: fd.get("secondAttr") || null,
        usableBy: speciesLetterFor(state.identity.type),
        omega: fd.get("omega") === "on",
        specialty: fd.get("specialty") || "",
        rank: 0,
      });
      render();
    });
  }

  const printBtn = document.getElementById("btn-print");
  if (printBtn) printBtn.addEventListener("click", () => window.print());

  const exportBtn = document.getElementById("btn-export-json");
  if (exportBtn) exportBtn.addEventListener("click", () => downloadFoundryJSON(state));
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-action]");
  if (!t) return;
  const action = t.getAttribute("data-action");
  const key = t.getAttribute("data-key");

  if (action === "attr-inc") {
    const def = ATTRIBUTES.find((a) => a.key === key);
    if (state.attributes[key] < def.cap) state.attributes[key]++;
  } else if (action === "attr-dec") {
    if (state.attributes[key] > 1) state.attributes[key]--;
  } else if (action === "skill-inc") {
    state.skills[key] = (state.skills[key] || 0) + 1;
  } else if (action === "skill-dec") {
    state.skills[key] = Math.max(0, (state.skills[key] || 0) - 1);
  } else if (action === "talent-inc") {
    const def = TALENTS.find((tl) => tl.key === key);
    const max = def.maxRank[state.identity.type] || 5;
    if ((state.talents[key] || 0) < max) state.talents[key] = (state.talents[key] || 0) + 1;
  } else if (action === "talent-dec") {
    state.talents[key] = Math.max(0, (state.talents[key] || 0) - 1);
  } else if (action === "add-trait") {
    const kind = t.getAttribute("data-kind");
    const def = (kind === "quality" ? QUALITIES : DEFECTS).find((d) => d.key === key);
    (kind === "quality" ? state.chosenQualities : state.chosenDefects).push({ ...def });
  } else if (action === "remove-trait") {
    const kind = t.getAttribute("data-kind");
    const listName = kind === "quality" ? "chosenQualities" : "chosenDefects";
    state[listName] = state[listName].filter((c) => c.key !== key);
  } else if (action === "goto-step") {
    state.currentStep = Number(t.getAttribute("data-step"));
  } else {
    return;
  }
  render();
});

document.getElementById("tabs")?.addEventListener("click", (e) => {});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab");
    if (!btn) return;
    state.currentStep = Number(btn.getAttribute("data-step"));
    render();
  });

  document.getElementById("btn-resume").addEventListener("click", () => {
    if (loadDraft()) render();
    else alert("Aucun brouillon sauvegardé n'a été trouvé.");
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (confirm("Recommencer effacera votre brouillon actuel. Continuer ?")) {
      state = defaultState();
      render();
    }
  });

  loadDraft();
  render();
});
