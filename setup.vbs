Set WshShell = CreateObject("WScript.Shell")

Start = WshShell.ExpandEnvironmentStrings("%APPDATA%") & "\Microsoft\Windows\Start Menu\Programs\Startup\start.lnk"
Set sLink = WshShell.CreateShortcut(Start)
sLink.TargetPath = ".\BDD\start.vbs"
sLink.WorkingDirectory = ".\BDD"
sLink.Description = "Start the database server and the config web page server"
sLink.IconLocation = ".\BDD\start.vbs,0"
sLink.Save

Desktop = WshShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\Desktop\open-settings.lnk"
Set dLink = WshShell.CreateShortcut(Desktop)
dLink.TargetPath = ".\SettingsPage\open-settings.vbs"
dLink.WorkingDirectory = ".\SettingsPage"
dLink.Description = "Open the default browser with the config web page"
dLink.IconLocation = ".\SettingsPage\open-settings.vbs,0"
dLink.Save

WshShell.Run "cmd /c cd /d .\BDD && dir | npm install", 0, False
WshShell.Run "cmd /c .\start.vbs", 0, False
WshShell.Run "cmd /c cd .. | del setup.vbs", 0, False