Set WshShell = CreateObject("WScript.shell")
WshShell.Run "explorer http://localhost:5501/settingsPage/settings.html", 0, False  '| Ouvre le navigateur pas défaut à l'adresse de la page de settings