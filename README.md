# Générateur de personnage — CATS! La Mascarade

Générateur de personnage web (statique, sans dépendance) pour le jeu de rôle
**CATS! La Mascarade** (Black Book Éditions, auteur Vincent Mathieu), inspiré
du générateur [generateurcats.my.canva.site](https://generateurcats.my.canva.site/).

Le wizard reproduit les 8 étapes de création (Type et identité, Race, Caractéristiques,
Qualités et défauts, Compétences, Talents psychiques, Vérification, Fiche finale),
et se termine par un **export JSON directement importable comme Acteur dans Foundry VTT**
(système `cats-la-mascarade`), au format illustré par l'exemple fourni (`Arwen`).

## Utiliser le générateur

Aucune installation nécessaire : ouvrez `index.html` dans un navigateur, ou servez
le dossier statiquement (GitHub Pages, `npx serve`, etc.).

Le brouillon est sauvegardé automatiquement dans le `localStorage` du navigateur
("Reprendre mon brouillon" / "Recommencer").

## Importer la fiche générée dans Foundry VTT

1. Terminez la création (étape 7 "Vérification" sans erreur).
2. Étape 8, bouton **Exporter en JSON Foundry VTT** : télécharge un fichier
   `fvtt-Actor-<nom>.json`.
3. Dans Foundry VTT, onglet Acteurs → *Import Data* (icône d'import) sur un acteur
   existant, ou glissez le fichier dans le répertoire de données du monde selon votre
   version de Foundry.

## Ce qui est fiable vs. ce qui reste à compléter

Ce dépôt ne contient **aucun texte narratif du livre** (pas de description de talent,
pas de fiction) : uniquement des mécaniques (noms, formules, coûts en points), pour
rester dans un usage raisonnable au regard du droit d'auteur de Black Book Éditions.
Le [système Foundry fan-made cats-la-mascarade](https://gitlab.com/Vlyan/cats-la-mascarade)
(licence CC BY-NC-SA 4.0) a servi de repère pour la structure d'export.

Éléments **fiables**, repris directement de l'export Foundry fourni par l'utilisateur :
- Les 9 caractéristiques (clés, libellés, abréviations, plafonds 5 / 3 pour Chance).
- La liste des 31 compétences, leurs formules (`js/data.js`, `SKILLS`), et leur
  disponibilité par espèce (Chat / Bastet / Humain).
- Le format d'export JSON (structure Acteur/Items Foundry).
- 5 talents avec plafonds par espèce connus (Télékinésie, Téléportation, Arrêt
  Temporel, Hypnose, Sommeil).
- Le barème officiel de coût des rangs de compétence (table du livre de base,
  `SKILL_RANK_COSTS` dans `js/data.js`) : Néophyte 0 · Amateur 1 · Connaisseur 2 ·
  Professionnel 4 · Expert 8 · Maître 16 points. Rang 5 (Maître) = plafond.

Éléments **transcrits depuis les captures d'écran du générateur de référence** (donc
fidèles à cet outil, mais pas nécessairement au livre canonique si celui-ci diffère) :
- Les listes de Qualités et Défauts avec leur coût en points.
- Les budgets de points visibles (28 caractéristiques / 6 compétences / talents = 2×Vibrisse).
- 10 talents supplémentaires (nom + effet résumé), plafonnés à 5 par défaut.

Éléments **à compléter vous-même depuis le livre de base** (marqués `TODO` dans
`js/data.js`) :
- `BREEDS` : liste des races officielles par espèce (vide actuellement — le champ
  bascule automatiquement en saisie libre tant que la liste est vide).
- `FACTIONS` : seule "Les Interventionnistes" est connue.
- Budgets de caractéristiques/compétences pour Bastet et Humain (repris à 28/6 par
  défaut, à vérifier).
- Formule exacte du budget de Talents (actuellement 2 × Vibrisse finale, à confirmer).
- Talents manquants au-delà des 15 listés, et plafonds Bastet/Humain exacts pour les
  10 talents dont seul le plafond "Chat" était visible.

## Structure du projet

```
index.html        squelette de la page et des 8 étapes
css/style.css      mise en forme
js/data.js         données de jeu (attributs, compétences, talents, qualités/défauts, budgets)
js/app.js          état du wizard, rendu, validations, sauvegarde locale
js/export.js       construction du JSON Acteur Foundry VTT + téléchargement
```

## Licence

Le code de ce dépôt est sous licence MIT (voir `LICENSE`). *CATS! La Mascarade* est
une œuvre de Black Book Éditions : ce projet est un outil fan-made non officiel, sans
lien avec l'éditeur, et ne redistribue aucun contenu protégé du livre.
