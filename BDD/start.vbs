Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c node ./server.js", 0, False    '| Lance le serveur de base de données
WshShell.Run "cmd /c cd .. && npx serve . -p 5501", 0, False    '| Lance le serveur pour la page de settings