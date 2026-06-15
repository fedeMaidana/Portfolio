---
title: 'ARC'
number: '#006'
category: 'DeveloperApplication'
description: 'Couche de sécurité en Rust pour les agents IA et les scripts : elle examine chaque action avant son exécution et décide de l’autoriser, de la bloquer ou de demander une approbation.'
repoUrl: 'https://github.com/fedeMaidana/ARC'
tags: ['Rust', 'CLI', 'Security', 'AI Agents']
---

Décisions techniques :

### Ce que c’est : un sas pour les actions

ARC —Action Review Controller— est une couche de sécurité en ligne de commande qui se place entre un agent IA (ou un script, ou un outil) et le système. Avant qu’une action ne s’exécute, ARC l’examine et prend l’une de trois décisions : autoriser, bloquer ou demander une approbation humaine. À part ça, il lui attribue un niveau de risque —faible, moyen, élevé ou critique— indépendant de la décision : une commande peut nécessiter une approbation sans être dangereuse, et inversement. Le flux complet est toujours le même : requête → examen → décision → journalisation → exécution sûre.

### Architecture hexagonale

Le projet est découpé en quatre couches bien séparées : le _domaine_ avec la logique pure de décision (sans toucher au disque ni au réseau), l’_application_ qui orchestre le flux d’examen à travers un port, l’_infrastructure_ avec les adaptateurs concrets (config, exécuteur, journal d’audit, moteurs de politique, découverte d’agents, shims) et l’_interface_ (CLI, API JSON, TUI). Le port est un trait `ReviewEnvironment`, et il n’y a qu’un seul endroit dans tout le code qui relie l’infrastructure réelle à ce port. L’avantage concret, c’est que toute la logique de sécurité peut être testée avec des fonctions pures, sans démarrer de processus ni toucher au système de fichiers.

### Deux moteurs de politiques : natif et Rego

ARC embarque un moteur de politiques natif écrit en Rust, mais il peut aussi déléguer la décision à `Rego`/`OPA` (le langage de politiques d’Open Policy Agent) si vous le configurez. Le moteur se choisit par configuration et les deux renvoient la même structure de décision. Le point important, c’est que le moteur Rego _échoue fermé_ : si `OPA` n’est pas installé, met trop de temps ou renvoie quelque chose qu’ARC ne comprend pas, la décision par défaut est de bloquer avec un risque critique. En sécurité, c’est le bon choix —dans le doute, on n’exécute pas— et c’est couvert par des tests.

### Politiques de console à l’épreuve du contournement

Pour les commandes, les règles sont fines : chaque commande a une politique (autoriser, demander ou bloquer), chaque sous-commande aussi, et les arguments peuvent être bloqués ou exiger une approbation. L’intéressant, c’est tout le travail fait pour qu’on ne puisse pas les contourner. Les chemins sont normalisés avant d’être comparés, donc une astuce comme `cat safe/../../.env` n’esquive pas la liste des ressources protégées. Passer la commande par chemin absolu ou relatif (`/usr/bin/git`, `./git`) ne la fait pas passer comme si c’était une autre commande, et enchaîner du texte dans la sous-commande (`git status;push`) est détecté et rejeté. Tout part d’une posture de _refus par défaut_ : ce qui n’est pas explicitement autorisé ne passe pas.

### Protection réseau contre le SSRF

Quand une action vise une URL, ARC l’analyse pour bloquer les requêtes vers des endroits qu’il ne devrait pas toucher : localhost, réseaux privés, adresses link-local et —crucial dans le cloud— le service de métadonnées à `169.254.169.254`. Il bloque par schéma, par hôte et par plages d’IP (CIDR). C’est une défense contre le _SSRF_ (Server-Side Request Forgery : tromper un processus pour qu’il fasse des requêtes vers des adresses internes), une faille classique quand un agent peut demander des URLs arbitraires.

### API JSON stricte pour les agents

Au-delà de l’usage humain, ARC expose `arc decide --json` : il lit une requête en JSON sur l’entrée standard et renvoie une réponse structurée. C’est _décision seule_, il n’exécute jamais rien, donc un agent peut la consulter avant d’agir sans aucun risque. L’entrée est validée strictement —elle rejette les champs inconnus, les commandes vides ou les formes mal construites— et le contrat est stable : une version d’API fixe, des codes de raison lisibles par machine et des codes de sortie sur lesquels un agent peut compter (0 s’il autorise ou demande, 1 s’il bloque, 2 si la requête est invalide).

### Shims : intercepter l’agent sans qu’il s’en rende compte

C’est la partie la plus astucieuse. Pour se mettre vraiment au milieu, ARC installe des _launchers_ dans un répertoire placé en premier dans le `PATH`. Quand l’agent exécute une commande, il tombe d’abord sur le launcher, qui marque d’où vient la requête, ajoute un second répertoire de shims en tête du `PATH`, et lance seulement ensuite le vrai binaire. Ce second répertoire contient des shims `bash` et `sh` qui réacheminent les commandes shell vers ARC. Et voici un choix de conception fort : au lieu d’essayer de parser du shell arbitraire, le shim _refuse_ tout ce qui a une syntaxe complexe —pipes, `;`, `&`, `$`, backticks, redirections— ; s’il ne peut pas le raisonner en toute sécurité, il ne l’exécute pas. Pour trouver quoi intercepter, ARC scanne le `PATH` à la recherche d’agents connus (Claude Code, OpenCode, Codex, Gemini et plusieurs autres) et de candidats par heuristique, en évitant ses propres répertoires pour ne pas boucler.

### Exécution bornée et audit

Quand une action est approuvée et qu’ARC l’exécute, il le fait dans une boîte avec des limites : par défaut il nettoie l’environnement, plafonne la sortie à un nombre maximal d’octets et applique un timeout qui tue le processus s’il se bloque. Et quoi qu’il arrive, chaque décision est enregistrée dans un journal d’audit au format JSON Lines. Ce journal masque automatiquement tout ce qui ressemble à du sensible —clés d’API, mots de passe, tokens, _bearer_— avant d’écrire, tronque les champs énormes et, sur les systèmes Unix, se retrouve avec des permissions restreintes au seul propriétaire. L’idée, c’est de pouvoir reconstruire ce qui s’est passé sans laisser fuiter de secrets en chemin.

### Tests et CI exhaustifs

Comme c’est un outil de sécurité, la confiance compte, donc les tests sont sérieux. Il y a des tests unitaires, d’intégration et end-to-end —y compris la matrice de politiques, les cas de contournement, le parseur d’URLs et l’API JSON—, et les end-to-end démarrent le vrai binaire avec des répertoires temporaires isolés. La CI exécute à chaque push le formatage, `Clippy` avec les warnings traités comme des erreurs, et toute la batterie de tests avec `cargo-nextest`. La même série de vérifications peut être lancée localement avant de commiter.
