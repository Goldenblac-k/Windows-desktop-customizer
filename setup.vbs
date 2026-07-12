Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim scriptDir
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName) '| Défini le dossier du script

Start = WshShell.ExpandEnvironmentStrings("%APPDATA%") & "\Microsoft\Windows\Start Menu\Programs\Startup\start.lnk" '|
Set sLink = WshShell.CreateShortcut(Start)                                                                          '|
sLink.TargetPath = scriptDir & "\BDD\start.vbs"                                                                     '| Crée un raccourcis dans le dossier de démarrage windows
sLink.WorkingDirectory = scriptDir & "\BDD"                                                                         '| pour lancer les serveurs au démarrage de l'ordinateur
sLink.Description = "Start the database server and the config web page server"                                      '|
sLink.Save                                                                                                          '|

Desktop = WshShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\Desktop\open-settings.lnk" '|
Set dLink = WshShell.CreateShortcut(Desktop)                                                '|
dLink.TargetPath = scriptDir & "\SettingsPage\open-settings.vbs"                            '| Crée un raccourcis de la page
dLink.WorkingDirectory = scriptDir & "\SettingsPage"                                        '| de settings sur le bureau
dLink.Description = "Open the default browser with the config web page"                     '|
dLink.Save                                                                                  '|

WshShell.Run "cmd /c cd /d """ & scriptDir & "\BDD"" && npm install", 1, True   '| Installe les modules node
WshShell.CurrentDirectory = scriptDir & "\BDD"
WshShell.Run "wscript """ & scriptDir & "\BDD\start.vbs""", 0, False    '| Démarre les serveurs
fso.DeleteFile WScript.ScriptFullName   '| Supprime le script de setup