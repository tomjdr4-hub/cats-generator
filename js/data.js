/*
 * Données de jeu pour "CATS! La Mascarade".
 *
 * Sources :
 *  - Structure et libellés : captures d'écran du générateur de référence
 *    (generateurcats.my.canva.site)
 *  - Clés d'attributs, formules de compétences, format d'export : export
 *    d'Acteur Foundry VTT fourni par l'utilisateur (système "cats-la-mascarade").
 *
 * Certaines valeurs (budgets de points pour Bastet/Humain, liste complète des
 * races, factions, talents) ne figuraient pas dans les captures fournies.
 * Elles sont marquées "TODO" ci-dessous : complétez-les depuis le livre de
 * base pour une fidélité totale aux règles officielles.
 */

const SPECIES = [
  { key: "cat", label: "Chat", letter: "C" },
  { key: "bastet", label: "Bastet", letter: "B" },
  { key: "human", label: "Humain", letter: "H" },
];

// 9 caractéristiques. "key" = clé utilisée par le système Foundry cats-la-mascarade.
const ATTRIBUTES = [
  { key: "claw", label: "Griffe", abbr: "GRI", cap: 5 },
  { key: "hair", label: "Poil", abbr: "POI", cap: 5 },
  { key: "tail", label: "Queue", abbr: "QUE", cap: 5 },
  { key: "eye", label: "Œil", abbr: "ŒIL", cap: 5 },
  { key: "purring", label: "Ronronnement", abbr: "RON", cap: 5 },
  { key: "caress", label: "Caresse", abbr: "CAR", cap: 5 },
  { key: "whiskers", label: "Vibrisse", abbr: "VIB", cap: 5 },
  { key: "pad", label: "Coussinet", abbr: "COU", cap: 5 },
  { key: "luck", label: "Chance", abbr: "CHA", cap: 3, noModifiers: true },
];

// Budget total de points à répartir exactement sur les 9 caractéristiques (valeur de départ = 1 chacune).
// TODO : confirmer si Bastet / Humain ont un budget différent dans le livre.
const ATTRIBUTE_BUDGET = { cat: 28, bastet: 28, human: 28 };

// Budget de base de points de compétences (avant effets des qualités/défauts).
// TODO : confirmer si ce budget varie selon le Type.
const SKILL_BASE_BUDGET = 6;

// Le budget de Talents dépend de la Vibrisse finale (indiqué dans la capture,
// formule exacte non fournie). Ici : 2 x Vibrisse finale (donne bien 2 quand Vibrisse = 1).
// TODO : vérifier la formule exacte dans le livre de base.
function talentBudgetFromWhiskers(whiskersFinal) {
  return whiskersFinal * 2;
}

// Liste des compétences, reprise telle quelle depuis l'export Foundry fourni.
// usableBy : sous-ensemble de "C" (Chat) / "B" (Bastet) / "H" (Humain).
// attrs : caractéristique(s) utilisée(s) pour le jet (affichage seulement, v1).
// omega : compétence inutilisable tant que le rang est à 0.
const SKILLS = [
  { key: "firearms", name: "Firearms", usableBy: "BH", attrs: ["eye"], omega: false },
  { key: "bladed_weapons", name: "Bladed weapons", usableBy: "BH", attrs: ["tail"], omega: false },
  { key: "martial_arts", name: "Martial Arts", usableBy: "H", attrs: ["claw", "tail"], omega: true, modifier: "H+1" },
  { key: "handicraft", name: "Handicraft", usableBy: "BH", attrs: ["eye", "purring"], omega: false },
  { key: "chasse", name: "Chasse", usableBy: "C", attrs: ["purring", "whiskers"], omega: false },
  { key: "culture_generale", name: "Culture Générale", usableBy: "CBH", attrs: ["purring"], omega: false },
  { key: "unarmed_combat", name: "Unarmed Combat", usableBy: "BH", attrs: ["claw", "hair"], omega: false },
  { key: "combat_griffu", name: "Combat Griffu", usableBy: "C", attrs: ["claw", "eye"], omega: false },
  { key: "driving", name: "Driving", usableBy: "BH", attrs: ["purring"], omega: false },
  { key: "connaissance_rue", name: "Connaissance de la rue", usableBy: "CBH", attrs: ["purring", "pad"], omega: false },
  { key: "disguise", name: "Disguise", usableBy: "BH", attrs: ["eye"], omega: false },
  { key: "discretion", name: "Discrétion", usableBy: "CBH", attrs: ["tail"], omega: false },
  { key: "law_customs", name: "Law & Customs", usableBy: "BH", attrs: ["purring"], omega: true },
  { key: "escalade", name: "Escalade", usableBy: "CBH", attrs: ["claw", "tail"], omega: false },
  { key: "enerver_humains", name: "Enerver les humains", usableBy: "C", attrs: ["tail", "purring"], omega: false },
  { key: "langage_humain", name: "Langage humain", usableBy: "C", attrs: ["purring"], omega: true },
  { key: "foreign_language", name: "Foreign Language", usableBy: "BH", attrs: ["purring"], omega: true },
  { key: "leadership", name: "Leadership", usableBy: "CBH", attrs: ["caress"], omega: false },
  { key: "odorat", name: "Odorat", usableBy: "CBH", attrs: ["purring", "whiskers"], omega: false },
  { key: "orientation", name: "Orientation", usableBy: "CBH", attrs: ["whiskers"], omega: false },
  { key: "feline_psychology", name: "Feline Psychology", usableBy: "BH", attrs: ["purring", "whiskers"], omega: false },
  { key: "psychologie_humaine", name: "Psychologie Humaine", usableBy: "CB", attrs: ["purring"], omega: false },
  { key: "reclamer_manger", name: "Réclamer à manger", usableBy: "C", attrs: ["purring"], omega: false },
  { key: "reclamer_caresses", name: "Réclamer des caresses", usableBy: "C", attrs: ["pad"], omega: false },
  { key: "saut", name: "Saut", usableBy: "CBH", attrs: ["eye", "tail"], omega: false },
  { key: "first_aid", name: "First aid", usableBy: "BH", attrs: ["purring"], omega: true },
  { key: "seduire", name: "Séduire", usableBy: "CBH", attrs: ["pad"], omega: false },
  { key: "survie", name: "Survie", usableBy: "CBH", attrs: ["purring", "whiskers"], omega: false },
  { key: "reperer_trouver", name: "Repérer/trouver", usableBy: "CBH", attrs: ["purring", "whiskers"], omega: false },
  { key: "us_coutumes_humaines", name: "Us & Coutumes Humaines", usableBy: "CB", attrs: ["purring"], omega: false },
  { key: "utiliser_objet_humain", name: "Utiliser un objet humain", usableBy: "C", attrs: ["eye"], omega: false },
];

