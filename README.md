# Window desktop customizer

> Un fond d'écran interactif et dynamique conçu spécifiquement comme **shader pour Lively Wallpaper**, intégrant des modules d'agenda, de raccourcis bureau et de post-it.

## Configuration recommandée dans Lively Wallpaper

Afin d'éviter tout conflit ou problème de focus lors de l'utilisation du shader, il est fortement conseillé d'ajuster les paramètres suivants dans Lively Wallpaper :

1. Rendez-vous dans : **`Paramètres` → `Fond d'écran` → `Périphérique d'interaction`** et sélectionnez **`Clavier`**.
   * *Note : Cette option masque les icônes de bureau natives de Windows. Un module dédié est intégré au shader pour naviguer dans vos applications sous forme de liste.*
2. Activez également l'option **`Interaction de la souris lorsqu'une autre application est au premier plan`** au même endroit afin de pouvoir continuer à interagir avec le shader même si une fenêtre est ouverte par-dessus.

## Prérequis

⚠️ **Node.js** doit être obligatoirement installé sur votre système au préalable.

## Installation et configuration

### 1. Initialisation
Double-cliquez sur le fichier **`setup.vbs`**.  
Ce script s'occupe automatiquement :
* D'installer l'ensemble des fichiers et dépendances nécessaires.
* De créer un raccourci de **`open-settings.vbs`** directement sur votre bureau.

### 2. Ajout dans Lively Wallpaper
1. Ouvrez **Lively Wallpaper** sur le menu principal.
2. Cliquez sur le bouton **`+`** situé en haut de la fenêtre.
3. Cliquez sur **`Sélectionner un fichier`**.
4. Parcourez vos dossiers jusqu'au répertoire du projet et sélectionnez le fichier **`index.html`**.
5. Validez les deux dernières pages de confirmation.

> **Remarque :** Le premier lancement du shader peut prendre un peu plus de temps que d'habitude. Il procède à l'initialisation de la base de données et à la récupération du chemin d'accès au dossier du shader. Une fois cette étape franchie, l'application s'effectue automatiquement.

## Guide d'utilisation et fonctionnalités

Voici les points clés à connaître pour exploiter pleinement le shader :

* **Navigation et défilement** : Le défilement à la molette (*scroll*) n'étant pas pris en charge par Lively Wallpaper, maintenez le **clic gauche enfoncé** sur un élément déroulant et déplacez la souris vers le haut ou le bas pour naviguer.
* **Configuration** : Le raccourci `open-settings` créé sur le bureau vous redirige directement vers la page web de configuration.
* **Gestion des post-its** : Appuyez sur la touche <kbd>Entrée</kbd> lorsque le shader a le focus pour générer instantanément un nouveau post-it.
* **Raccourcis clavier** :
  * Les touches <kbd>Entrée</kbd>, <kbd>Échap</kbd> et <kbd>Suppr</kbd> sont gérées nativement par les modules et actions associées.
  * Pressez <kbd>Ctrl</kbd> + <kbd>R</kbd> lorsque le shader a le focus pour rafraîchir l'interface.
* **Lancement d'applications et fichiers** :
  * Le menu d'applications permet de rechercher simultanément des fichiers et des dossiers.
  * La recherche est restreinte aux répertoires suivants : `C:/User/Nom/AppData/`, `D:/`, `E:/` et `F:/`.
  * Effectuez un **double-clic** sur une ligne pour lancer l'application/logiciel ou ouvrir le fichier/dossier sélectionné.
* **Personnalisation de la disposition** : Depuis le site de configuration, redimensionnez les modules à tout moment en maintenant le clic sur leur **coin inférieur droit**.

## Utilisation hors Lively Wallpaper (navigateur classique)

Il est possible d'exécuter ce projet directement dans un navigateur web standard.
Cependant, cette utilisation nécessite :
1. La mise en place et le lancement d'un **serveur Node.js**.
2. De prendre en compte que des **rechargements automatiques de page** surviendront à chaque mise à jour de la base de données.
