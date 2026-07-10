Ce projet a été développé en partant du principe qu'il sera un shader de Lively Wallpaper.

Pour éviter les problèmes de focus, je vous conseille d'aller dans :
`paramètres > Fond d'écran > Périphérique d'interaction : Clavier`. Cela aura aussi pour conséquence de ne plus afficher les icones de bureau, un module existe justement pour y avoir accès via une liste.

Vous pouvez aussi activer `Interaction de la souris lorsqu'une autre application est au premier plan` de ce même endroit afin de continuer à interagir avec lorsqu'une autre fenêtre est devant.

⚠️ Il est nécessaire d'avoir installé Node.js au préalable.

Pour mettre en place le shader, il vous suffit de double cliquer sur `setup.vbs` qui s'occupera d'installer les fichiers nécessaires et de placer un raccourcis de `open-settings.vbs` sur le bureau.

Ensuite il ne vous reste plus qu'à ajouter le shader sur Lively Wallpaper. Depuis le menu principal, appuyez sur le `+` en haut, appuyez sur `Sélectionner un fichier`, parcourez vos fichier pour atteindre le dossier du projet puis sélectionnez `index.html`, confirmez ensuite les deux dernières pages et vous aurez fini.

Le shader s'appliquera automatiquement et vous n'aurait plus qu'à l'utiliser. L'application du shader est plus long la première fois puisqu'il initialise la base de données et récupère le chemin vers le dossier du shader.

Points à connaitre pour utiliser le shader :
  - ⚠️ le scroll n'étant pas possible sur Lively Wallpaper, vous pouvez maintenir le clique sur les éléments qui peuvent scroll et bouger la souris pour monter ou descendre l'élément.
  - le raccourcis open-settings vous envoie directement sur la page web de configuration.
  - appuyez sur `Entrer` lorsque le shader a le focus pour créer un nouveau post-it.
  - les touches `Entrer`, `Echap` et `Suppr` fonctionnent pour les modules et actions qui les utiliseraient logiquement.
  - le menu d'applications du bureau permet de rechercher aussi bien des fichiers que des dossiers.
  - la recherche se limite aux chemins : `C:/User/Nom/AppData/`, `D:/`, `E:/` et `F:/`.
  - double cliquer sur une ligne du menu permet d'exécuter l'application / le logiciel ou d'ouvrir le fichier / dossier.
  - lorsque le shader a le focus, il est possible de rafraichir le shader en appuyant sur `ctrl`+`R`.

Le projet peut être utilisé dans un navigateur classique mais nécessite la mise en place d'un serveur Node et engendre des rechargements automatiques lorsque la base de données se met à jour.