// Coût en points pour atteindre un rang de compétence donné (barème "standard" = 1 pt/rang).
// TODO : confirmer s'il existe d'autres barèmes ("réduit"/"majoré") mentionnés dans le formulaire
// de compétence personnalisée du générateur de référence.
function skillCost(rank) {
  return rank;
}

// Qualités (avantages) : coût négatif = points pris sur le pool de compétences.
const QUALITIES = [
  { key: "ambidextre", name: "Ambidextre", cost: -8, note: "+1 Œil permanent." },
  { key: "ami_des_chats", name: "Ami des chats", cost: -8, note: "+1 Coussinet envers les Chats." },
  { key: "athlete", name: "Athlète", cost: -8, note: "+1 Poil permanent." },
  { key: "chouchou_quartier", name: "Chouchou du quartier", cost: -8, note: "+1 Coussinet envers les Humains." },
  { key: "crediteur_q", name: "Créditeur", cost: -8, note: "" },
  { key: "debrouillard", name: "Débrouillard en milieu humain", cost: -8, note: "Baisse d'un cran la difficulté des actions simples liées aux objets humains." },
  { key: "don_juan", name: "Don Juan", cost: -8, note: "+1 Coussinet envers le sexe opposé." },
  { key: "ennemi_prefere", name: "Ennemi préféré", cost: -6, note: "Difficulté des combats contre cet ennemi diminuée d'un cran." },
  { key: "equilibriste", name: "Équilibriste", cost: -8, note: "+1 Queue permanent." },
  { key: "griffes_acier", name: "Griffes d'acier", cost: -6, note: "+1 niveau de blessure aux dégâts de griffes." },
  { key: "pattes_velours", name: "Pattes de velours", cost: -6, note: "" },
  { key: "sauteur_exceptionnel", name: "Sauteur exceptionnel", cost: -6, note: "" },
  { key: "volonte_de_fer", name: "Volonté de fer", cost: -8, note: "+1 Caresse permanent." },
  { key: "reputation_matou", name: "Réputation de matou", cost: -6, note: "" },
];

