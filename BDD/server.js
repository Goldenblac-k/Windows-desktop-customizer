import express from 'express'
import cors from 'cors'
import db from './db.js'
import fs from 'fs'
import path from 'path'
import {exec, execSync} from 'child_process'
import {error} from 'console'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.text())

var desktop
try {   // Récupère le chemin vers le bureau
    if (db.prepare('select count(*) as nb from desktop').get()['nb'] == 0) {
        desktop = execSync(`powershell -Command "[Environment]::GetFolderPath('Desktop')"`).toString().trim().replace(/\\/g, '/');
        console.log(desktop)
        db.prepare('insert into desktop values(?)').run(desktop)
    } else desktop = db.prepare('select path from desktop').get()['path']
} catch (e) {
    res.status(500).json({ error: "Impossible de trouver le bureau" })
}

/* -- Notes -- */

app.get('/notes', (req, res) => {   // Renvoie toutes les notes enregistrées
    res.json(db.prepare('select * from notes').all())
})

app.post('/notes', (req, res) => {  // Insert une nouvelle note et renvoie son identifiant
    const {title, desc, top, left, zInd, r, g, b} = req.body
    const result = db.prepare('insert into notes(title, desc, top, left, zInd, r, g, b) values (?, ?, ?, ?, ?, ?, ?, ?)').run(title, desc, top, left, zInd, r, g, b)
    res.json({id: result.lastInsertRowid})
})

app.patch('/notes/:id', (req, res) => { // Met à jour une note
    const {title, desc, top, left, zInd} = req.body
    db.prepare('update notes set title = ?, desc = ?, top = ?, left = ?, zInd = ? where id = ?').run(title, desc, top, left, zInd, req.params.id)
    res.json({ok: true})
})

app.delete('/notes/:id', (req, res) => {    // Supprime une note
    db.prepare('delete from notes where id = ?').run(req.params.id)
    res.json({ok: true})
})

/* -- Calendar -- */

app.get('/calendar', (req, res) => {    // Renvoie tous les événements enregistrés
    res.json(db.prepare('select * from calendar').all())
})

app.post('/calendar', (req, res) => {   // Insert un nouvel événement et renvoie son identifiant
    const {titre, date, deb, fin, desc} = req.body
    const result = db.prepare('insert into calendar(titre, date, deb, fin, desc) values (?, ?, ?, ?, ?)').run(titre, date, deb, fin, desc)
    res.json({id: result.lastInsertRowid})
})

app.patch('/calendar/:id', (req, res) => {  // Met à jour un événement
    const {titre, date, deb, fin, desc} = req.body
    db.prepare('update calendar set titre = ?, date = ?, deb = ?, fin = ?, desc = ? where id = ?').run(titre, date, deb, fin, desc, req.params.id)
    res.json({ok: true})
})

app.delete('/calendar/:id', (req, res) => { // Supprime un événement
    db.prepare('delete from calendar where id = ?').run(req.params.id)
    res.json({ok: true})
})

app.get('/view', (req, res) => {    // Renvoie le mode d'affichage enregistré
    res.json(db.prepare('select * from view').all())
})

app.post('/view/update', (req, res) => {    // Met à jour le mode d'affichage ou l'insert s'il n'existe pas
    const {view} = req.body
    const current = db.prepare('select * from view').get()

    if (!current){
        db.prepare('insert into view values(?)').run(view)
    } else db.prepare('update view set currentView = ?').run(view)
    res.json({ ok: true })
})

/* -- AppMenu -- */

function getWindowsIcon(filePath) {
    /*
    Récupère l'icône associée au chemin d'un fichier cible
    */
   
    return new Promise((resolve) => {
        IconExtractor.getIcon(filePath, filePath, (err, iconB64) => {
            if (err || !iconB64) {
                resolve('')
            } else {
                resolve(`data:image/png;base64,${iconB64}`)
            }
        })
    })
}

