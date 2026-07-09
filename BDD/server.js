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
try {
    if (db.prepare('select count(*) as nb from desktop').get()['nb'] == 0) {
        desktop = execSync(`powershell -Command "[Environment]::GetFolderPath('Desktop')"`).toString().trim().replace(/\\/g, '/');
        console.log(desktop)
        db.prepare('insert into desktop values(?)').run(desktop)
    } else desktop = db.prepare('select path from desktop').get()['path']
} catch (e) {
    res.status(500).json({ error: "Impossible de trouver le bureau" })
}


app.get('/notes', (req, res) => {
    res.json(db.prepare('select * from notes').all())
})

app.post('/notes', (req, res) => {
    const {title, desc, top, left, zInd, r, g, b} = req.body
    const result = db.prepare('insert into notes(title, desc, top, left, zInd, r, g, b) values (?, ?, ?, ?, ?, ?, ?, ?)').run(title, desc, top, left, zInd, r, g, b)
    res.json({id: result.lastInsertRowid})
})

app.patch('/notes/:id', (req, res) => {
    const {title, desc, top, left, zInd} = req.body
    db.prepare('update notes set title = ?, desc = ?, top = ?, left = ?, zInd = ? where id = ?').run(title, desc, top, left, zInd, req.params.id)
    res.json({ok: true})
})

app.delete('/notes/:id', (req, res) => {
    db.prepare('delete from notes where id = ?').run(req.params.id)
    res.json({ok: true})
})


app.get('/calendar', (req, res) => {
    res.json(db.prepare('select * from calendar').all())
})

app.post('/calendar', (req, res) => {
    const {titre, date, deb, fin, desc} = req.body
    const result = db.prepare('insert into calendar(titre, date, deb, fin, desc) values (?, ?, ?, ?, ?)').run(titre, date, deb, fin, desc)
    res.json({id: result.lastInsertRowid})
})

app.patch('/calendar/:id', (req, res) => {
    const {titre, date, deb, fin, desc} = req.body
    db.prepare('update calendar set titre = ?, date = ?, deb = ?, fin = ?, desc = ? where id = ?').run(titre, date, deb, fin, desc, req.params.id)
    res.json({ok: true})
})

app.delete('/calendar/:id', (req, res) => {
    db.prepare('delete from calendar where id = ?').run(req.params.id)
    res.json({ok: true})
})


app.get('/view', (req, res) => {
    res.json(db.prepare('select * from view').all())
})

app.post('/view/update', (req, res) => {
    const {view} = req.body
    const current = db.prepare('select * from view').get()

    if (!current){
        db.prepare('insert into view values(?)').run(view)
    } else db.prepare('update view set currentView = ?').run(view)
    res.json({ ok: true })
})