// Défauts (désavantages) : coût positif = points gagnés sur le pool de compétences.
const DEFECTS = [
  { key: "allergique_chats", name: "Allergique aux chats", cost: 4, note: "Jet Poil Difficile près d'un Chat." },
  { key: "boiteux", name: "Boiteux", cost: 4, note: "" },
  { key: "curieux", name: "Curieux", cost: 2, note: "Jet Caresse Difficile." },
  { key: "debiteur", name: "Débiteur", cost: 4, note: "" },
  { key: "defigure", name: "Défiguré", cost: 4, note: "" },
  { key: "gourmand", name: "Gourmand", cost: 4, note: "Jet Caresse Difficile." },
  { key: "hydrophile", name: "Hydrophile", cost: 4, note: "-1 Coussinet conditionnel envers les autres Chats." },
  { key: "joueur", name: "Joueur", cost: 4, note: "Jet Caresse Difficile." },
  { key: "mepris_humains", name: "Mépris pour les humains", cost: 4, note: "-1 Coussinet conditionnel envers les Humains." },
  { key: "raleur", name: "Râleur", cost: 4, note: "Perte d'un point de Coussinet.", modifierFormula: "pad-1" },
  { key: "vertige", name: "Vertige", cost: 4, note: "Jet Caresse Difficile en hauteur." },
  { key: "voyant", name: "Voyant", cost: 2, note: "" },
  { key: "phobie", name: "Phobie", cost: 0, note: "Précisez la phobie.", freeText: true },
  { key: "lubie", name: "Lubie", cost: 0, note: "Précisez la lubie.", freeText: true },
];

// Talents psychiques. Liste incomplète : seuls les talents visibles dans les captures
// fournies et dans l'exemple de fiche sont repris ici. Le livre de base en contient
// davantage (ordre alphabétique interrompu après "Hypnose" dans la capture).
// maxRank : plafond de rang par espèce. Les valeurs Bastet/Humain sont connues pour
// Télékinésie, Téléportation, Arrêt Temporel, Hypnose et Sommeil (tirées de l'exemple
// de fiche). Pour les autres, la valeur Chat (5) est reprise à titre de FALLBACK — à
// corriger depuis le livre.
const TALENTS = [
  { key: "allergene", name: "Allergène", note: "Rayon 5×rang m, malus rang, pendant 5×rang min.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "armure", name: "Armure", note: "Réduit les blessures de rang pendant 5×rang s.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "arret_temporel", name: "Arrêt Temporel", note: "Fige pendant 5×rang s.", maxRank: { cat: 5, bastet: 3, human: 1 } },
  { key: "brouilleur_electronique", name: "Brouilleur électronique", note: "Perturbe rang appareils, rayon 5×rang m, pendant 5×rang min.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "clairaudience", name: "Clairaudience", note: "Portée : 15/30/60/120/250 m.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "clairvoyance", name: "Clairvoyance", note: "Portée : 15/30/60/120/250 m.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "controle_gravitationnel", name: "Contrôle gravitationnel", note: "Bonds jusqu'à 5×rang m.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "controle_mental", name: "Contrôle mental", note: "Contrôle un Humain 5×rang min s'il rate Caresse.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "deplacement_temporel", name: "Déplacement temporel", note: "Projette l'esprit avec rang-1 compagnons pendant 5×rang min.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "effet_schrodinger", name: "Effet Schrödinger", note: "Double rang min.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "force", name: "Force", note: "Ajoute temporairement rang à Griffe pendant 5×rang min ; peut dépasser 5 en partie.", maxRank: { cat: 5, bastet: 5, human: 5 } },
  { key: "hypnose", name: "Hypnose", note: "Efface 5×rang minutes ou implante un souvenir jusqu'à rang jours.", maxRank: { cat: 5, bastet: 4, human: 3 } },
  { key: "sommeil", name: "Sommeil", note: "Endort les humains dans un rayon de 5×rang m pour 1d10×rang minutes.", maxRank: { cat: 5, bastet: 2, human: 1 } },
  { key: "telekinesie", name: "Télékinésie", note: "Déplace / déforme / ralentit un objet de moins de 20×rang kg durant 5×rang s.", maxRank: { cat: 5, bastet: 3, human: 2 } },
  { key: "teleportation", name: "Teleportation", note: "Téléporte (rang) personnages ou un objet de 5×rang kg dans un rayon de 20×rang km.", maxRank: { cat: 5, bastet: 3, human: 2 } },
];

function talentCost(rank) {
  return rank;
}

// Factions connues. Liste incomplète — seule "Les Interventionnistes" figure dans les
// sources fournies. À compléter depuis le livre de base.
const FACTIONS = ["Sans faction", "Les Interventionnistes"];

// Valeur spéciale pour l'option "Autre race" du menu déroulant (voir capture d'écran).
const OTHER_BREED_VALUE = "__other__";
const OTHER_BREED_LABEL = "Autre race - validation de la MJ recommandée";

// Races/lignées "officielles". Liste des races de Chat reprise telle quelle du
// générateur de référence (menu déroulant). Bastet/Humain restent à compléter
// depuis le livre de base (le champ bascule en saisie libre tant que la liste
// est vide).
const BREEDS = {
  cat: [
    "Abyssin",
    "Angora",
    "Bengal",
    "Birman",
    "British Shorthair",
    "Chartreux",
    "Exotic Shorthair",
    "Européen",
    "Maine Coon",
    "Norvégien",
    "Oriental",
    "Persan",
    "Ragdoll",
    "Scottish Fold",
    "Siamois",
    "Somali",
  ],
  bastet: [],
  human: [],
};