app.get('/bureau', (req, res) => {  // Renvoie le contenu du bureau
    const query = req.query.search
    
    if (!query){    // S'il n'y a pas de recherche
        try {
            const files = fs.readdirSync(desktop)   // Lit les fichiers du bureau
            const filteredFiles = files.filter(file =>  //
                file.toLowerCase() !== 'desktop.ini' && // Retire les fichiers
                file.toLowerCase() !== 'ntuser.dat'     // sensibles
            )                                           //

            return res.json(filteredFiles.map(f => ({ nom: f, chemin: path.join(desktop, f) })))
        } catch (e) {
            res.status(500).json({ error: "Impossible de lire le bureau" })
        }
    }
    
    // S'il y a une recherche

    const safeQuery = query.replace(/['"*;]/g, '')  // Sécurise la saisie pour empêcher l'injection de code
    const searchPath = [
        'C:/Users/joang',
        'D:/',
        'E:/',
        'F:/'
    ]
    const psPaths = "@(" + searchPath.map(p => `'${p.replace(/\//g, '\\')}'`).join(',') + ")"   // Crée les chemins racines de la recherche
    const psCommand = `
        ${psPaths} | ForEach-Object { 
            Get-ChildItem -Path $_ -Include '*${safeQuery}*' -Recurse -ErrorAction SilentlyContinue | 
            Where-Object { $_.FullName -notmatch '\\\\AppData\\\\' } 
        } | Select-Object -First 100 | ForEach-Object { $_.FullName }
    `.replace(/\r?\n|\r/g, " ") // Recherche tous les fichiers et dossiers comportant le texte recherché dans leur nom et s'arrête aux 100 premiers

    exec(`powershell -NoProfile -Command "${psCommand}"`, (err, stdout) => {    // Exécute la commande
        if (err || !stdout) {   // Renvoie vide s'il n'y a pas de résultat ou s'il y a une erreur
            return res.json([])
        }

        const paths = stdout.trim().split(/\r?\n/).filter(p => p.trim() !== '') // Découpe les chemins du résultat de manière exploitable
        const result = paths.map(fullPath => {
            const nom = path.basename(fullPath)
            return {
                nom: nom,
                chemin: fullPath
            }
        })

        res.json(result)
    })
})

app.get('/icone', (req, res) => {   // Renvoie l'icône du fichier ciblé
    const filename = req.query.file
    if (!filename) return res.status(400).send('Fichier manquant')
    const fullPath = filename.includes(':') ? filename : path.join(desktop, filename)
    
    const psCommand = `
        Add-Type -AssemblyName System.Drawing;
        $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('${fullPath.replace(/'/g, "''")}');
        $bitmap = $icon.ToBitmap();
        $ms = New-Object System.IO.MemoryStream;
        $bitmap.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png);
        [Convert]::ToBase64String($ms.ToArray());
        $bitmap.Dispose();
        $icon.Dispose();
        $ms.Dispose();
    `.replace(/\r?\n|\r/g, " ")

    exec(`powershell -NoProfile -Command "${psCommand}"`, (err, stdout) => {    // Exécute la commande
        if (err || !stdout) {   // Renvoie l'image "pas d'image" s'il y a une erreur ou si le fichier n'a pas d'icône
            const fallback = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
            res.writeHead(200, { 'Content-Type': 'image/gif' })
            return res.end(fallback)
        }
        
        const imgBuffer = Buffer.from(stdout.trim(), 'base64')
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imgBuffer.length
        })
        res.end(imgBuffer)
    })
})

app.post('/exec', (req, res) => {   // Exécute ou ouvre le fichier / dossier ciblé
    const {path: targetPath} = req.body
    const finalPath = targetPath.includes(':') ? targetPath : path.join(desktop, targetPath)

    exec(`start "" "${finalPath}"`, (err) => {
        if (err) return res.status(500).json({error: err.message})
        res.json({ok: true})
    })
})

/* -- Settings Page -- */

app.get('/settingsModules', (req, res) => { // Renvoie les données des modules
    res.json(db.prepare('select * from settingsModules order by module').all())
})

app.get('/settingsThemes', (req, res) => {  // Renvoie le thème global
    res.json(db.prepare('select * from settingsThemes').all())
})

app.post('/settingsModules/insert', (req, res) => { // Insert les modules manquant
    const {module, actif, top, left, width, height} = req.body
    db.prepare('insert into settingsModules values (?, ?, ?, ?, ?, ?)').run(module, actif, top, left, width, height)
    res.json({ok: true})
})

app.post('/settingsThemes/insert', (req, res) => {  // Insert le thème par défaut
    const {theme} = req.body
    db.prepare('insert into settingsThemes values (?)').run(theme)
    res.json({ok: true})
})

app.patch('/settingsModules/update/:id', (req, res) => {    // Met à jour les données du module ciblé
    const {actif, top, left, width, height} = req.body
    db.prepare('update settingsModules set actif = ?, top = ?, left = ?, width = ?, height = ? where module = ?').run(actif, top, left, width, height, req.params.id)
    res.json({ok: true})
})