function getWindowsIcon(filePath) {
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

app.get('/bureau', (req, res) => {
    const query = req.query.search
    
    if (!query){
        try {
            const files = fs.readdirSync(desktop)
            const filteredFiles = files.filter(file => 
                file.toLowerCase() !== 'desktop.ini' && 
                file.toLowerCase() !== 'ntuser.dat'
            )
            return res.json(filteredFiles.map(f => ({ nom: f, chemin: path.join(desktop, f) })))
        } catch (e) {
            res.status(500).json({ error: "Impossible de lire le bureau" })
        }
    }
    
    const safeQuery = query.replace(/['"*;]/g, '')
    const searchPath = [
        'C:/Users/joang',
        'D:/',
        'E:/',
        'F:/'
    ]
    const psPaths = "@(" + searchPath.map(p => `'${p.replace(/\//g, '\\')}'`).join(',') + ")"
    const psCommand = `
        ${psPaths} | ForEach-Object { 
            Get-ChildItem -Path $_ -Filter '*${safeQuery}*' -Recurse -ErrorAction SilentlyContinue | 
            Where-Object { $_.FullName -notmatch '\\\\AppData\\\\' } 
        } | Select-Object -First 100 | ForEach-Object { $_.FullName }
    `.replace(/\r?\n|\r/g, " ")

    exec(`powershell -NoProfile -Command "${psCommand}"`, (err, stdout) => {
        if (err || !stdout) {
            return res.json([])
        }

        const paths = stdout.trim().split(/\r?\n/).filter(p => p.trim() !== '')
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

app.get('/icone', (req, res) => {
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

    exec(`powershell -NoProfile -Command "${psCommand}"`, (err, stdout) => {
        if (err || !stdout) {
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

app.post('/exec', (req, res) => {
    const {path: targetPath} = req.body
    const finalPath = targetPath.includes(':') ? targetPath : path.join(desktop, targetPath)

    exec(`start "" "${finalPath}"`, (err) => {
        if (err) return res.status(500).json({error: err.message})
        res.json({ok: true})
    })
})


/* -- CUSTOMIZER -- */

app.get('/settingsModules', (req, res) => {
    res.json(db.prepare('select * from settingsModules order by module').all())
})

app.get('/settingsThemes', (req, res) => {
    res.json(db.prepare('select * from settingsThemes').all())
})

app.post('/settingsModules/insert', (req, res) => {
    const {module, actif, top, left, width, height} = req.body
    db.prepare('insert into settingsModules values (?, ?, ?, ?, ?, ?)').run(module, actif, top, left, width, height)
    res.json({ok: true})
})

app.post('/settingsThemes/insert', (req, res) => {
    const {theme} = req.body
    db.prepare('insert into settingsThemes values (?)').run(theme)
    res.json({ok: true})
})

app.patch('/settingsModules/update/:id', (req, res) => {
    const {actif, top, left, width, height} = req.body
    db.prepare('update settingsModules set actif = ?, top = ?, left = ?, width = ?, height = ? where module = ?').run(actif, top, left, width, height, req.params.id)
    res.json({ok: true})
})

app.patch('/settingsThemes/update', (req, res) => {
    const {theme} = req.body
    db.prepare('update settingsThemes set theme = ?').run(theme)
    res.json({ok: true})
})

app.get('/settings/background', (req, res) => {
    res.json(db.prepare('select * from background').all())
})

app.post('/settings/background/insert', (req, res) => {
    try {
        const username = process.env.USERNAME
        const uniqueFileName = "mon_fond_unique_lively_xyz"; 

        const command = `powershell -Command "(Get-ChildItem -Path 'C:\\Users\\${username}\\AppData' -Filter '${uniqueFileName}.*' -Recurse -ErrorAction SilentlyContinue).FullName | Where-Object { $_ -like '*Lively Wallpaper*'}"`;
        const stdout = execSync(command).toString().trim();

        var path = stdout.split(/\r?\n/).filter(line => line.trim() !== '')
        path = path.toString().split('\\')
        const extension = path[path.length - 1].split('.')

        var directory = ''
        for (let i = 0; i < path.length - 1; i++){
            directory += path[i] + '/'
        }

        if (db.prepare('select count(*) as nb from background').get()['nb'] == 0){
            db.prepare('insert into background values(?, ?)').run(directory, extension[1])
        } else if (db.prepare('select directory from background').get()['directory'] !== directory) {
            db.prepare('update background set directory = ?').run(directory)
        }
        
        res.json({ok: true})
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/background/image', (req, res) => {
    const bg = db.prepare('select * from background').get()
    if (!bg) return res.status(404).json({ error: 'Pas de fond défini' })
    
    const fullPath = path.resolve(bg.directory.replace(/\//g, '\\') + 'mon_fond_unique_lively_xyz.' + bg.extension)
    res.sendFile(fullPath)
})

app.post('/settings/background/update', express.raw({ type: 'application/octet-stream', limit: '50mb' }), (req, res) => {
    try {
        const bgConfig = db.prepare('select * from background').get();
        if (!bgConfig) {
            return res.status(404).json({ error: "Aucun dossier initialisé dans la BDD." });
        }

        const directory = bgConfig.directory;
        const oldExtension = bgConfig.extension;
        
        const newExtensionWithDot = req.headers['x-file-extension'] || '.png';
        const newExtension = newExtensionWithDot.replace('.', '').toLowerCase();

        const uniqueFileName = "mon_fond_unique_lively_xyz";
        const oldFilePath = path.join(directory, `${uniqueFileName}.${oldExtension}`);
        const newFilePath = path.join(directory, `${uniqueFileName}.${newExtension}`);

        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }

        fs.writeFileSync(newFilePath, req.body);

        const livelyInfoPath = path.join(directory, 'LivelyInfo.json');
        if (fs.existsSync(livelyInfoPath)) {
            let infoData = JSON.parse(fs.readFileSync(livelyInfoPath, 'utf-8'));
            infoData.FileName = `${uniqueFileName}.${newExtension}`;
            infoData.Type = 2;
            fs.writeFileSync(livelyInfoPath, JSON.stringify(infoData, null, 2), 'utf-8');
        }

        db.prepare('update background set extension = ?').run(newExtension);

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('Serveur widgets lancé'))