app.patch('/settingsThemes/update', (req, res) => { // Met à jour le thème global
    const {theme} = req.body
    db.prepare('update settingsThemes set theme = ?').run(theme)
    res.json({ok: true})
})

app.get('/settings/background', (req, res) => { // Récupère les informations sur le fond d'écran
    res.json(db.prepare('select * from background').all())
})

app.post('/settings/background/insert', (req, res) => { // Vérifie l'emplacement du fond d'écran et met à jour si le chemin enregistré est obsolète ou manquant
    try {
        const username = process.env.USERNAME
        const uniqueFileName = "mon_fond_unique_lively_xyz"; 

        const command = `powershell -Command "(Get-ChildItem -Path 'C:\\Users\\${username}\\AppData\\Local' -Filter '${uniqueFileName}.*' -Recurse -ErrorAction SilentlyContinue).FullName | Where-Object { $_ -like '*Lively Wallpaper*'}"`;
        const stdout = execSync(command).toString().trim(); // Recherche le dossier créé par Lively grâce au nom unique du fond d'écran

        var path = stdout.split(/\r?\n/).filter(line => line.trim() !== '')
        path = path.toString().split('\\')
        const extension = path[path.length - 1].split('.')

        var directory = ''
        for (let i = 0; i < path.length - 1; i++){
            directory += path[i] + '/'
        }

        if (db.prepare('select count(*) as nb from background').get()['nb'] == 0){  // Si aucun chemin n'existait
            db.prepare('insert into background values(?, ?)').run(directory, extension[1])
        } else if (db.prepare('select directory from background').get()['directory'] !== directory) {   // Si le chemin existant est obsolète
            db.prepare('update background set directory = ?, extension = ?').run(directory, extension[1])
        }
        
        res.json({ok: true})
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/background/image', (req, res) => {    // Vérifie l'existance du fond d'écran et renvoie son extension
    try {
        const bg = db.prepare('select * from background').get();
        if (!bg) return res.status(404).json({ error: 'Pas de fond défini en BDD', code: 'FOLDER_CHANGED' });
        const fullPath = path.resolve(bg.directory.replace(/\//g, '\\') + 'mon_fond_unique_lively_xyz.' + bg.extension);    // Rend le chemin lisible par Windows

        if (!fs.existsSync(fullPath)) { // Vérifie l'existence du fichier au chemin enregistré
            return res.status(404).json({ error: 'Fichier ou dossier introuvable sur le disque', code: 'FOLDER_CHANGED' });
        }

        fs.readFile(fullPath, (err, data) => {  // Permet de contourner le "File Watcher" de Lively (rechargement infini)
            if (err) return res.status(500).json({ error: "Erreur de lecture de l'image" });
            
            const contentType = (bg.extension === 'jpg' || bg.extension === 'jpeg') ? 'image/jpeg' : 'image/png';
            
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length
            });
            res.end(data);
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur serveur" });
    }
})

app.post('/settings/background/update', express.raw({ type: 'application/octet-stream', limit: '50mb' }), (req, res) => {   // Écrase le fond d'écran par un nouveau sélectionné
    try {
        const bgConfig = db.prepare('select * from background').get();
        if (!bgConfig) return res.status(404).json({ error: "Aucun dossier initialisé dans la BDD." });

        const directory = bgConfig.directory;
        const oldExtension = bgConfig.extension;
        
        const newExtensionWithDot = req.headers['x-file-extension'] || '.png';  // Récupère l'extension du nouveau fichier
        const newExtension = newExtensionWithDot.replace('.', '').toLowerCase();

        const uniqueFileName = "mon_fond_unique_lively_xyz";
        const oldFilePath = path.join(directory, `${uniqueFileName}.${oldExtension}`);
        const newFilePath = path.join(directory, `${uniqueFileName}.${newExtension}`);

        if (fs.existsSync(oldFilePath)) {   // Dissocie l'ancien fond d'écran
            fs.unlinkSync(oldFilePath);
        }

        fs.writeFileSync(newFilePath, req.body);    // Réécrit le fond d'écran

        db.prepare('update background set extension = ?').run(newExtension);    // Met à jour l'extension

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* -- Lancement du serveur -- */

app.listen(3000, () => console.log('Serveur widgets lancé'))